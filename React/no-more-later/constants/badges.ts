import type { ImageSourcePropType } from "react-native";

import type { BadgeId, BadgeTier } from "@/types/badges";

export type BadgeIconName = "target" | "clock" | "flame" | "check" | "sunrise" | "moon" | "calendar";

export type BadgeTierDefinition = {
    tier: BadgeTier;
    threshold: number;
    xp: number;
};

export type BadgeDefinition = {
    id: BadgeId;
    name: string;
    shortDescription: string;
    icon: BadgeIconName;
    tiers: readonly BadgeTierDefinition[];
    requirement: (threshold: number) => string;
};

const SESSION_TIERS = [10, 25, 100, 500, 1_000] as const;
const TIME_TIERS = [5, 10, 50, 250, 1_000] as const;
const STREAK_TIERS = [3, 7, 30, 100, 365] as const;
const TIER_XP = [50, 100, 200, 400, 800] as const;
const TIERS: BadgeTier[] = ["bronze", "silver", "gold", "platinum", "diamond"];

function createTiers(thresholds: readonly number[]): BadgeTierDefinition[] {
    return TIERS.map((tier, index) => ({ tier, threshold: thresholds[index], xp: TIER_XP[index] }));
}

export const BADGE_DEFINITIONS: readonly BadgeDefinition[] = [
    {
        id: "focus_legend",
        name: "Focus Legend",
        shortDescription: "Show up and put in focused work.",
        icon: "target",
        tiers: createTiers(SESSION_TIERS),
        requirement: (threshold) => `Complete ${threshold.toLocaleString()} qualifying Focus Sessions`,
    },
    {
        id: "master_of_time",
        name: "Master of Time",
        shortDescription: "Build a lifetime of focused hours.",
        icon: "clock",
        tiers: createTiers(TIME_TIERS),
        requirement: (threshold) => `Accumulate ${threshold.toLocaleString()} hours of Focus time`,
    },
    {
        id: "streak_champion",
        name: "Streak Champion",
        shortDescription: "Turn focused days into a lasting rhythm.",
        icon: "flame",
        tiers: createTiers(STREAK_TIERS),
        requirement: (threshold) => `Reach a ${threshold.toLocaleString()}-day Focus streak`,
    },
    {
        id: "task_master",
        name: "Task Master",
        shortDescription: "Finish the work you commit to.",
        icon: "check",
        tiers: createTiers(SESSION_TIERS),
        requirement: (threshold) => `Complete ${threshold.toLocaleString()} unique Tasks`,
    },
    {
        id: "early_bird",
        name: "Early Bird",
        shortDescription: "Make focused progress before the day gets busy.",
        icon: "sunrise",
        tiers: createTiers(SESSION_TIERS),
        requirement: (threshold) => `Start ${threshold.toLocaleString()} qualifying sessions before 9:00 AM`,
    },
    {
        id: "night_owl",
        name: "Night Owl",
        shortDescription: "Keep your focus after the rest of the day winds down.",
        icon: "moon",
        tiers: createTiers(SESSION_TIERS),
        requirement: (threshold) => `Start ${threshold.toLocaleString()} qualifying sessions after 10:00 PM`,
    },
    {
        id: "weekend_warrior",
        name: "Weekend Warrior",
        shortDescription: "Keep moving forward on Saturday and Sunday.",
        icon: "calendar",
        tiers: createTiers(SESSION_TIERS),
        requirement: (threshold) => `Complete ${threshold.toLocaleString()} qualifying weekend sessions`,
    },
] as const;

export const BADGE_DEFINITION_BY_ID = Object.fromEntries(
    BADGE_DEFINITIONS.map((definition) => [definition.id, definition]),
) as Record<BadgeId, BadgeDefinition>;

export const BADGE_TIER_ORDER: Record<BadgeTier, number> = {
    bronze: 0,
    silver: 1,
    gold: 2,
    platinum: 3,
    diamond: 4,
};

/**
 * Add the final badge artwork here when it is available. Each badge can have a
 * different image for every tier without changing the gallery or celebration.
 *
 * Example:
 * focus_legend: {
 *     bronze: require("../assets/images/badges/focus-legend-bronze.png"),
 * },
 */
export const BADGE_IMAGE_SOURCES: Partial<Record<BadgeId, Partial<Record<BadgeTier, ImageSourcePropType>>>> = {
    focus_legend: {
        bronze: require("../assets/badges/focus-legend-bronze.png"),
    },
};

export function getBadgeTierDefinition(badgeId: BadgeId, tier: BadgeTier) {
    return BADGE_DEFINITION_BY_ID[badgeId].tiers.find((definition) => definition.tier === tier) ?? null;
}

export function getNextBadgeTierDefinition(badgeId: BadgeId, tier: BadgeTier) {
    const nextIndex = BADGE_TIER_ORDER[tier] + 1;
    return BADGE_DEFINITION_BY_ID[badgeId].tiers[nextIndex] ?? null;
}
