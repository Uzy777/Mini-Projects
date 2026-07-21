export type JourneyStatus = "active" | "completed";

export type QuestStatus = "active" | "completed";

export type SessionOutcome = "completed" | "progressed" | "blocked" | "stopped";

export type Journey = {
    id: string;
    title: string;
    status?: JourneyStatus;
};

export type Quest = {
    id: string;
    title: string;
    status?: QuestStatus;
    nextAction?: string;
    lastAccomplishment?: string;
};

export type FocusSessionRecord = {
    id: string;
    journeyId: string;
    questId: string;
    questTitle: string;
    plannedMinutes: number;
    actualSeconds?: number;
    outcome: SessionOutcome;
    accomplishment: string;
    nextAction: string;
    earnedXp: number;
    completedAt: string;
};
