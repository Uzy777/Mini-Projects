import AsyncStorage from "@react-native-async-storage/async-storage";

import { APPEARANCE_STORAGE_KEY } from "@/constants/storageKeys";

import type { AccentColourId, ColourMode, BackdropId } from "@/types/appearance";

export type AppearancePreferences = {
    colourMode: ColourMode;
    accentColour: AccentColourId;
    backdrop: BackdropId;
};

function isColourMode(value: unknown): value is ColourMode {
    return value === "system" || value === "light" || value === "dark" || value === "amoled";
}

function isBackdropId(value: unknown): value is BackdropId {
    return value === "none" || value === "mist" || value === "hills" || value === "forest" || value === "waves";
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
            backdrop: isBackdropId(parsedPreferences.backdrop) ? parsedPreferences.backdrop : "none",
        };
    } catch {
        return null;
    }
}

export async function saveAppearancePreferences(preferences: AppearancePreferences) {
    await AsyncStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(preferences));
}
