import { Image, StyleSheet, View } from "react-native";

import { colours, radius } from "@/constants/design";
import { getFocusRank } from "@/utils/rank";
import { getRankImage } from "@/utils/rankImage";

type RankBadgeProps = {
    level: number;
};

export function RankBadge({ level }: RankBadgeProps) {
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

const styles = StyleSheet.create({
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
