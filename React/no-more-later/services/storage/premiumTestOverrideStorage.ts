import AsyncStorage from "@react-native-async-storage/async-storage";

import { getPremiumTestOverrideStorageKey } from "@/constants/storageKeys";

export async function loadPremiumTestOverride(userId: string): Promise<boolean> {
    const storedValue = await AsyncStorage.getItem(getPremiumTestOverrideStorageKey(userId));

    return storedValue === "true";
}

export async function savePremiumTestOverride(userId: string, hasPremium: boolean): Promise<void> {
    const storageKey = getPremiumTestOverrideStorageKey(userId);

    if (hasPremium) {
        await AsyncStorage.setItem(storageKey, "true");
        return;
    }

    await AsyncStorage.removeItem(storageKey);
}
