import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { CheckCircle2, Clock3, Coffee, Folder, Pencil, Star, Zap } from "lucide-react-native";

import type { ReactNode } from "react";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import type { FocusSessionRecord, Journey } from "@/types/models";
import { formatProgressDuration, getLocalDateKey, getOverviewStats } from "@/utils/dashboardStats";

import { ProgressBarChart, ProgressCard, ProgressRing } from "./DashboardCharts";
import { DashboardRankCard } from "./DashboardRankCard";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { AnimatedProgressBar } from "@/components/ui/AnimatedProgressBar";
import { AppButton } from "@/components/ui/AppButton";
import { BadgeGallery } from "@/components/badges/BadgeGallery";
import type { BadgeProgressMetrics, BadgeUnlock } from "@/types/badges";

type DashboardOverviewProps = {
    sessions: FocusSessionRecord[];
    journeys: Journey[];
    badgeUnlocks: BadgeUnlock[];
    badgeProgress: BadgeProgressMetrics;
    dailyGoalMinutes: number;
    onSaveDailyGoal: (minutes: number) => Promise<string | null>;
    referenceDate?: Date;
};

const GOAL_PRESETS = [60, 120, 180, 240];

export function DashboardOverview({ sessions, journeys, badgeUnlocks, badgeProgress, dailyGoalMinutes, onSaveDailyGoal, referenceDate = new Date() }: DashboardOverviewProps) {
    const { colours } = useAppearance();
    const { width } = useWindowDimensions();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
    const [goalDraft, setGoalDraft] = useState(String(dailyGoalMinutes));
    const [goalError, setGoalError] = useState("");
    const [isSavingGoal, setIsSavingGoal] = useState(false);
    const stats = useMemo(() => getOverviewStats(sessions, referenceDate, journeys), [journeys, referenceDate, sessions]);
    const isWide = width >= 760;
    const focusGoalSeconds = dailyGoalMinutes * 60;
    const focusProgress = stats.todaySeconds / focusGoalSeconds;
    const dayLabels = stats.weekDates.map((date) => date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2));
    const todayIndex = stats.weekDates.findIndex((date) => getLocalDateKey(date) === getLocalDateKey(referenceDate));
    const badgeXp = badgeUnlocks.reduce((total, unlock) => total + unlock.xpAwarded, 0);

    function openGoalModal() {
        setGoalDraft(String(dailyGoalMinutes));
        setGoalError("");
        setIsGoalModalVisible(true);
    }

    async function saveGoal() {
        const parsedGoal = Number(goalDraft);

        if (!Number.isInteger(parsedGoal) || parsedGoal < 15 || parsedGoal > 1440) {
            setGoalError("Choose a whole number between 15 and 1,440 minutes.");
            return;
        }

        setIsSavingGoal(true);
        setGoalError("");

        const saveError = await onSaveDailyGoal(parsedGoal);

        setIsSavingGoal(false);

        if (saveError) {
            setGoalError(saveError);
            return;
        }

        setIsGoalModalVisible(false);
    }

    return (
        <View style={styles.content}>
            <DashboardRankCard sessions={sessions} badgeXp={badgeXp} />

            <BadgeGallery unlocks={badgeUnlocks} progress={badgeProgress} />

            <View style={styles.sectionHeading}>
                <Text style={styles.sectionTitle}>Today</Text>
                <Text style={styles.sectionMeta}>
                    {referenceDate.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                </Text>
            </View>

            <ProgressCard style={[styles.heroCard, !isWide && styles.heroCardCompact]}>
                <View style={[styles.heroDetails, !isWide && styles.heroDetailsCompact]}>
                    <View style={styles.heroIcon}>
                        <Clock3 size={25} color={colours.primaryStrong} />
                    </View>
                    <View style={styles.heroCopy}>
                        <Text style={styles.heroValue}>{formatProgressDuration(stats.todaySeconds, true)}</Text>
                        <Text style={styles.heroLabel}>Focused today</Text>
                    </View>
                </View>

                <View style={[styles.goalSummary, !isWide && styles.goalSummaryCompact]}>
                    <View>
                        <Text style={styles.goalLabel}>DAILY GOAL</Text>
                        <Text style={styles.goalValue}>{formatProgressDuration(focusGoalSeconds, true)}</Text>
                    </View>
                    <AnimatedPressable onPress={openGoalModal} style={styles.editGoalButton} haptic="selection">
                        <Pencil size={13} color={colours.primaryStrong} />
                        <Text style={styles.editGoalText}>Edit goal</Text>
                    </AnimatedPressable>
                </View>

                <ProgressRing progress={focusProgress} size={isWide ? 74 : 68} label={`${Math.round(Math.min(focusProgress, 1) * 100)}%`} />
            </ProgressCard>

            <View style={styles.metricGrid}>
                <MetricTile icon={<Zap size={18} color={colours.primary} />} value={stats.todaySessions} label="Sessions" wide={isWide} />
                <MetricTile
                    icon={<CheckCircle2 size={18} color={colours.primary} />}
                    value={stats.todayCompleted}
                    label="Quests completed"
                    wide={isWide}
                />
                <MetricTile icon={<Star size={18} color={colours.primaryStrong} />} value={stats.todayXp} label="XP earned today" wide={isWide} />
                <MetricTile icon={<Coffee size={18} color={colours.success} />} value={formatProgressDuration(stats.todayBreakSeconds, true)} label={`${stats.todayBreaks} ${stats.todayBreaks === 1 ? "break" : "breaks"}`} wide={isWide} />
            </View>

            <View style={[styles.desktopGrid, isWide && styles.desktopGridWide]}>
                <View style={styles.desktopColumn}>
                    <View style={styles.sectionHeading}>
                        <Text style={styles.sectionTitle}>This week</Text>
                        <Text style={styles.sectionMeta}>{formatProgressDuration(stats.weekSeconds, true)}</Text>
                    </View>
                    <Text style={styles.sectionDescription}>Focused time per day. Today is highlighted and each value is the reviewed focus time for that day.</Text>
                    <ProgressCard>
                        <ProgressBarChart
                            values={stats.weekValues}
                            labels={dayLabels}
                            height={170}
                            valueFormatter={(value) => formatProgressDuration(value, true)}
                            highlightedIndex={todayIndex}
                            highlightLabel="Today"
                            emptyMessage="No focused time this week."
                        />
                    </ProgressCard>
                </View>

                <View style={styles.desktopColumn}>
                    <View style={styles.sectionHeading}>
                        <Text style={styles.sectionTitle}>Focus by Journey</Text>
                    </View>
                    <Text style={styles.sectionDescription}>This week&apos;s focus time grouped by Journey, standalone Quests, and Quick Focus.</Text>
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
                                        <AnimatedProgressBar progress={category.percentage / 100} height={5} style={styles.categoryProgress} />
                                    </View>
                                </View>
                            ))
                        )}
                    </ProgressCard>
                </View>
            </View>

            <Modal transparent animationType="fade" visible={isGoalModalVisible} onRequestClose={() => !isSavingGoal && setIsGoalModalVisible(false)}>
                <Pressable style={styles.modalBackdrop} onPress={() => !isSavingGoal && setIsGoalModalVisible(false)}>
                    <Pressable style={styles.goalModal} onPress={() => undefined}>
                        <Text style={styles.modalTitle}>Daily focus goal</Text>
                        <Text style={styles.modalDescription}>Set the amount of focused time you want to aim for each day.</Text>

                        <View style={styles.goalPresets}>
                            {GOAL_PRESETS.map((minutes) => {
                                const isSelected = Number(goalDraft) === minutes;
                                return (
                                    <AnimatedPressable
                                        key={minutes}
                                        onPress={() => {
                                            setGoalDraft(String(minutes));
                                            setGoalError("");
                                        }}
                                        style={[styles.goalPreset, isSelected && styles.selectedGoalPreset]}
                                        haptic="selection"
                                    >
                                        <Text style={[styles.goalPresetText, isSelected && styles.selectedGoalPresetText]}>{formatProgressDuration(minutes * 60, true)}</Text>
                                    </AnimatedPressable>
                                );
                            })}
                        </View>

                        <Text style={styles.inputLabel}>Custom goal in minutes</Text>
                        <TextInput
                            value={goalDraft}
                            onChangeText={(value) => {
                                setGoalDraft(value.replace(/[^0-9]/g, ""));
                                setGoalError("");
                            }}
                            editable={!isSavingGoal}
                            keyboardType="number-pad"
                            maxLength={4}
                            selectTextOnFocus
                            style={styles.goalInput}
                        />

                        {goalError ? <Text style={styles.goalError}>{goalError}</Text> : null}

                        <View style={styles.modalActions}>
                            <AppButton label="Cancel" variant="secondary" disabled={isSavingGoal} onPress={() => setIsGoalModalVisible(false)} style={styles.modalButton} />
                            <AppButton label="Save goal" loading={isSavingGoal} onPress={() => void saveGoal()} style={styles.modalButton} />
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
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
    value: number | string;
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
        sectionDescription: {
            marginTop: -4,
            fontSize: 11,
            lineHeight: 16,
            color: colours.textMuted,
        },
        heroCard: {
            minHeight: 124,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.md,
            borderColor: colours.primaryBorder,
            backgroundColor: colours.primarySubtle,
        },
        heroCardCompact: { flexWrap: "wrap" },
        heroDetails: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
        },
        heroDetailsCompact: { width: "100%", flexBasis: "100%" },
        heroIcon: {
            width: 48,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
            backgroundColor: colours.primarySoft,
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
        goalSummary: {
            minWidth: 142,
            padding: spacing.sm,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.md,
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.md,
            backgroundColor: colours.surface,
        },
        goalSummaryCompact: { minWidth: 0, flex: 1 },
        goalLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 0.6, color: colours.textMuted },
        goalValue: { marginTop: 2, fontSize: 15, fontWeight: "800", color: colours.text },
        editGoalButton: {
            minHeight: 34,
            paddingHorizontal: spacing.sm,
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            borderRadius: radius.sm,
            backgroundColor: colours.primarySoft,
        },
        editGoalText: { fontSize: 11, fontWeight: "800", color: colours.primaryStrong },
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
            backgroundColor: colours.primarySubtle,
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
            backgroundColor: colours.primarySubtle,
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
        categoryProgress: { marginTop: 7 },
        emptyText: {
            fontSize: 13,
            lineHeight: 19,
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
        goalModal: {
            width: "100%",
            maxWidth: 420,
            padding: spacing.lg,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: "800",
            color: colours.text,
        },
        modalDescription: {
            marginTop: spacing.sm,
            fontSize: 13,
            lineHeight: 19,
            color: colours.textMuted,
        },
        goalPresets: {
            marginTop: spacing.lg,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.sm,
        },
        goalPreset: {
            minHeight: 38,
            paddingHorizontal: spacing.md,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.pill,
            backgroundColor: colours.background,
        },
        selectedGoalPreset: {
            borderColor: colours.primaryBorder,
            backgroundColor: colours.primarySoft,
        },
        goalPresetText: {
            fontSize: 12,
            fontWeight: "700",
            color: colours.textMuted,
        },
        selectedGoalPresetText: {
            color: colours.primary,
        },
        inputLabel: {
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
            fontSize: 12,
            fontWeight: "700",
            color: colours.text,
        },
        goalInput: {
            minHeight: 48,
            paddingHorizontal: spacing.md,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,
            backgroundColor: colours.background,
            fontSize: 16,
            fontWeight: "700",
            color: colours.text,
        },
        goalError: {
            marginTop: spacing.sm,
            fontSize: 12,
            lineHeight: 18,
            color: colours.danger,
        },
        modalActions: {
            marginTop: spacing.lg,
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: spacing.sm,
        },
        modalButton: { flex: 1 },
    });
}
