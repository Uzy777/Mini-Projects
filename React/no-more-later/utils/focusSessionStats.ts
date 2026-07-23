import type { FocusSessionRecord } from "../types/models";

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

export function calculateTodayFocusSummary(sessions: FocusSessionRecord[]): TodayFocusSummary {
    const todayDateKey = getLocalDateKey(new Date());

    const todaysSessions = sessions.filter((session) => {
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

export function calculateCurrentStreak(sessions: FocusSessionRecord[]) {
    const sessionDateKeys = new Set(sessions.map((session) => getLocalDateKey(new Date(session.completedAt))));

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

export function findLatestUnfinishedSession(sessions: FocusSessionRecord[]): FocusSessionRecord | undefined {
    const checkedQuestIds = new Set<string>();

    for (const session of sessions) {
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
