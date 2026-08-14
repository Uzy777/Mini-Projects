import { ranks } from "@/constants/ranks";

import type { RankDefinition, RankProgress } from "@/types/ranks";

export function getFocusRank(level: number): RankDefinition | null {
    const rank = ranks.find((rank) => {
        const meetsMinimum = level >= rank.minimumLevel;

        const meetsMaximum = rank.maximumLevel === null || level <= rank.maximumLevel;

        return meetsMinimum && meetsMaximum;
    });

    return rank ?? null;
}

export function getNextFocusRank(level: number): RankDefinition | null {
    const currentRank = getFocusRank(level);

    if (!currentRank) {
        return null;
    }

    const currentRankIndex = ranks.findIndex((rank) => rank.id === currentRank.id);

    const nextRank = ranks[currentRankIndex + 1];

    return nextRank ?? null;
}

export function getRankProgress(level: number): RankProgress | null {
    const rank = getFocusRank(level);

    if (!rank) {
        return null;
    }

    if (rank.maximumLevel === null) {
        return null;
    }

    const levelsInRank = rank.maximumLevel - rank.minimumLevel + 1;

    const levelsCompleted = level - rank.minimumLevel + 1;

    const progressPercentage = (levelsCompleted / levelsInRank) * 100;

    return {
        currentLevel: level,
        minimumLevel: rank.minimumLevel,
        maximumLevel: rank.maximumLevel,
        progressPercentage,
    };
}
