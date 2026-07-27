import { Alert, Platform } from "react-native";

type ConfirmDeleteOptions = {
    title: string;
    message: string;
    onConfirm: () => void;
};

export function confirmDelete({ title, message, onConfirm }: ConfirmDeleteOptions) {
    if (Platform.OS === "web") {
        const confirmed = window.confirm(`${title}\n\n${message}`);

        if (confirmed) {
            onConfirm();
        }

        return;
    }

    Alert.alert(title, message, [
        {
            text: "Cancel",
            style: "cancel",
        },
        {
            text: "Delete",
            style: "destructive",
            onPress: onConfirm,
        },
    ]);
}
