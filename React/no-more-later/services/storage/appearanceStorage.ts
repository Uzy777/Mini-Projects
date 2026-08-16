import AsyncStorage from "@react-native-async-storage/async-storage";

import { APPEARANCE_STORAGE_KEY } from "@/constants/storageKeys";

import type { AccentColourId, ColourMode } from "@/types/appearance";

export type AppearancePreferences = {
    colourMode: ColourMode;
    accentColour: AccentColourId;
};

function isColourMode(value: unknown): value is ColourMode {
    return value === "system" || value === "light" || value === "dark" || value === "amoled";
}

function isAccentColourId(value: unknown): value is AccentColourId {
    return value === "indigo" || value === "blue" || value === "emerald" || value === "amber" || value === "rose" || value === "violet";
}

export async function loadAppearancePreferences(): Promise<AppearancePreferences | null> {
    const storedPreferences = await AsyncStorage.getItem(APPEARANCE_STORAGE_KEY);

    if (!storedPreferences) {
        return null;
    }

    try {
        const parsedPreferences = JSON.parse(storedPreferences);

        if (!isColourMode(parsedPreferences.colourMode) || !isAccentColourId(parsedPreferences.accentColour)) {
            return null;
        }

        return {
            colourMode: parsedPreferences.colourMode,
            accentColour: parsedPreferences.accentColour,
        };
    } catch {
        return null;
    }
}

export async function saveAppearancePreferences(preferences: AppearancePreferences) {
    await AsyncStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(preferences));
}
