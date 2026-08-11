export type RankId = "ant" | "hare" | "fox" | "wolf" | "panther";

export type RankDefinition = {
    id: RankId;
    name: string;
    minimumLevel: number;
    maximumLevel: number;
};

export type RankVisualStyle = "emblem" | "animal";

export type RankProgress = {
    currentLevel: number;
    minimumLevel: number;
    maximumLevel: number;
    progressPercentage: number;
};
