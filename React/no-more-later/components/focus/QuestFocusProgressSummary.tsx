import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CheckCircle2, CircleStop, TrendingUp, TriangleAlert } from "lucide-react-native";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import type { QuestFocusSummary, SessionOutcome } from "@/types/models";
import { formatProgressDuration } from "@/utils/dashboardStats";

type Props = {
    summary: QuestFocusSummary;
    compact?: boolean;
};

const OUTCOME_LABELS: Record<SessionOutcome, string> = {
    completed: "Completed",
    progressed: "Made progress",
    blocked: "Got blocked",
    stopped: "Stopped early",
};

export function QuestFocusProgressSummary({ summary, compact = false }: Props) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours, compact), [colours, compact]);
    const tone = getOutcomeTone(summary.lastOutcome, colours);
    const Icon = tone.icon;
    const sessionLabel = summary.sessionCount === 1 ? "session" : "sessions";

    if (compact) {
        return (
            <View
                accessibilityLabel={`${formatProgressDuration(summary.totalFocusedSeconds, true)} focused across ${summary.sessionCount} ${sessionLabel}. Last outcome: ${OUTCOME_LABELS[summary.lastOutcome]}.`}
                style={[styles.container, styles.compactContainer, { borderColor: tone.border, backgroundColor: tone.background }]}
            >
                <View style={styles.compactMetrics}>
                    <View style={styles.compactMetric}>
                        <Text style={styles.compactValue}>{formatProgressDuration(summary.totalFocusedSeconds, true)}</Text>
                        <Text style={styles.compactLabel}>focused</Text>
                    </View>
                    <View style={styles.compactDivider} />
                    <View style={styles.compactMetric}>
                        <Text style={styles.compactValue}>{summary.sessionCount}</Text>
                        <Text style={styles.compactLabel}>{sessionLabel}</Text>
                    </View>
                </View>
                <View style={styles.compactOutcomeRow}>
                    <Icon size={14} color={tone.strong} />
                    <Text style={[styles.compactOutcome, { color: tone.strong }]}>Last: {OUTCOME_LABELS[summary.lastOutcome]}</Text>
                    <Text style={styles.compactLastDuration}>{formatProgressDuration(summary.lastSessionFocusedSeconds, true)}</Text>
                </View>
            </View>
        );
    }

    return (
        <View
            accessibilityLabel={`${formatProgressDuration(summary.totalFocusedSeconds, true)} focused across ${summary.sessionCount} ${sessionLabel}. Last outcome: ${OUTCOME_LABELS[summary.lastOutcome]}.`}
            style={[styles.container, { borderColor: tone.border, backgroundColor: tone.background }]}
        >
            <View style={[styles.icon, { backgroundColor: tone.iconBackground }]}>
                <Icon size={compact ? 14 : 17} color={tone.strong} />
            </View>
            <View style={styles.copy}>
                <Text numberOfLines={1} style={styles.total}>
                    {formatProgressDuration(summary.totalFocusedSeconds, true)} focused · {summary.sessionCount} {sessionLabel}
                </Text>
                <Text numberOfLines={1} style={[styles.outcome, { color: tone.strong }]}>
                    Last: {OUTCOME_LABELS[summary.lastOutcome]} · {formatProgressDuration(summary.lastSessionFocusedSeconds, true)}
                </Text>
            </View>
        </View>
    );
}

function getOutcomeTone(outcome: SessionOutcome, colours: AppColours) {
    if (outcome === "completed") return { icon: CheckCircle2, strong: colours.success, border: colours.success, background: colours.successSoft, iconBackground: colours.surface };
    if (outcome === "blocked") return { icon: TriangleAlert, strong: colours.warning, border: colours.warningBorder, background: colours.warningSoft, iconBackground: colours.surface };
    if (outcome === "stopped") return { icon: CircleStop, strong: colours.danger, border: colours.danger, background: colours.dangerSoft, iconBackground: colours.surface };
    return { icon: TrendingUp, strong: colours.primaryStrong, border: colours.primaryBorder, background: colours.primarySoft, iconBackground: colours.surface };
}

function createStyles(colours: AppColours, compact: boolean) {
    return StyleSheet.create({
        container: {
            minWidth: 0,
            flexDirection: "row",
            alignItems: "center",
            gap: compact ? 6 : spacing.sm,
            marginTop: compact ? 5 : spacing.sm,
            paddingHorizontal: compact ? 7 : spacing.sm,
            paddingVertical: compact ? 5 : 8,
            borderWidth: 1,
            borderRadius: radius.sm,
        },
        compactContainer: {
            flexDirection: "column",
            alignItems: "stretch",
            gap: 6,
            paddingHorizontal: spacing.sm,
            paddingVertical: 8,
        },
        compactMetrics: {
            minWidth: 0,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
        },
        compactMetric: {
            minWidth: 0,
            flexDirection: "row",
            alignItems: "baseline",
            gap: 4,
        },
        compactDivider: {
            width: 1,
            height: 14,
            backgroundColor: colours.border,
        },
        compactValue: {
            fontSize: 12,
            lineHeight: 16,
            fontWeight: "900",
            color: colours.text,
        },
        compactLabel: {
            fontSize: 10,
            lineHeight: 14,
            fontWeight: "700",
            color: colours.textMuted,
        },
        compactOutcomeRow: {
            minWidth: 0,
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
        },
        compactOutcome: {
            minWidth: 0,
            flex: 1,
            fontSize: 11,
            lineHeight: 15,
            fontWeight: "800",
        },
        compactLastDuration: {
            fontSize: 11,
            lineHeight: 15,
            fontWeight: "900",
            color: colours.text,
        },
        icon: {
            width: compact ? 24 : 30,
            height: compact ? 24 : 30,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
        },
        copy: {
            minWidth: 0,
            flex: 1,
        },
        total: {
            fontSize: compact ? 10 : 12,
            lineHeight: compact ? 14 : 17,
            fontWeight: "800",
            color: colours.text,
        },
        outcome: {
            marginTop: 1,
            fontSize: compact ? 9 : 11,
            lineHeight: compact ? 13 : 16,
            fontWeight: "700",
        },
    });
}
