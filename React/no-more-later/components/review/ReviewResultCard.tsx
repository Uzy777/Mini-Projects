import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import { useMemo } from "react";

type ReviewResultCardProps = {
    earnedXp: number;
    totalXp: number;
    reachedLevel: number | null;
    onReturnToJourneys: () => void;
    onViewHistory: () => void;
    returnLabel?: string;
};

export function ReviewResultCard({ earnedXp, totalXp, reachedLevel, onReturnToJourneys, onViewHistory, returnLabel = "Return to Journeys" }: ReviewResultCardProps) {
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <View style={styles.card}>
            <Text style={styles.label}>REVIEW COMPLETE</Text>

            <View style={styles.rewardSection}>
                <Text style={styles.rewardXp}>+{earnedXp} XP</Text>

                <Text style={styles.totalXp}>{totalXp} total XP</Text>
            </View>

            {reachedLevel !== null && (
                <View style={styles.levelUpCard}>
                    <Text style={styles.levelUpLabel}>LEVEL UP</Text>

                    <Text style={styles.levelUpTitle}>Level {reachedLevel}</Text>

                    <Text style={styles.levelUpText}>You reached a new level.</Text>
                </View>
            )}

            <View style={styles.actions}>
                <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]} onPress={onReturnToJourneys}>
                    <Text style={styles.primaryButtonText}>{returnLabel}</Text>
                </Pressable>

                <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]} onPress={onViewHistory}>
                    <Text style={styles.secondaryButtonText}>View Session History</Text>
                </Pressable>
            </View>
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        card: {
            width: "100%",
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
            alignItems: "center",
        },

        label: {
            fontSize: 12,
            fontWeight: "800",
            letterSpacing: 0.8,
            color: colours.success,
        },

        rewardSection: {
            alignItems: "center",
            marginTop: spacing.md,
        },

        rewardXp: {
            fontSize: 38,
            lineHeight: 44,
            fontWeight: "800",
            color: colours.primary,
        },

        totalXp: {
            marginTop: spacing.xs,
            fontSize: 14,
            fontWeight: "600",
            color: colours.textMuted,
        },

        levelUpCard: {
            width: "100%",
            marginTop: spacing.lg,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.md,
            backgroundColor: colours.primarySoft,
            alignItems: "center",
        },

        levelUpLabel: {
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 0.7,
            color: colours.primary,
        },

        levelUpTitle: {
            marginTop: spacing.xs,
            fontSize: 24,
            fontWeight: "800",
            color: colours.text,
        },

        levelUpText: {
            marginTop: spacing.xs,
            fontSize: 14,
            color: colours.textMuted,
        },

        actions: {
            width: "100%",
            marginTop: spacing.lg,
            gap: spacing.sm,
        },

        primaryButton: {
            width: "100%",
            alignItems: "center",
            paddingVertical: 14,
            borderRadius: radius.md,
            backgroundColor: colours.primary,
        },

        primaryButtonPressed: {
            backgroundColor: colours.primaryPressed,
        },

        primaryButtonText: {
            fontSize: 15,
            fontWeight: "700",
            color: colours.surface,
        },

        secondaryButton: {
            width: "100%",
            alignItems: "center",
            paddingVertical: 13,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,
            backgroundColor: colours.surface,
        },

        secondaryButtonPressed: {
            backgroundColor: colours.background,
        },

        secondaryButtonText: {
            fontSize: 15,
            fontWeight: "700",
            color: colours.text,
        },
    });
}
