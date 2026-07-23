import { Pressable, StyleSheet, Text, View } from "react-native";

type ActiveSessionNoticeProps = {
    message: string;
    showReturnButton: boolean;
    onReturn: () => void;
};

export function ActiveSessionNotice({ message, showReturnButton, onReturn }: ActiveSessionNoticeProps) {
    if (!message && !showReturnButton) {
        return null;
    }

    return (
        <View style={styles.noticeContainer}>
            {message && <Text style={styles.sessionMessage}>{message}</Text>}

            {showReturnButton && (
                <Pressable style={styles.returnButton} onPress={onReturn}>
                    <Text style={styles.returnButtonText}>Return to active session</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    noticeContainer: {
        width: "100%",
    },
    sessionMessage: {
        marginTop: 16,
        fontSize: 14,
        lineHeight: 20,
        color: "#b42318",
        textAlign: "center",
    },
    returnButton: {
        marginTop: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: "#222222",
        alignItems: "center",
    },
    returnButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#ffffff",
    },
});
