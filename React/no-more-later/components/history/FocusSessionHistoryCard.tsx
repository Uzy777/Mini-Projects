import { StyleSheet, Text, View } from "react-native";

import type { FocusSessionRecord, SessionOutcome } from "../../types/models";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import { useMemo } from "react";

type FocusSessionHistoryCardProps = {
    session: FocusSessionRecord;
};

const outcomeLabels: Record<SessionOutcome, string> = {
    completed: "Quest completed",
    progressed: "Made progress",
    blocked: "Got blocked",
    stopped: "Stopped early",
};

function formatFocusedTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);

    const seconds = totalSeconds % 60;

    if (minutes === 0) {
        return `${seconds} sec`;
    }

    if (seconds === 0) {
        return `${minutes} min`;
    }

    return `${minutes} min ${seconds} sec`;
}

export function FocusSessionHistoryCard({ session }: FocusSessionHistoryCardProps) {
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    const focusedSeconds = session.actualSeconds ?? session.plannedMinutes * 60;

    const questWasCompleted = session.outcome === "completed";

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.questTitle}>{session.questTitle}</Text>

                <View style={styles.xpBadge}>
                    <Text style={styles.xpText}>+{session.earnedXp} XP</Text>
                </View>
            </View>

            <View style={[styles.outcomeBadge, questWasCompleted ? styles.completedOutcomeBadge : styles.defaultOutcomeBadge]}>
                <Text style={[styles.outcomeText, questWasCompleted ? styles.completedOutcomeText : styles.defaultOutcomeText]}>
                    {outcomeLabels[session.outcome].toUpperCase()}
                </Text>
            </View>

            <View style={styles.durationSection}>
                <View>
                    <Text style={styles.focusedValue}>{formatFocusedTime(focusedSeconds)}</Text>

                    <Text style={styles.focusedLabel}>focused</Text>
                </View>

                <View style={styles.plannedSection}>
                    <Text style={styles.detailLabel}>Planned</Text>

                    <Text style={styles.plannedValue}>{session.plannedMinutes} min</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.accomplishmentBox}>
                <Text style={styles.detailLabel}>Accomplishment</Text>

                <Text style={styles.detailText}>{session.accomplishment}</Text>
            </View>

            {session.nextAction && (
                <View style={styles.nextActionBox}>
                    <Text style={styles.nextActionLabel}>NEXT ACTION</Text>

                    <Text style={styles.nextActionText}>{session.nextAction}</Text>
                </View>
            )}

            <Text style={styles.completedDate}>{new Date(session.completedAt).toLocaleString()}</Text>
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
        },

        header: {
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: spacing.md,
        },

        questTitle: {
            flex: 1,
            fontSize: 20,
            lineHeight: 26,
            fontWeight: "800",
            color: colours.text,
        },

        xpBadge: {
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: radius.pill,
            backgroundColor: colours.primarySoft,
        },

        xpText: {
            fontSize: 12,
            fontWeight: "800",
            color: colours.primary,
        },

        outcomeBadge: {
            alignSelf: "flex-start",
            marginTop: spacing.sm,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: radius.pill,
        },

        defaultOutcomeBadge: {
            backgroundColor: colours.primarySoft,
        },

        completedOutcomeBadge: {
            backgroundColor: colours.successSoft,
        },

        outcomeText: {
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 0.6,
        },

        defaultOutcomeText: {
            color: colours.primary,
        },

        completedOutcomeText: {
            color: colours.success,
        },

        durationSection: {
            marginTop: spacing.lg,
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: spacing.lg,
        },

        focusedValue: {
            fontSize: 24,
            lineHeight: 30,
            fontWeight: "800",
            color: colours.text,
        },

        focusedLabel: {
            marginTop: 2,
            fontSize: 13,
            color: colours.textMuted,
        },

        plannedSection: {
            alignItems: "flex-end",
        },

        plannedValue: {
            marginTop: spacing.xs,
            fontSize: 15,
            fontWeight: "700",
            color: colours.text,
        },

        divider: {
            height: 1,
            marginVertical: spacing.lg,
            backgroundColor: colours.border,
        },

        accomplishmentBox: {
            padding: spacing.md,
            borderRadius: radius.md,
            backgroundColor: colours.background,
        },

        detailLabel: {
            fontSize: 12,
            fontWeight: "700",
            color: colours.textMuted,
        },

        detailText: {
            marginTop: spacing.xs,
            fontSize: 14,
            lineHeight: 20,
            color: colours.text,
        },

        nextActionBox: {
            marginTop: spacing.md,
            padding: spacing.md,
            borderRadius: radius.md,
            backgroundColor: colours.primarySoft,
        },

        nextActionLabel: {
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 0.6,
            color: colours.primary,
        },

        nextActionText: {
            marginTop: spacing.xs,
            fontSize: 14,
            lineHeight: 20,
            fontWeight: "600",
            color: colours.text,
        },

        completedDate: {
            marginTop: spacing.md,
            fontSize: 12,
            color: colours.textMuted,
        },
    });
}
