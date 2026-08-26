import { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { getFocusRank } from "@/utils/rank";
import { getRankImage } from "@/utils/rankImage";

type FocusRankMedallionProps = {
    level: number;
    previousLevel?: number;
    size?: number;
    showProgress?: boolean;
    strongGlow?: boolean;
};

export function FocusRankMedallion({ level, previousLevel, size = 132, showProgress = true, strongGlow = false }: FocusRankMedallionProps) {
    const { colours } = useAppearance();
    const reduceMotion = useReducedMotion();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const rank = getFocusRank(level);

    if (!rank) {
        return null;
    }

    const previousRank = previousLevel === undefined ? null : getFocusRank(previousLevel);
    const totalRankSteps = rank.maximumLevel === null ? 0 : rank.maximumLevel - rank.minimumLevel;
    const completedRankSteps = Math.max(0, level - rank.minimumLevel);
    const previousCompletedSteps = previousRank?.id === rank.id && previousLevel !== undefined
        ? Math.max(0, previousLevel - rank.minimumLevel)
        : 0;
    const trayHeight = showProgress && totalRankSteps > 0 ? 26 : 0;

    return (
        <View
            accessibilityRole="image"
            accessibilityLabel={`${rank.name} Focus Rank at Level ${level}`}
            style={[styles.container, { width: size, height: size + trayHeight / 2 }]}
        >
            <View style={[styles.glow, strongGlow && styles.strongGlow, { width: size * 1.24, height: size * 1.24, borderRadius: size }]} />
            <View style={[styles.frame, { width: size, height: size, borderRadius: size, shadowColor: colours.primary }]}>
                <View style={[styles.innerRing, { borderRadius: size }]} />
                <Image
                    accessible={false}
                    source={getRankImage(rank.id)}
                    resizeMode="contain"
                    style={{ width: size * 0.75, height: size * 0.75 }}
                />
            </View>

            {showProgress && totalRankSteps > 0 ? (
                <View style={[styles.rankTray, { top: size - 14 }]}>
                    {Array.from({ length: totalRankSteps }, (_, index) => {
                        const completed = index < completedRankSteps;
                        const newlyCompleted = completed && index >= previousCompletedSteps;

                        return (
                            <View key={index} style={styles.diamondSlot}>
                                <View style={styles.diamondRemaining} />
                                {completed ? (
                                    <Animated.View
                                        entering={reduceMotion || !newlyCompleted ? undefined : FadeIn.delay(220 + index * 70).duration(280)}
                                        style={styles.diamondCompleted}
                                    />
                                ) : null}
                            </View>
                        );
                    })}
                </View>
            ) : null}
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        container: {
            position: "relative",
            alignItems: "center",
            justifyContent: "flex-start",
        },
        glow: {
            position: "absolute",
            top: "-12%",
            backgroundColor: colours.primarySoft,
            opacity: 0.7,
        },
        strongGlow: {
            opacity: 1,
            transform: [{ scale: 1.08 }],
        },
        frame: {
            position: "relative",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            borderWidth: 2,
            borderColor: colours.primary,
            backgroundColor: colours.primarySoft,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 18,
            elevation: 5,
        },
        innerRing: {
            position: "absolute",
            top: 7,
            right: 7,
            bottom: 7,
            left: 7,
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            opacity: 0.8,
        },
        rankTray: {
            position: "absolute",
            minHeight: 26,
            paddingHorizontal: spacing.sm,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1.5,
            borderColor: colours.primaryMuted,
            borderRadius: radius.pill,
            backgroundColor: colours.surface,
        },
        diamondSlot: {
            width: 16,
            height: 16,
            alignItems: "center",
            justifyContent: "center",
        },
        diamondRemaining: {
            width: 8,
            height: 8,
            position: "absolute",
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            backgroundColor: colours.surface,
            transform: [{ rotate: "45deg" }],
        },
        diamondCompleted: {
            width: 8,
            height: 8,
            borderWidth: 1,
            borderColor: colours.primary,
            backgroundColor: colours.primary,
            transform: [{ rotate: "45deg" }],
        },
    });
}
