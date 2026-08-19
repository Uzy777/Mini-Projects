import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
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
        <AppCard style={styles.card} padding="lg" tone="accent">
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
                <AppButton label={returnLabel} onPress={onReturnToJourneys} fullWidth size="lg" />
                <AppButton label="View Session History" onPress={onViewHistory} fullWidth variant="secondary" />
            </View>
        </AppCard>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        card: {
            width: "100%",
            marginTop: spacing.xl,
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

    });
}
