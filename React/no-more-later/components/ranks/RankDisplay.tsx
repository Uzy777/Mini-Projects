import { Image, StyleSheet, Text, View } from "react-native";

import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import { getFocusRank, getNextFocusRank, getRankProgress } from "@/utils/rank";
import { getRankImage } from "@/utils/rankImage";
import { useMemo } from "react";

type RankDisplayProps = {
    level: number;
};

export function RankDisplay({ level }: RankDisplayProps) {
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

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

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        container: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
        },

        imageFrame: {
            width: 96,
            height: 96,
            borderRadius: radius.pill,
            borderWidth: 2,
            borderColor: colours.primary,
            backgroundColor: colours.primarySoft,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
        },
        image: {
            width: 70,
            height: 70,
            transform: [{ translateY: -4 }],
        },

        details: {
            flex: 1,
            gap: 2,
        },

        label: {
            fontSize: 11,
            fontWeight: "700",
            color: colours.textMuted,
            letterSpacing: 1,
        },

        name: {
            fontSize: 22,
            fontWeight: "800",
            color: colours.text,
        },

        progressText: {
            marginTop: 2,
            fontSize: 12,
            color: colours.textMuted,
        },

        nextRankText: {
            marginTop: 2,
            fontSize: 12,
            fontWeight: "600",
            color: colours.primary,
        },
        badgeContainer: {
            width: 96,
            height: 108,
            position: "relative",
            alignItems: "center",
        },

        rankTray: {
            position: "absolute",
            top: 84,

            minHeight: 23,
            paddingHorizontal: 6,

            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",

            borderWidth: 2,
            borderColor: colours.primary,
            borderRadius: radius.pill,

            backgroundColor: colours.surface,
        },

        rankDiamondSlot: {
            width: 14,
            height: 14,
            alignItems: "center",
            justifyContent: "center",
        },

        rankDiamond: {
            width: 8,
            height: 8,
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
}
