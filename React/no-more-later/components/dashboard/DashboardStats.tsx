import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Check, ChevronDown, Clock3, Coffee, Target, Zap } from "lucide-react-native";

import type { ReactNode } from "react";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import type { FocusSessionRecord, Journey } from "@/types/models";
import {
    formatProgressDuration,
    getCategoryStats,
    getProgressTrend,
    type ProgressPeriod,
} from "@/utils/dashboardStats";

import { ProgressBarChart, ProgressCard, ProgressDonut, ProgressLineChart } from "./DashboardCharts";

type DashboardStatsProps = {
    sessions: FocusSessionRecord[];
    journeys: Journey[];
    referenceDate?: Date;
};

const PERIOD_OPTIONS: { id: ProgressPeriod; label: string }[] = [
    { id: "month", label: "This Month" },
    { id: "fortnight", label: "Last 14 Days" },
    { id: "quarter", label: "Last 3 Months" },
    { id: "year", label: "This Year" },
];

export function DashboardStats({ sessions, journeys, referenceDate = new Date() }: DashboardStatsProps) {
    const { colours } = useAppearance();
    const { width } = useWindowDimensions();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const [period, setPeriod] = useState<ProgressPeriod>("month");
    const [isPeriodPickerVisible, setIsPeriodPickerVisible] = useState(false);
    const trend = useMemo(() => getProgressTrend(sessions, period, referenceDate), [period, referenceDate, sessions]);
    const periodSessions = useMemo(() => filterPeriodSessions(sessions, period, referenceDate), [period, referenceDate, sessions]);
    const categories = useMemo(() => getCategoryStats(periodSessions, journeys), [journeys, periodSessions]);
    const isWide = width >= 760;
    const focusTotal = trend.focusSeconds.reduce((total, value) => total + value, 0);
    const breakTotal = trend.breakSeconds.reduce((total, value) => total + value, 0);
    const sessionTotal = trend.sessions.reduce((total, value) => total + value, 0);
    const completedTotal = new Set(
        periodSessions
            .filter((session) => session.outcome === "completed" && Boolean(session.questId) && session.sessionKind !== "quick")
            .map((session) => session.questId as string),
    ).size;
    const periodLabel = PERIOD_OPTIONS.find((option) => option.id === period)?.label ?? "This Month";

    return (
        <View style={styles.content}>
            <View style={styles.toolbar}>
                <Text style={styles.toolbarTitle}>Your progress over time</Text>
                <Pressable onPress={() => setIsPeriodPickerVisible(true)} style={({ pressed }) => [styles.periodButton, pressed && styles.pressed]}>
                    <Text style={styles.periodButtonText}>{periodLabel}</Text>
                    <ChevronDown size={15} color={colours.textMuted} />
                </Pressable>
            </View>

            <View style={[styles.statsGrid, isWide && styles.statsGridWide]}>
                <ProgressCard style={styles.chartCard}>
                    <ChartHeader
                        icon={<Clock3 size={17} color={colours.primary} />}
                        title="Focus Time"
                        value={formatProgressDuration(focusTotal, true)}
                        delta={trend.focusDelta}
                        detail={`${sessionTotal} ${sessionTotal === 1 ? "session" : "sessions"} in ${periodLabel.toLowerCase()}`}
                    />
                    <ProgressLineChart values={trend.focusSeconds} labels={trend.labels} height={180} emptyMessage="No focused time in this period." />
                </ProgressCard>

                <ProgressCard style={styles.chartCard}>
                    <ChartHeader
                        icon={<Zap size={17} color={colours.primary} />}
                        title="Sessions"
                        value={String(sessionTotal)}
                        delta={trend.sessionsDelta}
                        detail="Reviewed Focus Sessions"
                    />
                    <ProgressBarChart values={trend.sessions} labels={trend.labels} height={180} emptyMessage="No sessions in this period." />
                </ProgressCard>

                <ProgressCard style={styles.chartCard}>
                    <ChartHeader
                        icon={<Target size={17} color={colours.primary} />}
                        title="Quests Completed"
                        value={String(completedTotal)}
                        delta={trend.questsDelta}
                        detail="Unique Quests marked complete"
                    />
                    <ProgressBarChart values={trend.questsCompleted} labels={trend.labels} height={180} emptyMessage="No completed Quests in this period." />
                </ProgressCard>

                <ProgressCard style={styles.chartCard}>
                    <ChartHeader
                        icon={<Coffee size={17} color={colours.success} />}
                        title="Break Time"
                        value={formatProgressDuration(breakTotal, true)}
                        delta={trend.breakDelta}
                        detail="Short and long breaks · 0 XP"
                    />
                    <ProgressBarChart values={trend.breakSeconds} labels={trend.labels} colour={colours.success} height={180} emptyMessage="No breaks recorded in this period." />
                </ProgressCard>

                <ProgressCard style={[styles.chartCard, styles.donutCard]}>
                    <Text style={styles.cardTitle}>Focus Time by Journey</Text>
                    <Text style={styles.cardDescription}>How focused time is divided between optional Journey folders and standalone Quests.</Text>
                    {categories.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Complete a Focus Session to see your Journey breakdown.</Text>
                        </View>
                    ) : (
                        <ProgressDonut categories={categories} totalLabel={formatProgressDuration(focusTotal, true)} />
                    )}
                </ProgressCard>
            </View>

            <Modal transparent animationType="fade" visible={isPeriodPickerVisible} onRequestClose={() => setIsPeriodPickerVisible(false)}>
                <Pressable style={styles.modalBackdrop} onPress={() => setIsPeriodPickerVisible(false)}>
                    <Pressable style={styles.periodModal} onPress={() => undefined}>
                        <Text style={styles.modalTitle}>Stats period</Text>
                        {PERIOD_OPTIONS.map((option) => {
                            const isSelected = option.id === period;
                            return (
                                <Pressable
                                    key={option.id}
                                    onPress={() => {
                                        setPeriod(option.id);
                                        setIsPeriodPickerVisible(false);
                                    }}
                                    style={({ pressed }) => [styles.periodOption, isSelected && styles.selectedPeriodOption, pressed && styles.pressed]}
                                >
                                    <Text style={[styles.periodOptionText, isSelected && styles.selectedPeriodOptionText]}>{option.label}</Text>
                                    {isSelected && <Check size={18} color={colours.primary} />}
                                </Pressable>
                            );
                        })}
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

function ChartHeader({
    icon,
    title,
    value,
    delta,
    detail,
}: {
    icon: ReactNode;
    title: string;
    value: string;
    delta: number | null;
    detail: string;
}) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const isPositive = delta !== null && delta >= 0;

    return (
        <View style={styles.chartHeader}>
            <View style={styles.chartTitleRow}>
                <View style={styles.chartIcon}>{icon}</View>
                <Text style={styles.cardTitle}>{title}</Text>
            </View>
            <Text style={styles.chartValue}>{value}</Text>
            <Text style={styles.chartDetail}>{detail}</Text>
            {delta !== null ? (
                <Text style={[styles.delta, isPositive ? styles.positiveDelta : styles.negativeDelta]}>
                    {isPositive && delta > 0 ? "+" : ""}
                    {delta}% <Text style={styles.deltaSuffix}>vs previous period</Text>
                </Text>
            ) : null}
        </View>
    );
}

