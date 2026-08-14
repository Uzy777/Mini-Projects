import { ranks } from "@/constants/ranks";

export type RankId =
    (typeof ranks)[number]["id"];

export type RankDefinition = {
    id: RankId;
    name: string;
    minimumLevel: number;
    maximumLevel: number | null;
};

export type RankProgress = {
    currentLevel: number;
    minimumLevel: number;
    maximumLevel: number | null;
    progressPercentage: number;
};
