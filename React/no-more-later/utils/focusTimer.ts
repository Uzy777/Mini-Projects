import type { ActiveFocusSession, FocusTimelineEvent } from "@/types/models";

type ActualFocusedSecondsInput = {
    selectedMinutes: number;
    remainingSeconds: number | null;
    isRunning: boolean;
    endTime: number | null;
};

export function getRemainingSecondsFromEndTime(endTime: number): number {
    return Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
}

export function calculateActualFocusedSeconds({ selectedMinutes, remainingSeconds, isRunning, endTime }: ActualFocusedSecondsInput): number {
    const plannedSeconds = selectedMinutes * 60;

    const currentRemainingSeconds = isRunning && endTime !== null ? getRemainingSecondsFromEndTime(endTime) : (remainingSeconds ?? plannedSeconds);

    return Math.max(0, plannedSeconds - currentRemainingSeconds);
}

export function calculateTimelineFocusedSeconds(events: FocusTimelineEvent[]): number {
    let activeStartedAt: number | null = null;
    let focusedMilliseconds = 0;

    events.forEach((event) => {
        const occurredAt = new Date(event.occurredAt).getTime();
        if (!Number.isFinite(occurredAt)) return;

        if (event.type === "started" || event.type === "resumed") {
            if (activeStartedAt === null) activeStartedAt = occurredAt;
            return;
        }

        if ((event.type === "paused" || event.type === "completed") && activeStartedAt !== null) {
            focusedMilliseconds += Math.max(0, occurredAt - activeStartedAt);
            activeStartedAt = null;
        }
    });

    return Math.max(0, Math.round(focusedMilliseconds / 1000));
}

export function getActiveSessionReviewState(session: ActiveFocusSession) {
    const plannedSeconds = session.selectedMinutes * 60;
    const timelineSeconds = calculateTimelineFocusedSeconds(session.timelineEvents ?? []);
    const actualSeconds = Math.min(
        plannedSeconds,
        Math.max(0, session.actualSeconds ?? (timelineSeconds > 0 ? timelineSeconds : plannedSeconds - session.remainingSeconds)),
    );

    return {
        actualSeconds,
        endedEarly: session.endedEarly ?? actualSeconds < plannedSeconds,
    };
}
