import { Pressable, StyleSheet, Text, View } from "react-native";

type ReviewResultCardProps = {
    earnedXp: number;
    totalXp: number;
    reachedLevel: number | null;
    onReturnToJourneys: () => void;
    onViewHistory: () => void;
};

export function ReviewResultCard({ earnedXp, totalXp, reachedLevel, onReturnToJourneys, onViewHistory }: ReviewResultCardProps) {
    return (
        <View style={styles.rewardContainer}>
            <Text style={styles.rewardTitle}>Review complete!</Text>

            <Text style={styles.rewardXp}>+{earnedXp} XP</Text>

            <Text style={styles.totalXp}>Total XP: {totalXp}</Text>

            {reachedLevel !== null && (
                <View style={styles.levelUpContainer}>
                    <Text style={styles.levelUpTitle}>Level Up!</Text>

                    <Text style={styles.levelUpText}>You reached Level {reachedLevel}</Text>
                </View>
            )}

            <Pressable style={styles.primaryButton} onPress={onReturnToJourneys}>
                <Text style={styles.primaryButtonText}>Return to Journeys</Text>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={onViewHistory}>
                <Text style={styles.secondaryButtonText}>View Session History</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    rewardContainer: {
        width: "100%",
        marginTop: 24,
        padding: 20,
        borderRadius: 12,
        backgroundColor: "#ffffff",
        alignItems: "center",
    },
    rewardTitle: {
        fontSize: 22,
        fontWeight: "700",
    },
    rewardXp: {
        marginTop: 12,
        fontSize: 30,
        fontWeight: "700",
    },
    totalXp: {
        marginTop: 6,
        fontSize: 15,
        color: "#666666",
    },
    levelUpContainer: {
        width: "100%",
        marginTop: 18,
        padding: 16,
        borderRadius: 10,
        backgroundColor: "#f0f0f0",
        alignItems: "center",
    },
    levelUpTitle: {
        fontSize: 21,
        fontWeight: "700",
    },
    levelUpText: {
        marginTop: 4,
        fontSize: 15,
        color: "#555555",
    },
    primaryButton: {
        width: "100%",
        marginTop: 20,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: "#222222",
        alignItems: "center",
    },
    primaryButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#ffffff",
    },
    secondaryButton: {
        width: "100%",
        marginTop: 10,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: "#222222",
        borderRadius: 8,
        alignItems: "center",
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#222222",
    },
});
