export type WorkStatus = "active" | "completed";

export type WorkJourney = {
    id: string;
    title: string;
    status: WorkStatus;
    assetId: WorkAssetId;
};

export type WorkQuest = {
    id: string;
    title: string;
    status: WorkStatus;
    journeyId?: string;
    assetId: WorkAssetId;
};

export type WorkAssetId = "task" | "laptop" | "book" | "fitness" | "home" | "cloud" | "shield" | "creative" | "work" | "study" | "health";
