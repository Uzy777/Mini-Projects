import { useEffect, useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { ArrowUpRight, Crown } from "lucide-react-native";
import Animated, {
    cancelAnimation,
    Easing,
    FadeInUp,
    interpolate,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withDelay,
    withTiming,
} from "react-native-reanimated";

import { CelebrationParticles } from "@/components/celebrations/CelebrationParticles";
import {
    CelebrationContinueButton,
    CelebrationHeader,
    CelebrationXpRow,
} from "@/components/celebrations/CelebrationPrimitives";
import { CelebrationShell } from "@/components/celebrations/CelebrationShell";
import { FocusRankMedallion } from "@/components/celebrations/FocusRankMedallion";
import type { AppColours } from "@/constants/appearanceColours";
import { spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { useCelebrationSound } from "@/services/audio/celebrationSounds";
import { getFocusRank } from "@/utils/rank";

type LevelUpCelebrationProps = {
    previousLevel: number;
    newLevel: number;
    earnedXp: number;
    onContinue: () => void;
};

type CelebrationContentProps = LevelUpCelebrationProps & {
    compact: boolean;
};

export function LevelUpCelebration({ previousLevel, newLevel, earnedXp, onContinue }: LevelUpCelebrationProps) {
    const { colours } = useAppearance();
    const { height, width } = useWindowDimensions();
    const previousRank = getFocusRank(previousLevel);
    const newRank = getFocusRank(newLevel);
    const rankChanged = previousRank !== null && newRank !== null && previousRank.id !== newRank.id;
    const compact = height < 700 || width < 390;

    useCelebrationSound(rankChanged ? "rank-up" : "level-up", `${previousLevel}-${newLevel}`);

    if (!newRank) {
        return null;
    }

    const accessibilityLabel = rankChanged && previousRank
        ? `New Focus Rank. ${newRank.name}, Level ${newLevel}. Advanced from ${previousRank.name}. Earned ${earnedXp} XP.`
        : `Level up. Level ${newLevel}, ${newRank.name} Focus Rank. Earned ${earnedXp} XP.`;

    return (
        <CelebrationShell
            kind={rankChanged ? "rank" : "level"}
            accessibilityLabel={accessibilityLabel}
            accentColor={colours.primary}
            onRequestClose={onContinue}
        >
            {rankChanged && previousRank ? (
                <RankUpContent
                    previousLevel={previousLevel}
                    newLevel={newLevel}
                    earnedXp={earnedXp}
                    compact={compact}
                    onContinue={onContinue}
                />
            ) : (
                <LevelUpContent
                    previousLevel={previousLevel}
                    newLevel={newLevel}
                    earnedXp={earnedXp}
                    compact={compact}
                    onContinue={onContinue}
                />
            )}
        </CelebrationShell>
    );
}

function LevelUpContent({ previousLevel, newLevel, earnedXp, compact, onContinue }: CelebrationContentProps) {
    const { colours } = useAppearance();
    const reduceMotion = useReducedMotion();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const rank = getFocusRank(newLevel)!;

    return (
        <>
            <CelebrationHeader
                icon={<ArrowUpRight size={16} strokeWidth={2.4} color={colours.primaryStrong} />}
                eyebrow="PROGRESS MADE"
                title="LEVEL UP"
                accentColor={colours.primaryStrong}
                accentSoft={colours.primarySoft}
                compact={compact}
            />

            <View style={[styles.levelArtworkStage, compact && styles.levelArtworkStageCompact]}>
                <CelebrationParticles kind="level" colors={[colours.primary, colours.primaryMuted]} delay={220} />
                <Animated.View entering={reduceMotion ? undefined : FadeInUp.delay(180).duration(360).easing(Easing.out(Easing.cubic))}>
                    <FocusRankMedallion
                        level={newLevel}
                        previousLevel={previousLevel}
                        size={compact ? 104 : 124}
                    />
                </Animated.View>
            </View>

            <Text style={[styles.levelNumber, compact && styles.levelNumberCompact]}>Level {newLevel}</Text>
            <Text style={styles.rankName}>{rank.name} · Focus Rank</Text>
            <Text style={styles.levelMessage}>Good progress. Keep the momentum going.</Text>

            <CelebrationXpRow earnedXp={earnedXp} compact={compact} />
            <CelebrationContinueButton onContinue={onContinue} />
        </>
    );
}

function RankUpContent({ previousLevel, newLevel, earnedXp, compact, onContinue }: CelebrationContentProps) {
    const { colours } = useAppearance();
    const reduceMotion = useReducedMotion();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const phase = useSharedValue(reduceMotion ? 1 : 0);
    const previousRank = getFocusRank(previousLevel)!;
    const newRank = getFocusRank(newLevel)!;

    useEffect(() => {
        phase.value = reduceMotion
            ? 1
            : withDelay(480, withTiming(1, { duration: 640, easing: Easing.inOut(Easing.cubic) }));

        return () => cancelAnimation(phase);
    }, [phase, reduceMotion]);

    const previousStyle = useAnimatedStyle(() => ({
        opacity: interpolate(phase.value, [0, 0.28, 0.62, 1], [1, 1, 0, 0]),
        transform: [
            { translateY: interpolate(phase.value, [0, 0.28, 1], [0, 0, -8]) },
            { scale: interpolate(phase.value, [0, 0.28, 1], [1, 1, 0.95]) },
        ],
    }));

    const newStyle = useAnimatedStyle(() => ({
        opacity: interpolate(phase.value, [0, 0.5, 1], [0, 0, 1]),
        transform: [
            { translateY: interpolate(phase.value, [0, 0.5, 1], [8, 8, 0]) },
            { scale: interpolate(phase.value, [0, 0.5, 1], [0.96, 0.96, 1]) },
        ],
    }));

    return (
        <>
            <CelebrationHeader
                icon={<Crown size={16} strokeWidth={2.2} color={colours.primaryStrong} />}
                eyebrow="MILESTONE REACHED"
                title="NEW FOCUS RANK"
                accentColor={colours.primaryStrong}
                accentSoft={colours.primarySoft}
                compact={compact}
            />

            <View style={[styles.rankTransitionStage, compact && styles.rankTransitionStageCompact]}>
                <CelebrationParticles kind="rank" colors={[colours.primary, colours.primaryMuted, colours.text]} delay={820} />

                <Animated.View style={[styles.rankLayer, previousStyle]}>
                    <Text style={styles.transitionCaption}>FROM {previousRank.name.toUpperCase()}</Text>
                    <FocusRankMedallion level={previousLevel} size={compact ? 98 : 116} showProgress={false} />
                </Animated.View>

                <Animated.View style={[styles.rankLayer, newStyle]}>
                    <FocusRankMedallion level={newLevel} size={compact ? 122 : 148} showProgress={false} strongGlow />
                </Animated.View>
            </View>

            <Animated.View style={[styles.newRankDetails, newStyle]}>
                <Text style={[styles.newRankName, compact && styles.newRankNameCompact]}>{newRank.name}</Text>
                <Text style={styles.newRankLevel}>Focus Rank · Level {newLevel}</Text>
            </Animated.View>

            <CelebrationXpRow earnedXp={earnedXp} compact={compact} />
            <CelebrationContinueButton onContinue={onContinue} />
        </>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        levelArtworkStage: {
            width: "100%",
            minHeight: 164,
            marginTop: spacing.md,
            alignItems: "center",
            justifyContent: "center",
            overflow: "visible",
        },
        levelArtworkStageCompact: {
            minHeight: 130,
            marginTop: spacing.sm,
        },
        levelNumber: {
            marginTop: spacing.sm,
            fontSize: 36,
            lineHeight: 42,
            fontWeight: "900",
            letterSpacing: -0.8,
            color: colours.text,
        },
        levelNumberCompact: {
            marginTop: spacing.xs,
            fontSize: 31,
            lineHeight: 36,
        },
        rankName: {
            marginTop: 2,
            fontSize: 15,
            lineHeight: 20,
            fontWeight: "700",
            color: colours.textMuted,
        },
        levelMessage: {
            marginTop: spacing.sm,
            fontSize: 12,
            lineHeight: 18,
            textAlign: "center",
            color: colours.textMuted,
        },
        rankTransitionStage: {
            width: "100%",
            height: 190,
            marginTop: spacing.sm,
            position: "relative",
            alignItems: "center",
            justifyContent: "center",
            overflow: "visible",
        },
        rankTransitionStageCompact: {
            height: 146,
            marginTop: spacing.xs,
        },
        rankLayer: {
            ...StyleSheet.absoluteFillObject,
            alignItems: "center",
            justifyContent: "center",
        },
        transitionCaption: {
            marginBottom: spacing.sm,
            fontSize: 8,
            fontWeight: "900",
            letterSpacing: 1.1,
            color: colours.textMuted,
        },
        newRankDetails: {
            alignItems: "center",
        },
        newRankName: {
            fontSize: 32,
            lineHeight: 38,
            fontWeight: "900",
            letterSpacing: -0.6,
            color: colours.text,
        },
        newRankNameCompact: {
            fontSize: 27,
            lineHeight: 32,
        },
        newRankLevel: {
            marginTop: 2,
            fontSize: 13,
            fontWeight: "700",
            color: colours.textMuted,
        },
    });
}
