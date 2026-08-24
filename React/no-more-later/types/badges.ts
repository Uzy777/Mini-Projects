export const BADGE_IDS = [
    "focus_legend",
    "master_of_time",
    "streak_champion",
    "task_master",
    "early_bird",
    "night_owl",
    "weekend_warrior",
] as const;

export type BadgeId = (typeof BADGE_IDS)[number];

export const BADGE_TIERS = ["bronze", "silver", "gold", "platinum", "diamond"] as const;

export type BadgeTier = (typeof BADGE_TIERS)[number];

export type BadgeUnlock = {
    badgeId: BadgeId;
    tier: BadgeTier;
    xpAwarded: number;
    unlockedAt: string;
};

export type BadgeUnlockAward = BadgeUnlock & {
    totalXp: number;
};

export type BadgeProgressMetrics = Record<BadgeId, number>;
