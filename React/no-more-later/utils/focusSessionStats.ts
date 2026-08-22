import type { FocusSessionRecord } from "../types/models";
import { MINIMUM_XP_FOCUS_SECONDS } from "../constants/xp";

function isFocusSession(session: FocusSessionRecord) {
    return session.sessionKind !== "short_break" && session.sessionKind !== "long_break";
}

function isStreakQualifyingFocusSession(session: FocusSessionRecord) {
    if (!isFocusSession(session) || session.xpCreditStatus === "unverified") return false;

    const actualFocusedSeconds = session.actualSeconds
        ?? (session.xpVersion === 2 ? 0 : session.plannedMinutes * 60);

    return actualFocusedSeconds >= MINIMUM_XP_FOCUS_SECONDS;
}

export type TodayFocusSummary = {
    sessionCount: number;
    focusedSeconds: number;
    focusedMinutes: number;
};

function getLocalDateKey(date: Date) {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getFocusedDateKeys(sessions: FocusSessionRecord[]) {
    return new Set(sessions.filter(isStreakQualifyingFocusSession).map((session) => getLocalDateKey(new Date(session.completedAt))));
}

export type FocusWeekDay = {
    dateKey: string;
    label: string;
    isFocused: boolean;
    isToday: boolean;
};

export function calculateTodayFocusSummary(sessions: FocusSessionRecord[]): TodayFocusSummary {
    const todayDateKey = getLocalDateKey(new Date());

    const todaysSessions = sessions.filter((session) => {
        if (!isFocusSession(session)) return false;
        const completedDate = new Date(session.completedAt);

        return getLocalDateKey(completedDate) === todayDateKey;
    });

    const focusedSeconds = todaysSessions.reduce((total, session) => {
        const sessionSeconds = session.actualSeconds ?? session.plannedMinutes * 60;

        return total + sessionSeconds;
    }, 0);

    return {
        sessionCount: todaysSessions.length,
        focusedSeconds,
        focusedMinutes: Math.floor(focusedSeconds / 60),
    };
}

export function calculateTotalFocusedSeconds(sessions: FocusSessionRecord[]) {
    return sessions.filter(isFocusSession).reduce((total, session) => {
        const sessionSeconds = session.actualSeconds ?? session.plannedMinutes * 60;

        return total + sessionSeconds;
    }, 0);
}

export function calculateCurrentStreak(sessions: FocusSessionRecord[]) {
    const sessionDateKeys = getFocusedDateKeys(sessions);

    const today = new Date();

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let currentDate: Date;

    if (sessionDateKeys.has(getLocalDateKey(today))) {
        currentDate = new Date(today);
    } else if (sessionDateKeys.has(getLocalDateKey(yesterday))) {
        currentDate = new Date(yesterday);
    } else {
        return 0;
    }

    let streak = 0;

    while (sessionDateKeys.has(getLocalDateKey(currentDate))) {
        streak += 1;

        currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
}

export function calculateBestStreak(sessions: FocusSessionRecord[]) {
    const orderedDayNumbers = [...getFocusedDateKeys(sessions)]
        .sort()
        .map((dateKey) => {
            const [year, month, day] = dateKey.split("-").map(Number);
            return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
        });

    let bestStreak = 0;
    let runningStreak = 0;
    let previousDay: number | null = null;

    orderedDayNumbers.forEach((dayNumber) => {
        runningStreak = previousDay !== null && dayNumber === previousDay + 1 ? runningStreak + 1 : 1;
        bestStreak = Math.max(bestStreak, runningStreak);
        previousDay = dayNumber;
    });

    return bestStreak;
}

export function getCurrentWeekFocusDays(sessions: FocusSessionRecord[], referenceDate = new Date()): FocusWeekDay[] {
    const focusedDateKeys = getFocusedDateKeys(sessions);
    const todayKey = getLocalDateKey(referenceDate);
    const weekStart = new Date(referenceDate);
    const daysSinceMonday = (weekStart.getDay() + 6) % 7;

    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - daysSinceMonday);

    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + index);
        const dateKey = getLocalDateKey(date);

        return {
            dateKey,
            label: date.toLocaleDateString(undefined, { weekday: "narrow" }),
            isFocused: focusedDateKeys.has(dateKey),
            isToday: dateKey === todayKey,
        };
    });
}

export function findLatestUnfinishedSession(sessions: FocusSessionRecord[]): FocusSessionRecord | undefined {
    const checkedQuestIds = new Set<string>();

    for (const session of sessions) {
        if (!session.questId || session.sessionKind === "quick" || !isFocusSession(session)) {
            continue;
        }

        if (checkedQuestIds.has(session.questId)) {
            continue;
        }

        checkedQuestIds.add(session.questId);

        if (session.outcome !== "completed" && session.nextAction.trim()) {
            return session;
        }
    }

    return undefined;
}
