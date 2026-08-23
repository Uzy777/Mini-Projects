import { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import Animated, { FadeIn, FadeInUp, ZoomIn, useReducedMotion } from "react-native-reanimated";

import { BadgeArtwork, getTierTone } from "@/components/badges/BadgeArtwork";
import { BADGE_DEFINITION_BY_ID } from "@/constants/badges";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { BadgeUnlockAward } from "@/types/badges";

type BadgeUnlockCelebrationProps = {
    award: BadgeUnlockAward;
    position: number;
    total: number;
    onContinue: () => void;
};

export function BadgeUnlockCelebration({ award, position, total, onContinue }: BadgeUnlockCelebrationProps) {
    const { colours } = useAppearance();
    const reduceMotion = useReducedMotion();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const definition = BADGE_DEFINITION_BY_ID[award.badgeId];
    const tierDefinition = definition.tiers.find((tier) => tier.tier === award.tier);
    const tone = getTierTone(award.tier, colours);

    return (
        <Modal transparent animationType="none" statusBarTranslucent onRequestClose={onContinue}>
            <View style={styles.overlay}>
                <Animated.View entering={reduceMotion ? undefined : ZoomIn.springify().damping(15)} style={styles.card}>
                    <View style={[styles.glow, { backgroundColor: tone.soft }]} />
                    <Animated.View entering={reduceMotion ? undefined : FadeIn.delay(150)} style={styles.labelRow}>
                        <Sparkles size={14} color={tone.strong} />
                        <Text style={[styles.label, { color: tone.strong }]}>BADGE UNLOCKED</Text>
                    </Animated.View>

                    <Animated.View entering={reduceMotion ? undefined : FadeInUp.delay(140).duration(380)}>
                        <BadgeArtwork badgeId={award.badgeId} tier={award.tier} size={126} />
                    </Animated.View>

                    <Text style={styles.name}>{definition.name}</Text>
                    <View style={[styles.tierPill, { backgroundColor: tone.soft }]}>
                        <Text style={[styles.tierText, { color: tone.strong }]}>{award.tier.toUpperCase()} TIER</Text>
                    </View>
                    <Text style={styles.requirement}>{tierDefinition ? definition.requirement(tierDefinition.threshold) : definition.shortDescription}</Text>

                    <View style={styles.reward}>
                        <Text style={styles.rewardLabel}>BADGE REWARD</Text>
                        <Text style={styles.rewardValue}>+{award.xpAwarded} XP</Text>
                    </View>

                    {total > 1 ? <Text style={styles.queueText}>{position + 1} of {total} badges unlocked</Text> : null}

                    <Pressable
                        accessibilityRole="button"
                        onPress={onContinue}
                        style={({ pressed }) => [styles.continueButton, pressed && styles.continuePressed]}
                    >
                        <Text style={styles.continueText}>{position + 1 < total ? "Next badge" : "Continue"}</Text>
                    </Pressable>
                </Animated.View>
            </View>
        </Modal>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        overlay: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, backgroundColor: "rgba(0, 0, 0, 0.55)" },
        card: { width: "100%", maxWidth: 410, position: "relative", overflow: "hidden", alignItems: "center", padding: spacing.xl, borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.xl, backgroundColor: colours.surface },
        glow: { position: "absolute", top: -95, width: 270, height: 210, borderRadius: radius.pill, opacity: 0.8 },
        labelRow: { zIndex: 1, flexDirection: "row", alignItems: "center", gap: 7, marginBottom: spacing.lg },
        label: { fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
        name: { marginTop: spacing.lg, fontSize: 27, lineHeight: 33, fontWeight: "900", textAlign: "center", color: colours.text },
        tierPill: { marginTop: spacing.sm, paddingHorizontal: 11, paddingVertical: 6, borderRadius: radius.pill },
        tierText: { fontSize: 9, fontWeight: "900", letterSpacing: 1 },
        requirement: { maxWidth: 300, marginTop: spacing.md, fontSize: 13, lineHeight: 19, textAlign: "center", color: colours.textMuted },
        reward: { width: "100%", marginTop: spacing.lg, padding: spacing.md, alignItems: "center", borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.md, backgroundColor: colours.primarySubtle },
        rewardLabel: { fontSize: 8, fontWeight: "900", letterSpacing: 0.9, color: colours.textMuted },
        rewardValue: { marginTop: 3, fontSize: 22, fontWeight: "900", color: colours.primaryStrong },
        queueText: { marginTop: spacing.md, fontSize: 11, fontWeight: "700", color: colours.textMuted },
        continueButton: { width: "100%", minHeight: 48, marginTop: spacing.lg, alignItems: "center", justifyContent: "center", borderRadius: radius.md, backgroundColor: colours.primary },
        continuePressed: { backgroundColor: colours.primaryPressed },
        continueText: { fontSize: 14, fontWeight: "800", color: colours.onPrimary },
    });
}
