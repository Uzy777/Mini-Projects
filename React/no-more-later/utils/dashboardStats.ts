import type { FocusSessionRecord, Journey } from "@/types/models";

export type ProgressPeriod = "month" | "fortnight" | "quarter" | "year";

export type ProgressCategory = {
    id: string;
    label: string;
    focusedSeconds: number;
    percentage: number;
};

export type ProgressTrend = {
    labels: string[];
    focusSeconds: number[];
    breakSeconds: number[];
    sessions: number[];
    questsCompleted: number[];
    focusDelta: number | null;
    breakDelta: number | null;
    sessionsDelta: number | null;
    questsDelta: number | null;
};

export function isBreakSession(session: FocusSessionRecord) {
    return session.sessionKind === "short_break" || session.sessionKind === "long_break";
}

export function getLocalDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function getSessionSeconds(session: FocusSessionRecord) {
    return session.actualSeconds ?? session.plannedMinutes * 60;
}

export function formatProgressDuration(totalSeconds: number, compact = false) {
    const safeSeconds = Math.max(0, Math.round(totalSeconds));
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);

    if (hours === 0) {
        return compact ? `${minutes}m` : `${minutes} min`;
    }

    if (minutes === 0) {
        return compact ? `${hours}h` : `${hours} hr`;
    }

    return `${hours}h ${minutes}m`;
}

export function getSessionsForDate(sessions: FocusSessionRecord[], date: Date) {
    const dateKey = getLocalDateKey(date);

    return sessions.filter((session) => getLocalDateKey(new Date(session.completedAt)) === dateKey);
}

export function getWeekDates(referenceDate: Date) {
    const start = startOfWeek(referenceDate);

    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        return date;
    });
}

export function getOverviewStats(sessions: FocusSessionRecord[], referenceDate = new Date(), journeys: Journey[] = []) {
    const focusSessions = sessions.filter((session) => !isBreakSession(session));
    const breakSessions = sessions.filter(isBreakSession);
    const todaySessions = getSessionsForDate(focusSessions, referenceDate);
    const todayBreakSessions = getSessionsForDate(breakSessions, referenceDate);
    const weekDates = getWeekDates(referenceDate);
    const weekValues = weekDates.map((date) => getSessionsForDate(focusSessions, date).reduce((total, session) => total + getSessionSeconds(session), 0));
    const weekSeconds = weekValues.reduce((total, value) => total + value, 0);
    const todaySeconds = todaySessions.reduce((total, session) => total + getSessionSeconds(session), 0);

    return {
        todaySeconds,
        todaySessions: todaySessions.length,
        todayCompleted: todaySessions.filter(
            (session) => session.outcome === "completed" && Boolean(session.questId) && session.sessionKind !== "quick",
        ).length,
        todayXp: todaySessions.reduce((total, session) => total + session.earnedXp, 0),
        todayBreakSeconds: todayBreakSessions.reduce((total, session) => total + getSessionSeconds(session), 0),
        todayBreaks: todayBreakSessions.length,
        streak: calculateStreak(focusSessions, referenceDate),
        weekSeconds,
        weekDates,
        weekValues,
        categories: getCategoryStats(
            focusSessions.filter((session) => isSameWeek(new Date(session.completedAt), referenceDate)),
            journeys,
        ),
    };
}

export function getCategoryStats(sessions: FocusSessionRecord[], journeys: Journey[] = []): ProgressCategory[] {
    const journeyTitles = new Map(journeys.map((journey) => [journey.id, journey.title]));
    const totals = new Map<string, { label: string; focusedSeconds: number }>();

    sessions.filter((session) => !isBreakSession(session)).forEach((session) => {
        const isQuickFocus = session.sessionKind === "quick";
        const id = isQuickFocus ? "quick-focus" : (session.journeyId ?? "standalone");
        const label = isQuickFocus ? "Quick Focus" : session.journeyId ? journeyTitles.get(session.journeyId) ?? "Journey quests" : "Standalone quests";
        const current = totals.get(id);

        totals.set(id, {
            label,
            focusedSeconds: (current?.focusedSeconds ?? 0) + getSessionSeconds(session),
        });
    });

    const totalSeconds = Array.from(totals.values()).reduce((total, category) => total + category.focusedSeconds, 0);

    return Array.from(totals.entries())
        .map(([id, category]) => ({
            id,
            label: category.label,
            focusedSeconds: category.focusedSeconds,
            percentage: totalSeconds > 0 ? Math.round((category.focusedSeconds / totalSeconds) * 100) : 0,
        }))
        .sort((first, second) => second.focusedSeconds - first.focusedSeconds);
}

