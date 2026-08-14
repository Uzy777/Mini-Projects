import { StyleSheet, Text, View } from "react-native";

import { colours, radius, spacing } from "../../constants/design";
import { RankDisplay } from "@/components/ranks/RankDisplay";

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
            <View style={styles.topRow}>
                <View style={styles.rankArea}>
                    <RankDisplay level={level} />
                </View>

                <View style={styles.levelBadge}>
                    <Text style={styles.levelBadgeText}>Level {level}</Text>
                </View>
            </View>

            <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>LEVEL PROGRESS</Text>

                    <Text style={styles.progressXp}>
                        {xpIntoLevel} / {xpRequired} XP
                    </Text>
                </View>

                <View style={styles.progressTrack}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${progressPercentage}%`,
                            },
                        ]}
                    />
                </View>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    card: {
        backgroundColor: colours.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colours.border,
        padding: spacing.lg,
        gap: spacing.lg,
    },

    topRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: spacing.md,
    },

    rankArea: {
        flex: 1,
        minWidth: 0,
    },

    levelBadge: {
        backgroundColor: colours.primarySoft,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: radius.pill,
        alignSelf: "flex-start",
    },

    levelBadgeText: {
        color: colours.primary,
        fontSize: 13,
        fontWeight: "700",
    },

    progressSection: {
        gap: spacing.sm,
    },

    progressHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.md,
    },

    progressLabel: {
        color: colours.textMuted,
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1,
    },

    progressXp: {
        color: colours.text,
        fontSize: 13,
        fontWeight: "600",
    },

    progressTrack: {
        width: "100%",
        height: 10,
        backgroundColor: colours.primarySoft,
        borderRadius: radius.pill,
        overflow: "hidden",
    },

    progressFill: {
        height: "100%",
        backgroundColor: colours.primary,
        borderRadius: radius.pill,
    },
});
