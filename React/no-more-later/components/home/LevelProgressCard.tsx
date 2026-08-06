import { StyleSheet, Text, View } from "react-native";

import { colours, radius, spacing } from "../../constants/design";

type LevelProgressCardProps = {
    level: number;
    xpIntoLevel: number;
    xpRequired: number;
};

export function LevelProgressCard({ level, xpIntoLevel, xpRequired }: LevelProgressCardProps) {
    const progressPercentage = xpRequired > 0 ? Math.min(Math.max((xpIntoLevel / xpRequired) * 100, 0), 100) : 0;

    const xpUntilNextLevel = Math.max(xpRequired - xpIntoLevel, 0);

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.headingContainer}>
                    <Text style={styles.label}>LEVEL PROGRESS</Text>

                    <Text style={styles.levelText}>Level {level}</Text>
                </View>

                <View style={styles.xpBadge}>
                    <Text style={styles.xpText}>
                        {xpIntoLevel} / {xpRequired} XP
                    </Text>
                </View>
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

            <View style={styles.footer}>
                <Text style={styles.remainingXpText}>
                    {xpUntilNextLevel} XP until Level {level + 1}
                </Text>

                <Text style={styles.percentageText}>{Math.round(progressPercentage)}%</Text>
            </View>
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
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: spacing.md,
    },

    headingContainer: {
        flex: 1,
    },

    label: {
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 0.7,
        color: colours.textMuted,
    },

    levelText: {
        marginTop: spacing.xs,
        fontSize: 22,
        lineHeight: 28,
        fontWeight: "800",
        color: colours.text,
    },

    xpBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: radius.pill,
        backgroundColor: colours.primarySoft,
    },

    xpText: {
        fontSize: 12,
        fontWeight: "700",
        color: colours.primary,
    },

    progressTrack: {
        width: "100%",
        height: 10,
        marginTop: spacing.lg,
        borderRadius: radius.pill,
        backgroundColor: colours.primarySoft,
        overflow: "hidden",
    },

    progressFill: {
        height: "100%",
        borderRadius: radius.pill,
        backgroundColor: colours.primary,
    },

    footer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.md,
        marginTop: spacing.sm,
    },

    remainingXpText: {
        flex: 1,
        fontSize: 13,
        color: colours.textMuted,
    },

    percentageText: {
        fontSize: 13,
        fontWeight: "700",
        color: colours.primary,
    },
});
