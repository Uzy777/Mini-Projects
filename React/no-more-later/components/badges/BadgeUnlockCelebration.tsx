import { useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Award, Check } from "lucide-react-native";
import Animated, { Easing, FadeIn, FadeInUp, useReducedMotion } from "react-native-reanimated";

import { BadgeArtwork, getTierTone } from "@/components/badges/BadgeArtwork";
import { CelebrationParticles } from "@/components/celebrations/CelebrationParticles";
import {
    CelebrationContinueButton,
    CelebrationHeader,
    CelebrationXpRow,
} from "@/components/celebrations/CelebrationPrimitives";
import { CelebrationShell } from "@/components/celebrations/CelebrationShell";
import type { AppColours } from "@/constants/appearanceColours";
import { BADGE_DEFINITION_BY_ID, BADGE_TIER_ORDER } from "@/constants/badges";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { useCelebrationSound } from "@/services/audio/celebrationSounds";
import type { BadgeUnlockAward } from "@/types/badges";

type BadgeUnlockCelebrationProps = {
    award: BadgeUnlockAward;
    position: number;
    total: number;
    onContinue: () => void;
};

export function BadgeUnlockCelebration({ award, position, total, onContinue }: BadgeUnlockCelebrationProps) {
    const { colours } = useAppearance();
    const { height, width } = useWindowDimensions();
    const reduceMotion = useReducedMotion();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const definition = BADGE_DEFINITION_BY_ID[award.badgeId];
    const tierDefinition = definition.tiers.find((tier) => tier.tier === award.tier);
    const tone = getTierTone(award.tier, colours);
    const compact = height < 700 || width < 390;
    const celebrationKey = `${award.badgeId}-${award.tier}`;
    const tierNumber = BADGE_TIER_ORDER[award.tier] + 1;

    useCelebrationSound("badge-unlock", celebrationKey);

    const requirement = tierDefinition
        ? definition.requirement(tierDefinition.threshold)
        : definition.shortDescription;

    return (
        <CelebrationShell
            kind="badge"
            accessibilityLabel={`Badge unlocked. ${definition.name}, ${award.tier} tier. ${requirement}. Earned ${award.xpAwarded} XP.`}
            accentColor={tone.strong}
            onRequestClose={onContinue}
        >
            <Animated.View
                key={celebrationKey}
                entering={reduceMotion ? undefined : FadeIn.duration(240)}
                style={styles.content}
            >
                <CelebrationHeader
                    icon={<Award size={16} strokeWidth={2.2} color={tone.strong} />}
                    eyebrow="ACHIEVEMENT EARNED"
                    title="BADGE UNLOCKED"
                    accentColor={tone.strong}
                    accentSoft={tone.soft}
                    compact={compact}
                />

                <View style={[styles.artworkStage, compact && styles.artworkStageCompact]}>
                    <View style={[styles.tierHalo, compact && styles.tierHaloCompact, { backgroundColor: tone.soft }]} />
                    <CelebrationParticles kind="badge" colors={[tone.strong, colours.textMuted, tone.strong]} delay={240} />
                    <Animated.View
                        entering={
                            reduceMotion
                                ? undefined
                                : FadeInUp.delay(180).duration(360).easing(Easing.out(Easing.cubic))
                        }
                    >
                        <BadgeArtwork badgeId={award.badgeId} tier={award.tier} size={compact ? 108 : 132} />
                    </Animated.View>
                </View>

                <Text style={[styles.name, compact && styles.nameCompact]}>{definition.name}</Text>
                <View style={[styles.tierPill, { borderColor: tone.strong, backgroundColor: tone.soft }]}>
                    <Text style={[styles.tierText, { color: tone.strong }]}>
                        {award.tier.toUpperCase()} · TIER {tierNumber} OF 5
                    </Text>
                </View>

                <View style={[styles.requirementCard, compact && styles.requirementCardCompact]}>
                    <View style={[styles.requirementIcon, { backgroundColor: tone.soft }]}>
                        <Check size={14} strokeWidth={2.5} color={tone.strong} />
                    </View>
                    <View style={styles.requirementCopy}>
                        <Text style={styles.requirementLabel}>ACHIEVEMENT COMPLETE</Text>
                        <Text style={styles.requirement}>{requirement}</Text>
                    </View>
                </View>

                <CelebrationXpRow earnedXp={award.xpAwarded} compact={compact} />

                {total > 1 ? (
                    <View style={styles.queue}>
                        <View style={styles.queueTrack}>
                            <View
                                style={[
                                    styles.queueProgress,
                                    { width: `${((position + 1) / total) * 100}%` as `${number}%`, backgroundColor: tone.strong },
                                ]}
                            />
                        </View>
                        <Text style={styles.queueText}>Badge {position + 1} of {total}</Text>
                    </View>
                ) : null}

                <CelebrationContinueButton
                    label={position + 1 < total ? "Next badge" : "Continue"}
                    accessibilityLabel={position + 1 < total ? "Show next unlocked badge" : "Continue from badge celebration"}
                    onContinue={onContinue}
                />
            </Animated.View>
        </CelebrationShell>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        content: {
            width: "100%",
            alignItems: "center",
        },
        artworkStage: {
            width: "100%",
            height: 164,
            marginTop: spacing.sm,
            position: "relative",
            alignItems: "center",
            justifyContent: "center",
            overflow: "visible",
        },
        artworkStageCompact: {
            height: 138,
            marginTop: spacing.xs,
        },
        tierHalo: {
            width: 172,
            height: 172,
            position: "absolute",
            borderRadius: radius.pill,
            opacity: 0.72,
        },
        tierHaloCompact: {
            width: 142,
            height: 142,
        },
        name: {
            marginTop: spacing.xs,
            fontSize: 29,
            lineHeight: 35,
            fontWeight: "900",
            letterSpacing: -0.5,
            textAlign: "center",
            color: colours.text,
        },
        nameCompact: {
            fontSize: 25,
            lineHeight: 30,
        },
        tierPill: {
            marginTop: spacing.sm,
            paddingHorizontal: 11,
            paddingVertical: 6,
            borderWidth: 1,
            borderRadius: radius.pill,
        },
        tierText: {
            fontSize: 9,
            fontWeight: "900",
            letterSpacing: 0.9,
        },
        requirementCard: {
            width: "100%",
            marginTop: spacing.md,
            padding: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,
            backgroundColor: colours.background,
        },
        requirementCardCompact: {
            marginTop: spacing.md,
            paddingVertical: 12,
        },
        requirementIcon: {
            width: 30,
            height: 30,
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
        },
        requirementCopy: {
            flex: 1,
        },
        requirementLabel: {
            fontSize: 8,
            fontWeight: "900",
            letterSpacing: 0.9,
            color: colours.textMuted,
        },
        requirement: {
            marginTop: 3,
            fontSize: 12,
            lineHeight: 17,
            fontWeight: "600",
            color: colours.text,
        },
        queue: {
            width: "100%",
            marginTop: spacing.xs,
            alignItems: "center",
            gap: 6,
        },
        queueTrack: {
            width: 76,
            height: 4,
            overflow: "hidden",
            borderRadius: radius.pill,
            backgroundColor: colours.border,
        },
        queueProgress: {
            height: "100%",
            borderRadius: radius.pill,
        },
        queueText: {
            fontSize: 10,
            fontWeight: "700",
            color: colours.textMuted,
        },
    });
}
