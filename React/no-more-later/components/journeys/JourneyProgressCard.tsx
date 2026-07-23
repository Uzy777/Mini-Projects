import { StyleSheet, Text, View } from "react-native";

type JourneyProgressCardProps = {
    totalQuestCount: number;
    completedQuestCount: number;
};

export function JourneyProgressCard({ totalQuestCount, completedQuestCount }: JourneyProgressCardProps) {
    const progressPercentage = totalQuestCount > 0 ? Math.round((completedQuestCount / totalQuestCount) * 100) : 0;

    return (
        <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Journey progress</Text>

            <View style={styles.progressSummary}>
                <Text style={styles.progressText}>
                    {completedQuestCount} of {totalQuestCount} {totalQuestCount === 1 ? "Quest" : "Quests"} completed
                </Text>

                <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
            </View>

            <View style={styles.progressTrack}>
                <View
                    style={[
                        styles.progressFill,
                        {
                            width: `${progressPercentage}%` as `${number}%`,
                        },
                    ]}
                />
            </View>

            {totalQuestCount === 0 && <Text style={styles.emptyProgressText}>Add your first Quest to begin making progress.</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    progressCard: {
        width: "100%",
        marginTop: 20,
        padding: 18,
        borderRadius: 12,
        backgroundColor: "#ffffff",
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    progressSummary: {
        marginTop: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    progressText: {
        flex: 1,
        fontSize: 14,
        color: "#555555",
    },
    progressPercentage: {
        fontSize: 15,
        fontWeight: "700",
    },
    progressTrack: {
        width: "100%",
        height: 10,
        marginTop: 12,
        borderRadius: 5,
        backgroundColor: "#dddddd",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 5,
        backgroundColor: "#222222",
    },
    emptyProgressText: {
        marginTop: 10,
        fontSize: 13,
        color: "#666666",
    },
});
