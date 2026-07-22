import AsyncStorage from "@react-native-async-storage/async-storage";

import { TOTAL_XP_STORAGE_KEY } from "../../constants/storageKeys";

export async function getTotalXp(): Promise<number> {
    const storedTotalXp = await AsyncStorage.getItem(TOTAL_XP_STORAGE_KEY);

    if (!storedTotalXp) {
        return 0;
    }

    const parsedTotalXp = Number(storedTotalXp);

    return Number.isFinite(parsedTotalXp) ? parsedTotalXp : 0;
}

export async function saveTotalXp(totalXp: number): Promise<void> {
    await AsyncStorage.setItem(TOTAL_XP_STORAGE_KEY, totalXp.toString());
}
