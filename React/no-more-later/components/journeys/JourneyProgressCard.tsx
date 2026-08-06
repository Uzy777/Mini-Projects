import { StyleSheet, Text, View } from "react-native";

import { colours, radius, spacing } from "../../constants/design";

type JourneyProgressCardProps = {
    totalQuestCount: number;
    completedQuestCount: number;
};

export function JourneyProgressCard({ totalQuestCount, completedQuestCount }: JourneyProgressCardProps) {
    const progressPercentage = totalQuestCount > 0 ? Math.round((completedQuestCount / totalQuestCount) * 100) : 0;

    const journeyIsCompleted = totalQuestCount > 0 && completedQuestCount === totalQuestCount;

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.label}>JOURNEY PROGRESS</Text>

                <View style={[styles.percentageBadge, journeyIsCompleted && styles.completedPercentageBadge]}>
                    <Text style={[styles.percentageText, journeyIsCompleted && styles.completedPercentageText]}>{progressPercentage}%</Text>
                </View>
            </View>

            {totalQuestCount === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Add your first Quest to begin making progress.</Text>
                </View>
            ) : (
                <>
                    <Text style={styles.summaryText}>
                        {completedQuestCount} of {totalQuestCount} {totalQuestCount === 1 ? "Quest" : "Quests"} completed
                    </Text>

                    <View style={styles.progressTrack}>
                        <View
                            style={[
                                styles.progressFill,
                                journeyIsCompleted && styles.completedProgressFill,
                                {
                                    width: `${progressPercentage}%` as `${number}%`,
                                },
                            ]}
                        />
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "100%",
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colours.border,
        borderRadius: radius.lg,
        backgroundColor: colours.surface,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.md,
    },

    label: {
        flex: 1,
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 0.7,
        color: colours.textMuted,
    },

    percentageBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: radius.pill,
        backgroundColor: colours.primarySoft,
    },

    percentageText: {
        fontSize: 13,
        fontWeight: "800",
        color: colours.primary,
    },

    completedPercentageBadge: {
        backgroundColor: colours.successSoft,
    },

    completedPercentageText: {
        color: colours.success,
    },

    summaryText: {
        marginTop: spacing.lg,
        fontSize: 15,
        lineHeight: 21,
        color: colours.text,
    },

    progressTrack: {
        width: "100%",
        height: 10,
        marginTop: spacing.md,
        borderRadius: radius.pill,
        backgroundColor: colours.primarySoft,
        overflow: "hidden",
    },

    progressFill: {
        height: "100%",
        borderRadius: radius.pill,
        backgroundColor: colours.primary,
    },

    completedProgressFill: {
        backgroundColor: colours.success,
    },

    emptyState: {
        marginTop: spacing.lg,
        padding: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colours.background,
    },

    emptyText: {
        fontSize: 14,
        lineHeight: 20,
        color: colours.textMuted,
    },
});
