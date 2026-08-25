import AsyncStorage from "@react-native-async-storage/async-storage";

import { ONBOARDING_COMPLETED_STORAGE_KEY } from "@/constants/storageKeys";

export async function getOnboardingCompleted() {
    return (await AsyncStorage.getItem(ONBOARDING_COMPLETED_STORAGE_KEY)) === "true";
}

export async function setOnboardingCompleted() {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_STORAGE_KEY, "true");
}
