import { Image, StyleSheet, Text, View } from "react-native";

import { colours, spacing } from "@/constants/design";
import { getFocusRank, getNextFocusRank, getRankProgress } from "@/utils/rank";
import { getRankImage } from "@/utils/rankImage";
import type { RankVisualStyle } from "@/types/ranks";

type RankDisplayProps = {
    level: number;
    visualStyle: RankVisualStyle;
};

export function RankDisplay({ level, visualStyle }: RankDisplayProps) {
    const rank = getFocusRank(level);

    if (!rank) {
        return null;
    }

    const image = getRankImage(rank.id, visualStyle);
    const nextRank = getNextFocusRank(level);
    const rankProgress = getRankProgress(level);

    return (
        <View style={styles.container}>
            <Image source={image} style={styles.image} resizeMode="contain" />

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

    image: {
        width: 72,
        height: 72,
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

    levelRange: {
        fontSize: 14,
        color: colours.textMuted,
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
});
