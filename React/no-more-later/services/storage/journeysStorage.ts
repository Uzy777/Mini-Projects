import AsyncStorage from "@react-native-async-storage/async-storage";

import { JOURNEYS_STORAGE_KEY } from "../../constants/storageKeys";

import type { Journey } from "../../types/models";

export async function getJourneys(): Promise<Journey[]> {
    const storedJourneys = await AsyncStorage.getItem(JOURNEYS_STORAGE_KEY);

    return storedJourneys ? JSON.parse(storedJourneys) : [];
}

export async function saveJourneys(journeys: Journey[]): Promise<void> {
    await AsyncStorage.setItem(JOURNEYS_STORAGE_KEY, JSON.stringify(journeys));
}
