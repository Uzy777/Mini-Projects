import { Image, StyleSheet, Text, View } from "react-native";

import { colours, spacing, radius } from "@/constants/design";
import { getFocusRank, getNextFocusRank, getRankProgress } from "@/utils/rank";
import { getRankImage } from "@/utils/rankImage";

type RankDisplayProps = {
    level: number;
};

export function RankDisplay({ level }: RankDisplayProps) {
    const rank = getFocusRank(level);

    if (!rank) {
        return null;
    }

    const image = getRankImage(rank.id);

    const nextRank = getNextFocusRank(level);

    const rankProgress = getRankProgress(level);

    const totalRankSteps = rank.maximumLevel !== null ? rank.maximumLevel - rank.minimumLevel : 0;
    const completedRankSteps = level - rank.minimumLevel;

    return (
        <View style={styles.container}>
            <View style={styles.badgeContainer}>
                <View style={styles.imageFrame}>
                    <Image source={image} style={styles.image} resizeMode="contain" />
                </View>

                <View style={styles.rankTray}>
                    {Array.from({ length: totalRankSteps }).map((_, index) => {
                        const isCompleted = index < completedRankSteps;

                        return (
                            <View key={index} style={styles.rankDiamondSlot}>
                                <View style={[styles.rankDiamond, isCompleted ? styles.rankDiamondCompleted : styles.rankDiamondRemaining]} />
                            </View>
                        );
                    })}
                </View>
            </View>

            <View style={styles.details}>
                <Text style={styles.label}>FOCUS RANK</Text>

                <Text style={styles.name}>{rank.name}</Text>

                {rankProgress && <Text style={styles.progressText}>{Math.round(rankProgress.progressPercentage)}% through rank</Text>}

                {nextRank && (
                    <Text style={styles.nextRankText}>
                        Next: {nextRank.name} at Level {nextRank.minimumLevel}
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
    },

    imageFrame: {
        width: 112,
        height: 112,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: colours.primary,
        backgroundColor: colours.primarySoft,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    image: {
        width: 82,
        height: 82,
        transform: [{ translateY: -4 }],
    },

    details: {
        flex: 1,
        gap: spacing.xs,
    },

    label: {
        fontSize: 12,
        fontWeight: "700",
        color: colours.textMuted,
        letterSpacing: 1,
    },

    name: {
        fontSize: 24,
        fontWeight: "800",
        color: colours.text,
    },

    progressText: {
        fontSize: 12,
        color: colours.textMuted,
    },

    nextRankText: {
        fontSize: 12,
        fontWeight: "600",
        color: colours.primary,
    },
    badgeContainer: {
        width: 112,
        height: 124,
        position: "relative",
        alignItems: "center",
    },

    rankTray: {
        position: "absolute",
        top: 99,

        minHeight: 26,
        paddingHorizontal: spacing.sm,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        borderWidth: 2,
        borderColor: colours.primary,
        borderRadius: radius.pill,

        backgroundColor: colours.surface,
    },

    rankDiamondSlot: {
        width: 16,
        height: 16,
        alignItems: "center",
        justifyContent: "center",
    },

    rankDiamond: {
        width: 9,
        height: 9,
        transform: [{ rotate: "45deg" }],
    },

    rankDiamondCompleted: {
        backgroundColor: colours.primary,
        borderWidth: 1,
        borderColor: colours.primary,
    },

    rankDiamondRemaining: {
        backgroundColor: colours.surface,
        borderWidth: 1,
        borderColor: colours.primaryBorder,
    },
});
