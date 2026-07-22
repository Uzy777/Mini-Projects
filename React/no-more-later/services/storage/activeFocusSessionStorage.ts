import AsyncStorage from "@react-native-async-storage/async-storage";

import { ACTIVE_FOCUS_SESSION_STORAGE_KEY } from "../../constants/storageKeys";

import type { ActiveFocusSession } from "../../types/models";

export async function getActiveFocusSession(): Promise<ActiveFocusSession | null> {
    const storedSession = await AsyncStorage.getItem(ACTIVE_FOCUS_SESSION_STORAGE_KEY);

    return storedSession ? JSON.parse(storedSession) : null;
}

export async function saveActiveFocusSession(session: ActiveFocusSession): Promise<void> {
    await AsyncStorage.setItem(ACTIVE_FOCUS_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function clearActiveFocusSession(): Promise<void> {
    await AsyncStorage.removeItem(ACTIVE_FOCUS_SESSION_STORAGE_KEY);
}
