import AsyncStorage from "@react-native-async-storage/async-storage";

export async function clearNoMoreLaterStorage(): Promise<void> {
    const allKeys = await AsyncStorage.getAllKeys();

    const noMoreLaterKeys = allKeys.filter(
        (key) => key.startsWith("no-more-later-") || key.startsWith("@no-more-later/"),
    );

    if (noMoreLaterKeys.length === 0) {
        return;
    }

    await AsyncStorage.multiRemove(noMoreLaterKeys);
}