function filterPeriodSessions(sessions: FocusSessionRecord[], period: ProgressPeriod, referenceDate: Date) {
    let start: Date;

    if (period === "fortnight") {
        start = new Date(referenceDate);
        start.setDate(referenceDate.getDate() - 13);
        start.setHours(0, 0, 0, 0);
    } else if (period === "month") {
        start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    } else if (period === "quarter") {
        start = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 2, 1);
    } else {
        start = new Date(referenceDate.getFullYear(), 0, 1);
    }

    return sessions.filter((session) => {
        const completedAt = new Date(session.completedAt);
        return completedAt >= start && completedAt <= referenceDate;
    });
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        content: {
            gap: spacing.md,
        },
        toolbar: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.md,
        },
        toolbarTitle: {
            flex: 1,
            fontSize: 13,
            fontWeight: "700",
            color: colours.textMuted,
        },
        periodButton: {
            minHeight: 38,
            paddingHorizontal: spacing.md,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,
            backgroundColor: colours.surface,
        },
        periodButtonText: {
            fontSize: 12,
            fontWeight: "700",
            color: colours.text,
        },
        pressed: {
            opacity: 0.7,
        },
        statsGrid: {
            gap: spacing.md,
        },
        statsGridWide: {
            flexDirection: "row",
            flexWrap: "wrap",
        },
        chartCard: {
            minHeight: 300,
            flexGrow: 1,
            flexBasis: "47%",
            minWidth: 0,
        },
        chartHeader: {
            marginBottom: spacing.md,
        },
        chartTitleRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
        },
        chartIcon: {
            width: 30,
            height: 30,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.sm,
            backgroundColor: colours.primarySoft,
        },
        cardTitle: {
            fontSize: 13,
            fontWeight: "800",
            color: colours.text,
        },
        cardDescription: {
            marginTop: 5,
            maxWidth: 420,
            fontSize: 11,
            lineHeight: 16,
            color: colours.textMuted,
        },
        chartValue: {
            marginTop: spacing.sm,
            fontSize: 24,
            lineHeight: 29,
            fontWeight: "800",
            color: colours.text,
        },
        delta: {
            marginTop: 2,
            fontSize: 10,
            fontWeight: "800",
        },
        positiveDelta: {
            color: colours.primary,
        },
        negativeDelta: {
            color: colours.danger,
        },
        deltaSuffix: {
            color: colours.textMuted,
            fontWeight: "500",
        },
        chartDetail: {
            marginTop: 2,
            fontSize: 10,
            color: colours.textMuted,
        },
        donutCard: {
            justifyContent: "flex-start",
        },
        emptyState: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: spacing.xl,
        },
        emptyText: {
            fontSize: 12,
            lineHeight: 18,
            color: colours.textMuted,
            textAlign: "center",
        },
        modalBackdrop: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: spacing.lg,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
        },
        periodModal: {
            width: "100%",
            maxWidth: 360,
            padding: spacing.lg,
            gap: spacing.sm,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },
        modalTitle: {
            marginBottom: spacing.sm,
            fontSize: 18,
            fontWeight: "800",
            color: colours.text,
        },
        periodOption: {
            minHeight: 48,
            paddingHorizontal: spacing.md,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: radius.md,
        },
        selectedPeriodOption: {
            backgroundColor: colours.primarySoft,
        },
        periodOptionText: {
            fontSize: 14,
            fontWeight: "600",
            color: colours.text,
        },
        selectedPeriodOptionText: {
            color: colours.primary,
            fontWeight: "800",
        },
    });
}
