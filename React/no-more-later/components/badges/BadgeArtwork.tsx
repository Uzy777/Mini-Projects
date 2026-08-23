import { Image, StyleSheet, View } from "react-native";
import { CalendarDays, CheckCircle2, Clock3, Flame, MoonStar, Sunrise, Target } from "lucide-react-native";

import { BADGE_DEFINITION_BY_ID, BADGE_IMAGE_SOURCES } from "@/constants/badges";
import type { AppColours } from "@/constants/appearanceColours";
import { radius } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { BadgeIconName } from "@/constants/badges";
import type { BadgeId, BadgeTier } from "@/types/badges";

type BadgeArtworkProps = {
    badgeId: BadgeId;
    tier: BadgeTier;
    size?: number;
};

const ICONS = {
    target: Target,
    clock: Clock3,
    flame: Flame,
    check: CheckCircle2,
    sunrise: Sunrise,
    moon: MoonStar,
    calendar: CalendarDays,
} satisfies Record<BadgeIconName, typeof Target>;

export function BadgeArtwork({ badgeId, tier, size = 76 }: BadgeArtworkProps) {
    const { colours } = useAppearance();
    const definition = BADGE_DEFINITION_BY_ID[badgeId];
    const source = BADGE_IMAGE_SOURCES[badgeId]?.[tier];
    const Icon = ICONS[definition.icon];
    const tone = getTierTone(tier, colours);
    const imageSize = Math.round(size * 0.72);

    return (
        <View
            accessibilityRole="image"
            accessibilityLabel={`${definition.name}, ${tier} tier`}
            style={[
                styles.frame,
                {
                    width: size,
                    height: size,
                    borderColor: tone.strong,
                    backgroundColor: tone.soft,
                    shadowColor: tone.strong,
                },
            ]}
        >
            <View style={[styles.innerRing, { borderColor: tone.strong }]} />
            {source ? (
                <Image source={source} resizeMode="contain" style={{ width: imageSize, height: imageSize }} />
            ) : (
                <Icon size={Math.round(size * 0.42)} strokeWidth={2} color={tone.strong} />
            )}
            <View style={[styles.gem, { borderColor: tone.soft, backgroundColor: tone.strong }]} />
        </View>
    );
}

export function getTierTone(tier: BadgeTier, colours: AppColours) {
    switch (tier) {
        case "bronze":
            return { strong: colours.leaderboardBronze, soft: colours.leaderboardBronzeSoft };
        case "silver":
            return { strong: colours.leaderboardSilver, soft: colours.leaderboardSilverSoft };
        case "gold":
            return { strong: colours.leaderboardGold, soft: colours.leaderboardGoldSoft };
        case "platinum":
            return { strong: colours.primary, soft: colours.primarySoft };
        case "diamond":
            return { strong: colours.primaryStrong, soft: colours.primarySubtle };
    }
}

const styles = StyleSheet.create({
    frame: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderRadius: radius.pill,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 3,
    },
    innerRing: {
        position: "absolute",
        top: 5,
        right: 5,
        bottom: 5,
        left: 5,
        borderWidth: 1,
        borderRadius: radius.pill,
        opacity: 0.28,
    },
    gem: {
        position: "absolute",
        right: -1,
        bottom: 4,
        width: 13,
        height: 13,
        borderWidth: 2,
        borderRadius: 4,
        transform: [{ rotate: "45deg" }],
    },
});
