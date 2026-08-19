export type JourneyStatus = "active" | "completed";

export type QuestStatus = "active" | "completed";

export type SessionOutcome = "completed" | "progressed" | "blocked" | "stopped";

export type FocusTimelineEventType = "started" | "paused" | "resumed" | "completed";

export type FocusTimelineEvent = {
    type: FocusTimelineEventType;
    occurredAt: string;
};

export type Journey = {
    id: string;
    title: string;
    status?: JourneyStatus;
};

export type Quest = {
    id: string;
    title: string;
    status?: QuestStatus;
    doneWhen?: string;
    nextAction?: string;
    lastAccomplishment?: string;
};

export type FocusSessionRecord = {
    id: string;
    journeyId?: string;
    questId?: string;
    questTitle: string;
    sessionKind?: "quest" | "quick";
    plannedMinutes: number;
    actualSeconds?: number;
    outcome: SessionOutcome;
    accomplishment: string;
    nextAction: string;
    earnedXp: number;
    completedAt: string;
    timelineEvents?: FocusTimelineEvent[];
};

export type CreateFocusSessionInput = Omit<FocusSessionRecord, "id">;

export type ActiveFocusSession = {
    id: string;
    questId: string;
    journeyId?: string;
    questTitle: string;
    selectedMinutes: number;
    remainingSeconds: number;
    isRunning: boolean;
    endTime: number | null;
    timelineEvents?: FocusTimelineEvent[];
    source?: "work" | "quick-focus";
};

export type Profile = {
    id: string;
    display_name: string | null;
    daily_focus_goal_minutes: number;
    created_at: string;
};
