import { FOCUS_RANKS } from "../constants/ranks";

import type { RankDefinition, RankProgress } from "../types/ranks";

export function getFocusRank(level: number): RankDefinition | null {
    const rank = FOCUS_RANKS.find((rank) => level >= rank.minimumLevel && level <= rank.maximumLevel);

    return rank ?? null;
}

export function getNextFocusRank(level: number): RankDefinition | null {
    const currentRankIndex = FOCUS_RANKS.findIndex((rank) => level >= rank.minimumLevel && level <= rank.maximumLevel);

    if (currentRankIndex === -1) {
        return null;
    }

    return FOCUS_RANKS[currentRankIndex + 1] ?? null;
}

export function getRankProgress(level: number): RankProgress | null {
    const rank = getFocusRank(level);

    if (!rank) {
        return null;
    }

    const levelsBetween = rank.maximumLevel - rank.minimumLevel;

    const levelsProgressed = level - rank.minimumLevel;

    const progressPercentage = levelsBetween > 0 ? (levelsProgressed / levelsBetween) * 100 : 100;

    return {
        currentLevel: level,
        minimumLevel: rank.minimumLevel,
        maximumLevel: rank.maximumLevel,
        progressPercentage,
    };
}
