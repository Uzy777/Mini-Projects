import { XP_PER_LEVEL } from "../constants/xp";

export type LevelProgress = {
    level: number;
    xpIntoLevel: number;
    xpRequired: number;
};

export function getXpRequiredForLevel(_level: number) {
    return XP_PER_LEVEL;
}

export function calculateLevelProgress(totalXp: number): LevelProgress {
    const safeTotalXp = Math.max(0, Math.floor(totalXp));
    const level = Math.floor(safeTotalXp / XP_PER_LEVEL) + 1;
    const xpIntoLevel = safeTotalXp % XP_PER_LEVEL;

    return {
        level,
        xpIntoLevel,
        xpRequired: XP_PER_LEVEL,
    };
}

export function calculateLevel(totalXp: number) {
    return calculateLevelProgress(totalXp).level;
}
