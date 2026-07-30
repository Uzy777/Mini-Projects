import { Alert, Platform } from "react-native";

export function showMessage(title: string, message: string): void {
    if (Platform.OS === "web") {
        window.alert(`${title}\n\n${message}`);

        return;
    }

    Alert.alert(title, message);
}
