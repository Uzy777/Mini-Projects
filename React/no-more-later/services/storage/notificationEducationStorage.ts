import AsyncStorage from "@react-native-async-storage/async-storage";

import { NOTIFICATION_EDUCATION_COMPLETED_STORAGE_KEY } from "@/constants/storageKeys";

export async function getNotificationEducationCompleted(): Promise<boolean> {
    return (await AsyncStorage.getItem(NOTIFICATION_EDUCATION_COMPLETED_STORAGE_KEY)) === "true";
}

export async function setNotificationEducationCompleted(): Promise<void> {
    await AsyncStorage.setItem(NOTIFICATION_EDUCATION_COMPLETED_STORAGE_KEY, "true");
}
