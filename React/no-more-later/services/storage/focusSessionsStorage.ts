import AsyncStorage from "@react-native-async-storage/async-storage";

import { FOCUS_SESSIONS_STORAGE_KEY } from "../../constants/storageKeys";

import type { FocusSessionRecord } from "../../types/models";

export async function getFocusSessions(): Promise<FocusSessionRecord[]> {
    const storedSessions = await AsyncStorage.getItem(FOCUS_SESSIONS_STORAGE_KEY);

    return storedSessions ? JSON.parse(storedSessions) : [];
}

export async function saveFocusSessions(sessions: FocusSessionRecord[]): Promise<void> {
    await AsyncStorage.setItem(FOCUS_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
}

export async function addFocusSession(session: FocusSessionRecord): Promise<void> {
    const currentSessions = await getFocusSessions();

    const updatedSessions = [session, ...currentSessions];

    await saveFocusSessions(updatedSessions);
}
