import { useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { CheckCircle2, Clock3, Flame, Folder, Star, Zap } from "lucide-react-native";

import type { ReactNode } from "react";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import type { FocusSessionRecord, Journey } from "@/types/models";
import { formatProgressDuration, getOverviewStats } from "@/utils/dashboardStats";

import { ProgressBarChart, ProgressCard, ProgressRing } from "./DashboardCharts";

type DashboardOverviewProps = {
    sessions: FocusSessionRecord[];
    journeys: Journey[];
    referenceDate?: Date;
};

export function DashboardOverview({ sessions, journeys, referenceDate = new Date() }: DashboardOverviewProps) {
    const { colours } = useAppearance();
    const { width } = useWindowDimensions();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const stats = useMemo(() => getOverviewStats(sessions, referenceDate, journeys), [journeys, referenceDate, sessions]);
    const isWide = width >= 760;
    const focusGoalSeconds = 3 * 60 * 60;
    const focusProgress = stats.todaySeconds / focusGoalSeconds;
    const dayLabels = stats.weekDates.map((date) => date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2));

    return (
        <View style={styles.content}>
            <View style={styles.sectionHeading}>
                <Text style={styles.sectionTitle}>Today</Text>
                <Text style={styles.sectionMeta}>
                    {referenceDate.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                </Text>
            </View>

            <ProgressCard style={styles.heroCard}>
                <View style={styles.heroDetails}>
                    <View style={styles.heroIcon}>
                        <Clock3 size={28} color={colours.primary} />
                    </View>
                    <View style={styles.heroCopy}>
                        <Text style={styles.heroValue}>{formatProgressDuration(stats.todaySeconds, true)}</Text>
                        <Text style={styles.heroLabel}>Focused today</Text>
                        <View style={styles.goalRow}>
                            <View style={styles.goalDot} />
                            <Text style={styles.goalText}>Goal: {formatProgressDuration(focusGoalSeconds, true)}</Text>
                        </View>
                    </View>
                </View>
                <ProgressRing progress={focusProgress} label={`${Math.round(Math.min(focusProgress, 1) * 100)}%`} />
            </ProgressCard>

            <View style={styles.metricGrid}>
                <MetricTile icon={<Zap size={18} color={colours.primary} />} value={stats.todaySessions} label="Sessions" wide={isWide} />
                <MetricTile
                    icon={<CheckCircle2 size={18} color={colours.primary} />}
                    value={stats.todayCompleted}
                    label="Quests completed"
                    wide={isWide}
                />
                <MetricTile icon={<Flame size={18} color={colours.primary} />} value={stats.streak} label="Day streak" wide={isWide} />
                <MetricTile icon={<Star size={18} color={colours.primary} />} value={stats.todayXp} label="XP earned" wide={isWide} />
            </View>

            <View style={[styles.desktopGrid, isWide && styles.desktopGridWide]}>
                <View style={styles.desktopColumn}>
                    <View style={styles.sectionHeading}>
                        <Text style={styles.sectionTitle}>This Week</Text>
                        <Text style={styles.sectionMeta}>{formatProgressDuration(stats.weekSeconds, true)}</Text>
                    </View>
                    <ProgressCard>
                        <ProgressBarChart
                            values={stats.weekValues}
                            labels={dayLabels}
                            height={170}
                            valueFormatter={(value) => formatProgressDuration(value, true)}
                            emptyMessage="No focused time this week."
                        />
                    </ProgressCard>
                </View>

                <View style={styles.desktopColumn}>
                    <View style={styles.sectionHeading}>
                        <Text style={styles.sectionTitle}>Focus by Journey</Text>
                    </View>
                    <ProgressCard style={styles.categoriesCard}>
                        {stats.categories.length === 0 ? (
                            <Text style={styles.emptyText}>Complete a Focus Session to see how time is shared across Journeys.</Text>
                        ) : (
                            stats.categories.slice(0, 4).map((category) => (
                                <View key={category.id} style={styles.categoryRow}>
                                    <View style={styles.categoryIcon}>
                                        <Folder size={16} color={colours.primary} />
                                    </View>
                                    <View style={styles.categoryDetails}>
                                        <View style={styles.categoryHeader}>
                                            <Text numberOfLines={1} style={styles.categoryName}>
                                                {category.label}
                                            </Text>
                                            <Text style={styles.categoryTime}>{formatProgressDuration(category.focusedSeconds, true)}</Text>
                                        </View>
                                        <View style={styles.categoryTrack}>
                                            <View style={[styles.categoryProgress, { width: `${category.percentage}%` }]} />
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}
                    </ProgressCard>
                </View>
            </View>
        </View>
    );
}

function MetricTile({
    icon,
    value,
    label,
    wide,
}: {
    icon: ReactNode;
    value: number;
    label: string;
    wide: boolean;
}) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <View style={[styles.metricTile, wide && styles.metricTileWide]}>
            <View style={styles.metricIcon}>{icon}</View>
            <View>
                <Text style={styles.metricValue}>{value}</Text>
                <Text style={styles.metricLabel}>{label}</Text>
            </View>
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        content: {
            gap: spacing.md,
        },
        sectionHeading: {
            minHeight: 24,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.md,
        },
        sectionTitle: {
            fontSize: 15,
            fontWeight: "800",
            color: colours.text,
        },
        sectionMeta: {
            fontSize: 12,
            color: colours.textMuted,
        },
        heroCard: {
            minHeight: 124,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.md,
            borderColor: colours.primaryBorder,
            backgroundColor: colours.primarySoft,
        },
        heroDetails: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
        },
        heroIcon: {
            width: 48,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
            backgroundColor: colours.surface,
        },
        heroCopy: {
            flexShrink: 1,
        },
        heroValue: {
            fontSize: 27,
            lineHeight: 32,
            fontWeight: "800",
            color: colours.text,
        },
        heroLabel: {
            marginTop: 1,
            fontSize: 13,
            fontWeight: "600",
            color: colours.text,
        },
        goalRow: {
            marginTop: spacing.sm,
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
        },
        goalDot: {
            width: 6,
            height: 6,
            borderWidth: 1.5,
            borderColor: colours.primary,
            borderRadius: radius.pill,
        },
        goalText: {
            fontSize: 11,
            color: colours.primary,
        },
        metricGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.sm,
        },
        metricTile: {
            minWidth: 140,
            flexGrow: 1,
            flexBasis: "47%",
            minHeight: 76,
            padding: spacing.md,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,
            backgroundColor: colours.surface,
        },
        metricTileWide: {
            flexBasis: "22%",
        },
        metricIcon: {
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.sm,
            backgroundColor: colours.primarySoft,
        },
        metricValue: {
            fontSize: 20,
            fontWeight: "800",
            color: colours.text,
        },
        metricLabel: {
            marginTop: 2,
            fontSize: 10,
            color: colours.textMuted,
        },
        desktopGrid: {
            gap: spacing.lg,
        },
        desktopGridWide: {
            flexDirection: "row",
        },
        desktopColumn: {
            flex: 1,
            minWidth: 0,
            gap: spacing.sm,
        },
        categoriesCard: {
            minHeight: 202,
            justifyContent: "center",
            gap: spacing.md,
        },
        categoryRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
        },
        categoryIcon: {
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.sm,
            backgroundColor: colours.primarySoft,
        },
        categoryDetails: {
            flex: 1,
        },
        categoryHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            gap: spacing.md,
        },
        categoryName: {
            flex: 1,
            fontSize: 12,
            fontWeight: "700",
            color: colours.text,
        },
        categoryTime: {
            fontSize: 10,
            color: colours.textMuted,
        },
        categoryTrack: {
            height: 5,
            marginTop: 7,
            overflow: "hidden",
            borderRadius: radius.pill,
            backgroundColor: colours.border,
        },
        categoryProgress: {
            height: "100%",
            borderRadius: radius.pill,
            backgroundColor: colours.primary,
        },
        emptyText: {
            fontSize: 13,
            lineHeight: 19,
            color: colours.textMuted,
            textAlign: "center",
        },
    });
}
