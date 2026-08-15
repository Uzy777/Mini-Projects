import { Image, StyleSheet, View } from "react-native";

import { radius } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import { getFocusRank } from "@/utils/rank";
import { getRankImage } from "@/utils/rankImage";
import { useMemo } from "react";

type RankBadgeProps = {
    level: number;
};

export function RankBadge({ level }: RankBadgeProps) {
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    const rank = getFocusRank(level);

    if (!rank) {
        return null;
    }

    const image = getRankImage(rank.id);

    return (
        <View style={styles.frame}>
            <Image source={image} style={styles.image} resizeMode="contain" />
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        frame: {
            width: 56,
            height: 56,
            borderRadius: radius.pill,
            borderWidth: 2,
            borderColor: colours.primaryBorder,
            backgroundColor: colours.primarySoft,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
        },

        image: {
            width: 48,
            height: 48,
        },
    });
}
