import { STARTING_LEVEL_XP, XP_INCREASE_PER_LEVEL } from "../constants/xp";

export type LevelProgress = {
    level: number;
    xpIntoLevel: number;
    xpRequired: number;
};

export function getXpRequiredForLevel(level: number) {
    return STARTING_LEVEL_XP + (level - 1) * XP_INCREASE_PER_LEVEL;
}

export function calculateLevelProgress(totalXp: number): LevelProgress {
    let level = 1;
    let xpIntoLevel = totalXp;
    let xpRequired = getXpRequiredForLevel(level);

    while (xpIntoLevel >= xpRequired) {
        xpIntoLevel -= xpRequired;
        level += 1;

        xpRequired = getXpRequiredForLevel(level);
    }

    return {
        level,
        xpIntoLevel,
        xpRequired,
    };
}

export function calculateLevel(totalXp: number) {
    return calculateLevelProgress(totalXp).level;
}