export function getCalendarDays(month: Date) {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const mondayOffset = (firstDay.getDay() + 6) % 7;
    const gridStart = new Date(firstDay);
    gridStart.setDate(firstDay.getDate() - mondayOffset);

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + index);
        return date;
    });
}

export function getProgressTrend(sessions: FocusSessionRecord[], period: ProgressPeriod, referenceDate = new Date()): ProgressTrend {
    const currentRange = getPeriodRange(period, referenceDate);
    const previousReference = new Date(currentRange.start);
    previousReference.setDate(previousReference.getDate() - 1);
    const previousRange = getPeriodRange(period, previousReference);
    const buckets = buildBuckets(period, currentRange.start, currentRange.end);

    const currentSessions = sessions.filter((session) => isWithinRange(new Date(session.completedAt), currentRange.start, currentRange.end));
    const previousSessions = sessions.filter((session) => isWithinRange(new Date(session.completedAt), previousRange.start, previousRange.end));
    const currentFocusSessions = currentSessions.filter((session) => !isBreakSession(session));
    const previousFocusSessions = previousSessions.filter((session) => !isBreakSession(session));
    const currentBreakSessions = currentSessions.filter(isBreakSession);
    const previousBreakSessions = previousSessions.filter(isBreakSession);

    const focusSeconds = buckets.map((bucket) =>
        currentFocusSessions
            .filter((session) => isWithinRange(new Date(session.completedAt), bucket.start, bucket.end))
            .reduce((total, session) => total + getSessionSeconds(session), 0),
    );
    const breakSeconds = buckets.map((bucket) =>
        currentBreakSessions
            .filter((session) => isWithinRange(new Date(session.completedAt), bucket.start, bucket.end))
            .reduce((total, session) => total + getSessionSeconds(session), 0),
    );
    const sessionCounts = buckets.map(
        (bucket) => currentFocusSessions.filter((session) => isWithinRange(new Date(session.completedAt), bucket.start, bucket.end)).length,
    );
    const completedCounts = buckets.map(
        (bucket) =>
            new Set(
                currentFocusSessions
                    .filter(
                        (session) =>
                            session.outcome === "completed" &&
                            Boolean(session.questId) &&
                            session.sessionKind !== "quick" &&
                            isWithinRange(new Date(session.completedAt), bucket.start, bucket.end),
                    )
                    .map((session) => session.questId as string),
            ).size,
    );

    const currentFocus = currentFocusSessions.reduce((total, session) => total + getSessionSeconds(session), 0);
    const previousFocus = previousFocusSessions.reduce((total, session) => total + getSessionSeconds(session), 0);
    const currentBreak = currentBreakSessions.reduce((total, session) => total + getSessionSeconds(session), 0);
    const previousBreak = previousBreakSessions.reduce((total, session) => total + getSessionSeconds(session), 0);
    const currentCompleted = countCompletedQuests(currentFocusSessions);
    const previousCompleted = countCompletedQuests(previousFocusSessions);

    return {
        labels: buckets.map((bucket) => bucket.label),
        focusSeconds,
        breakSeconds,
        sessions: sessionCounts,
        questsCompleted: completedCounts,
        focusDelta: percentageChange(currentFocus, previousFocus),
        breakDelta: percentageChange(currentBreak, previousBreak),
        sessionsDelta: percentageChange(currentFocusSessions.length, previousFocusSessions.length),
        questsDelta: percentageChange(currentCompleted, previousCompleted),
    };
}

