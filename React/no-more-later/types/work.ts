export type WorkStatus = "active" | "completed";

export type WorkJourney = {
    id: string;
    title: string;
    status: WorkStatus;
    assetId: WorkAssetId;
    folderId?: string;
};

export type WorkFolder = {
    id: string;
    title: string;
};

export type WorkQuest = {
    id: string;
    title: string;
    status: WorkStatus;
    journeyId?: string;
    folderId?: string;
    assetId: WorkAssetId;
};

export type WorkAssetId = "task" | "laptop" | "book" | "fitness" | "home" | "cloud" | "shield" | "creative" | "work" | "study" | "health";
