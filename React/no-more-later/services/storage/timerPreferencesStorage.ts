import AsyncStorage from "@react-native-async-storage/async-storage";

import { TIMER_PREFERENCES_STORAGE_KEY } from "@/constants/storageKeys";
import type { TimerMode } from "@/types/models";

export type TimerPreferences = Record<TimerMode, number>;

export const DEFAULT_TIMER_PREFERENCES: TimerPreferences = {
    focus: 25,
    break: 5,
};

export const TIMER_LIMITS: Record<TimerMode, { min: number; max: number; step: number }> = {
    focus: { min: 10, max: 120, step: 5 },
    break: { min: 1, max: 60, step: 1 },
};

export async function getTimerPreferences(): Promise<TimerPreferences> {
    const storedValue = await AsyncStorage.getItem(TIMER_PREFERENCES_STORAGE_KEY);

    if (!storedValue) return DEFAULT_TIMER_PREFERENCES;

    try {
        return normaliseTimerPreferences(JSON.parse(storedValue));
    } catch {
        return DEFAULT_TIMER_PREFERENCES;
    }
}

export async function saveTimerPreferences(preferences: TimerPreferences): Promise<TimerPreferences> {
    const normalisedPreferences = normaliseTimerPreferences(preferences);
    await AsyncStorage.setItem(TIMER_PREFERENCES_STORAGE_KEY, JSON.stringify(normalisedPreferences));
    return normalisedPreferences;
}

export function adjustTimerMinutes(mode: TimerMode, minutes: number, direction: -1 | 1) {
    const limits = TIMER_LIMITS[mode];
    return clampTimerMinutes(mode, minutes + limits.step * direction);
}

function normaliseTimerPreferences(value: unknown): TimerPreferences {
    const candidate = value && typeof value === "object" ? value as Record<string, unknown> : {};
    const legacyBreakMinutes = candidate["short-break"] ?? candidate["long-break"];

    return {
        focus: clampTimerMinutes("focus", Number(candidate.focus ?? DEFAULT_TIMER_PREFERENCES.focus)),
        break: clampTimerMinutes("break", Number(candidate.break ?? legacyBreakMinutes ?? DEFAULT_TIMER_PREFERENCES.break)),
    };
}

function clampTimerMinutes(mode: TimerMode, minutes: number) {
    const limits = TIMER_LIMITS[mode];
    const safeMinutes = Number.isFinite(minutes) ? Math.round(minutes) : DEFAULT_TIMER_PREFERENCES[mode];
    return Math.min(limits.max, Math.max(limits.min, safeMinutes));
}