function countCompletedQuests(sessions: FocusSessionRecord[]) {
    return new Set(
        sessions
            .filter((session) => session.outcome === "completed" && Boolean(session.questId) && session.sessionKind !== "quick")
            .map((session) => session.questId as string),
    ).size;
}

function calculateStreak(sessions: FocusSessionRecord[], referenceDate: Date) {
    const keys = new Set(sessions.map((session) => getLocalDateKey(new Date(session.completedAt))));
    const current = new Date(referenceDate);
    current.setHours(0, 0, 0, 0);

    if (!keys.has(getLocalDateKey(current))) {
        current.setDate(current.getDate() - 1);
    }

    let streak = 0;
    while (keys.has(getLocalDateKey(current))) {
        streak += 1;
        current.setDate(current.getDate() - 1);
    }

    return streak;
}

function startOfWeek(date: Date) {
    const start = new Date(date);
    const offset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - offset);
    start.setHours(0, 0, 0, 0);
    return start;
}

function isSameWeek(date: Date, referenceDate: Date) {
    const start = startOfWeek(referenceDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return date >= start && date < end;
}

function getPeriodRange(period: ProgressPeriod, referenceDate: Date) {
    const end = new Date(referenceDate);
    end.setHours(23, 59, 59, 999);
    let start: Date;

    if (period === "fortnight") {
        start = new Date(referenceDate);
        start.setDate(referenceDate.getDate() - 13);
        start.setHours(0, 0, 0, 0);
    } else if (period === "month") {
        start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    } else if (period === "quarter") {
        start = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 2, 1);
    } else {
        start = new Date(referenceDate.getFullYear(), 0, 1);
    }

    return { start, end };
}

function buildBuckets(period: ProgressPeriod, start: Date, end: Date) {
    if (period === "fortnight") {
        return Array.from({ length: 14 }, (_, index) => {
            const bucketStart = new Date(start);
            bucketStart.setDate(start.getDate() + index);
            const bucketEnd = new Date(bucketStart);
            bucketEnd.setHours(23, 59, 59, 999);

            return {
                start: bucketStart,
                end: bucketEnd > end ? end : bucketEnd,
                label: String(bucketStart.getDate()),
            };
        });
    }

    if (period === "month") {
        const weekCount = Math.ceil(end.getDate() / 7);

        return Array.from({ length: weekCount }, (_, index) => {
            const bucketStart = new Date(start);
            bucketStart.setDate(1 + index * 7);
            const bucketEnd = new Date(bucketStart);
            bucketEnd.setDate(bucketStart.getDate() + 6);
            bucketEnd.setHours(23, 59, 59, 999);
            const visibleEnd = bucketEnd > end ? end : bucketEnd;
            return { start: bucketStart, end: visibleEnd, label: `${bucketStart.getDate()}–${visibleEnd.getDate()}` };
        });
    }

    if (period === "quarter") {
        return Array.from({ length: 3 }, (_, index) => {
            const bucketStart = new Date(start.getFullYear(), start.getMonth() + index, 1);
            const bucketEnd = new Date(start.getFullYear(), start.getMonth() + index + 1, 0, 23, 59, 59, 999);
            return { start: bucketStart, end: bucketEnd > end ? end : bucketEnd, label: bucketStart.toLocaleDateString(undefined, { month: "short" }) };
        });
    }

    return Array.from({ length: end.getMonth() + 1 }, (_, index) => {
        const bucketStart = new Date(start.getFullYear(), index, 1);
        const bucketEnd = new Date(start.getFullYear(), index + 1, 0, 23, 59, 59, 999);
        return {
            start: bucketStart,
            end: bucketEnd > end ? end : bucketEnd,
            label: bucketStart.toLocaleDateString(undefined, { month: "short" }),
        };
    });
}

function isWithinRange(date: Date, start: Date, end: Date) {
    return date >= start && date <= end;
}

function percentageChange(current: number, previous: number) {
    if (previous === 0) {
        return current > 0 ? null : 0;
    }

    return Math.round(((current - previous) / previous) * 100);
}
