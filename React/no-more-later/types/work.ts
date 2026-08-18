export type WorkStatus = "active" | "completed";

export type WorkJourney = {
    id: string;
    title: string;
    status: WorkStatus;
};

export type WorkQuest = {
    id: string;
    title: string;
    status: WorkStatus;
    journeyId?: string;
};
