import { FOCUS_RANKS } from "../constants/ranks";

import type { RankDefinition } from "../types/ranks";

export function getFocusRank(level: number): RankDefinition | null {
    const rank = FOCUS_RANKS.find((rank) => level >= rank.minimumLevel && level <= rank.maximumLevel);

    return rank ?? null;
}
