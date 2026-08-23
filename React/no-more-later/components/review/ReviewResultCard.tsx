import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import { useMemo } from "react";
import type { SessionOutcome } from "@/types/models";

type ReviewResultCardProps = {
    earnedXp: number;
    totalXp: number;
    reachedLevel: number | null;
    baseXp: number;
    bonusXp: number;
    badgeXp: number;
    creditedFocusSeconds: number;
    xpCreditStatus: "credited" | "under_minimum" | "daily_limit" | "unverified" | "legacy";
    onReturnToJourneys: () => void;
    onViewHistory: () => void;
    returnLabel?: string;
    outcome?: SessionOutcome;
    itemKind?: "Task" | "Quest";
};

export function ReviewResultCard({ earnedXp, totalXp, reachedLevel, baseXp, bonusXp, badgeXp, creditedFocusSeconds, xpCreditStatus, onReturnToJourneys, onViewHistory, returnLabel = "Return to Journeys", outcome, itemKind }: ReviewResultCardProps) {
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <AppCard style={styles.card} padding="lg" tone="accent">
            <Text style={styles.label}>REVIEW COMPLETE</Text>

            <View style={styles.rewardSection}>
                <Text style={styles.rewardXp}>+{earnedXp} XP</Text>

                <Text style={styles.totalXp}>{totalXp} total XP</Text>
            </View>

            {outcome && itemKind ? (
                <View style={[styles.outcomeNotice, outcome === "completed" ? styles.completedNotice : styles.activeNotice]}>
                    <Text style={[styles.outcomeNoticeTitle, outcome === "completed" ? styles.completedNoticeText : styles.activeNoticeText]}>
                        {getReviewOutcomeTitle(outcome, itemKind)}
                    </Text>
                    <Text style={styles.outcomeNoticeDescription}>{getReviewOutcomeDescription(outcome, itemKind)}</Text>
                </View>
            ) : null}

            <View style={styles.breakdownCard}>
                <ResultRow label={`${Math.floor(creditedFocusSeconds / 60)} credited focus minutes`} value={`+${baseXp} XP`} />
                <ResultRow label="Completed-work bonus" value={`+${bonusXp} XP`} muted={bonusXp === 0} />
                {badgeXp > 0 ? <ResultRow label="New badge rewards" value={`+${badgeXp} XP`} /> : null}
                {xpCreditStatus === "under_minimum" ? <Text style={styles.creditNotice}>This session was under five focused minutes.</Text> : null}
                {xpCreditStatus === "daily_limit" ? <Text style={styles.creditNotice}>Today&apos;s six-hour credit limit was already reached. Your personal focused time was still saved.</Text> : null}
                {xpCreditStatus === "unverified" ? <Text style={styles.creditNotice}>This session was not server-verified, so it did not award XP or leaderboard time.</Text> : null}
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

function getReviewOutcomeTitle(outcome: SessionOutcome, itemKind: "Task" | "Quest") {
    if (outcome === "completed") return `${itemKind} completed`;
    if (outcome === "progressed") return "Progress saved";
    if (outcome === "blocked") return "Blocker recorded";
    return "Focused time saved";
}

function getReviewOutcomeDescription(outcome: SessionOutcome, itemKind: "Task" | "Quest") {
    if (outcome === "completed") return `This ${itemKind} moved to Completed.`;
    if (outcome === "progressed") return `This ${itemKind} remains Active so you can focus on it again.`;
    if (outcome === "blocked") return `This ${itemKind} remains Active, with the blocker visible in its Focus history.`;
    return `This ${itemKind} remains Active. Its focused time is still included in its total.`;
}

function ResultRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>{label}</Text>
            <Text style={[styles.breakdownValue, muted && styles.breakdownValueMuted]}>{value}</Text>
        </View>
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

        breakdownCard: {
            width: "100%",
            marginTop: spacing.lg,
            padding: spacing.md,
            gap: spacing.sm,
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.md,
            backgroundColor: colours.surface,
        },

        outcomeNotice: {
            width: "100%",
            marginTop: spacing.lg,
            padding: spacing.md,
            borderWidth: 1,
            borderRadius: radius.md,
        },

        completedNotice: {
            borderColor: colours.success,
            backgroundColor: colours.successSoft,
        },

        activeNotice: {
            borderColor: colours.primaryBorder,
            backgroundColor: colours.primarySoft,
        },

        outcomeNoticeTitle: {
            fontSize: 14,
            fontWeight: "900",
        },

        completedNoticeText: {
            color: colours.success,
        },

        activeNoticeText: {
            color: colours.primaryStrong,
        },

        outcomeNoticeDescription: {
            marginTop: 4,
            fontSize: 12,
            lineHeight: 18,
            color: colours.textMuted,
        },

        breakdownRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.md,
        },

        breakdownLabel: {
            minWidth: 0,
            flex: 1,
            fontSize: 13,
            color: colours.textMuted,
        },

        breakdownValue: {
            flexShrink: 0,
            fontSize: 13,
            fontWeight: "800",
            color: colours.text,
        },

        breakdownValueMuted: {
            color: colours.textMuted,
        },

        creditNotice: {
            fontSize: 12,
            lineHeight: 18,
            color: colours.warning,
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
