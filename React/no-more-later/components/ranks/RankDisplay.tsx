import { Image, StyleSheet, Text, View } from "react-native";

import { colours, spacing } from "@/constants/design";
import { getFocusRank } from "@/utils/rank";
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

    return (
        <View style={styles.container}>
            <Image source={image} style={styles.image} resizeMode="contain" />

            <View style={styles.details}>
                <Text style={styles.label}>FOCUS RANK</Text>

                <Text style={styles.name}>{rank.name}</Text>

                <Text style={styles.levelRange}>
                    Levels {rank.minimumLevel}–{rank.maximumLevel}
                </Text>
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
});
