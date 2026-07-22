import { Pressable, StyleSheet, Text, View } from "react-native";

type ActiveSessionStatus = "In progress" | "Paused" | "Ready for review";

type ActiveFocusSessionCardProps = {
    questTitle: string;
    status: ActiveSessionStatus;
    onReturn: () => void;
};

export function ActiveFocusSessionCard({ questTitle, status, onReturn }: ActiveFocusSessionCardProps) {
    const buttonText = status === "Ready for review" ? "Review Session" : "Return to Session";

    return (
        <View style={styles.activeSessionCard}>
            <Text style={styles.activeSessionLabel}>Active Focus Session</Text>

            <Text style={styles.activeSessionTitle}>{questTitle}</Text>

            <Text style={styles.activeSessionStatus}>{status}</Text>

            <Pressable style={styles.activeSessionButton} onPress={onReturn}>
                <Text style={styles.activeSessionButtonText}>{buttonText}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    activeSessionCard: {
        width: "100%",
        marginTop: 20,
        padding: 18,
        borderRadius: 12,
        backgroundColor: "#ffffff",
    },
    activeSessionLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#666666",
    },
    activeSessionTitle: {
        marginTop: 6,
        fontSize: 18,
        fontWeight: "700",
    },
    activeSessionStatus: {
        marginTop: 8,
        fontSize: 14,
        color: "#555555",
    },
    activeSessionButton: {
        marginTop: 16,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#222222",
        alignItems: "center",
    },
    activeSessionButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#ffffff",
    },
});
