import AsyncStorage from "@react-native-async-storage/async-storage";

import { getQuestsStorageKey } from "../../constants/storageKeys";

import type { Quest } from "../../types/models";

export async function getQuests(journeyId: string): Promise<Quest[]> {
    const storedQuests = await AsyncStorage.getItem(getQuestsStorageKey(journeyId));

    return storedQuests ? JSON.parse(storedQuests) : [];
}

export async function saveQuests(journeyId: string, quests: Quest[]): Promise<void> {
    await AsyncStorage.setItem(getQuestsStorageKey(journeyId), JSON.stringify(quests));
}

export async function clearQuestsForJourney(journeyId: string): Promise<void> {
    await AsyncStorage.removeItem(getQuestsStorageKey(journeyId));
}
