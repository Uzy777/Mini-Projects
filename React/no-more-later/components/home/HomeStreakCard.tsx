import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Flame, Sparkles, Trophy } from "lucide-react-native";
import Animated, {
    FadeIn,
    FadeInUp,
    useReducedMotion,
} from "react-native-reanimated";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import type { FocusSessionRecord } from "@/types/models";
import { calculateBestStreak, calculateCurrentStreak, getCurrentWeekFocusDays } from "@/utils/focusSessionStats";

type HomeStreakCardProps = {
    sessions: FocusSessionRecord[];
};

export function HomeStreakCard({ sessions }: HomeStreakCardProps) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const reduceMotion = useReducedMotion();
    const currentStreak = useMemo(() => calculateCurrentStreak(sessions), [sessions]);
    const bestStreak = useMemo(() => calculateBestStreak(sessions), [sessions]);
    const weekDays = useMemo(() => getCurrentWeekFocusDays(sessions), [sessions]);
    const hasFocusedToday = weekDays.some((day) => day.isToday && day.isFocused);
    const momentumMessage = getMomentumMessage(currentStreak, hasFocusedToday);

    return (
        <View style={styles.section} accessibilityLabel={`Current streak: ${currentStreak} ${currentStreak === 1 ? "day" : "days"}`}>
            <View style={styles.headingRow}>
                <View style={styles.flameIcon}>
                    <Flame size={27} strokeWidth={2.2} color={colours.warning} fill={colours.warningSoft} />
                </View>

                <View style={styles.headingCopy}>
                    <Text style={styles.eyebrow}>YOUR MOMENTUM</Text>
                    <View style={styles.streakRow}>
                        <Animated.Text key={currentStreak} entering={reduceMotion ? undefined : FadeIn.duration(280)} style={styles.streakValue}>
                            {currentStreak}
                        </Animated.Text>
                        <Text style={styles.streakUnit}>{currentStreak === 1 ? "day" : "days"}</Text>
                    </View>
                </View>

                <View style={[styles.todayStatus, hasFocusedToday && styles.todayStatusComplete]}>
                    <View style={[styles.statusDot, hasFocusedToday && styles.statusDotComplete]} />
                    <Text style={[styles.todayStatusText, hasFocusedToday && styles.todayStatusTextComplete]}>
                        {hasFocusedToday ? "Today done" : "Today open"}
                    </Text>
                </View>
            </View>

            <View style={styles.momentumMessageRow}>
                <Sparkles size={14} color={hasFocusedToday ? colours.primaryStrong : colours.warning} />
                <Text style={styles.momentumMessage}>{momentumMessage}</Text>
            </View>

            <View style={styles.weekPanel} accessibilityLabel="Focused days this week">
                <View style={styles.weekHeader}>
                    <Text style={styles.weekTitle}>THIS WEEK</Text>
                    <Text style={styles.weekProgress}>{weekDays.filter((day) => day.isFocused).length} of 7 days</Text>
                </View>

                <View style={styles.week}>
                    {weekDays.map((day, index) => (
                        <Animated.View
                            key={day.dateKey}
                            entering={reduceMotion ? undefined : FadeInUp.delay(100 + index * 45).duration(300)}
                            style={styles.day}
                        >
                            <View
                                style={[styles.dayDot, day.isFocused && styles.focusedDayDot, day.isToday && styles.todayDot]}
                                accessibilityLabel={`${day.label}: ${day.isFocused ? "focused" : "not focused"}${day.isToday ? ", today" : ""}`}
                            >
                                {day.isFocused ? <Flame size={13} strokeWidth={2.2} color={colours.warning} /> : day.isToday ? <View style={styles.todayInnerDot} /> : null}
                            </View>
                            <Text style={[styles.dayLabel, day.isToday && styles.todayLabel]}>{day.label}</Text>
                        </Animated.View>
                    ))}
                </View>
            </View>

            <View style={styles.bestRow}>
                <View style={styles.trophyIcon}><Trophy size={18} color={colours.primaryStrong} /></View>
                <View style={styles.bestCopy}>
                    <Text style={styles.bestLabel}>PERSONAL BEST</Text>
                    <Text style={styles.bestHint}>
                        {bestStreak === 0
                            ? "Your longest run will appear here"
                            : bestStreak > currentStreak
                                ? `${bestStreak - currentStreak} more to match it`
                                : "You are at your best"}
                    </Text>
                </View>
                <View style={styles.bestValueWrap}>
                    <Text style={styles.bestValue}>{bestStreak}</Text>
                    <Text style={styles.bestUnit}>{bestStreak === 1 ? "day" : "days"}</Text>
                </View>
            </View>
        </View>
    );
}

function getMomentumMessage(currentStreak: number, hasFocusedToday: boolean) {
    if (hasFocusedToday && currentStreak > 1) return "Today is secured. Keep the rhythm going tomorrow.";
    if (hasFocusedToday) return "A strong start. Come back tomorrow and build on it.";
    if (currentStreak > 0) return "Focus for at least 5 minutes today to keep your streak alive.";
    return "Complete a 5-minute Focus Session today to begin your streak.";
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        section: {
            width: "100%",
            gap: spacing.lg,
            paddingVertical: spacing.sm,
        },
        headingRow: {
            minWidth: 0,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
        },
        flameIcon: {
            width: 54,
            height: 54,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.lg,
            backgroundColor: colours.warningSoft,
        },
        headingCopy: {
            minWidth: 0,
            flex: 1,
        },
        eyebrow: {
            fontSize: 10,
            lineHeight: 14,
            fontWeight: "900",
            letterSpacing: 0.9,
            color: colours.textMuted,
        },
        streakRow: {
            marginTop: 1,
            flexDirection: "row",
            alignItems: "baseline",
            gap: 6,
        },
        streakValue: {
            fontSize: 34,
            lineHeight: 39,
            fontWeight: "900",
            letterSpacing: -1,
            color: colours.text,
        },
        streakUnit: {
            fontSize: 13,
            fontWeight: "800",
            color: colours.textMuted,
        },
        todayStatus: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 9,
            paddingVertical: 7,
            borderRadius: radius.pill,
            backgroundColor: colours.warningSoft,
        },
        todayStatusComplete: {
            backgroundColor: colours.successSoft,
        },
        statusDot: {
            width: 6,
            height: 6,
            borderRadius: radius.pill,
            backgroundColor: colours.warning,
        },
        statusDotComplete: {
            backgroundColor: colours.success,
        },
        todayStatusText: {
            fontSize: 9,
            fontWeight: "900",
            color: colours.warning,
        },
        todayStatusTextComplete: {
            color: colours.success,
        },
        momentumMessageRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
        },
        momentumMessage: {
            minWidth: 0,
            flex: 1,
            fontSize: 12,
            lineHeight: 18,
            color: colours.textMuted,
        },
        weekPanel: {
            gap: spacing.md,
            padding: spacing.md,
            borderRadius: radius.lg,
            backgroundColor: colours.primarySubtle,
        },
        weekHeader: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.sm,
        },
        weekTitle: {
            fontSize: 9,
            fontWeight: "900",
            letterSpacing: 0.85,
            color: colours.primaryStrong,
        },
        weekProgress: {
            fontSize: 9,
            fontWeight: "800",
            color: colours.textMuted,
        },
        week: {
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 3,
        },
        day: {
            flex: 1,
            alignItems: "center",
            gap: 7,
        },
        dayDot: {
            width: 30,
            height: 30,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.pill,
            backgroundColor: colours.surface,
        },
        focusedDayDot: {
            borderColor: colours.warningBorder,
            backgroundColor: colours.warningSoft,
        },
        todayDot: {
            borderWidth: 2,
            borderColor: colours.primary,
        },
        todayInnerDot: {
            width: 6,
            height: 6,
            borderRadius: radius.pill,
            backgroundColor: colours.primary,
        },
        dayLabel: {
            fontSize: 9,
            fontWeight: "800",
            color: colours.textMuted,
        },
        todayLabel: {
            color: colours.primaryStrong,
        },
        bestRow: {
            minWidth: 0,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            paddingTop: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colours.border,
        },
        trophyIcon: {
            width: 38,
            height: 38,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.md,
            backgroundColor: colours.primarySoft,
        },
        bestCopy: {
            minWidth: 0,
            flex: 1,
        },
        bestLabel: {
            fontSize: 9,
            lineHeight: 13,
            fontWeight: "900",
            letterSpacing: 0.75,
            color: colours.primaryStrong,
        },
        bestHint: {
            marginTop: 2,
            fontSize: 10,
            lineHeight: 15,
            color: colours.textMuted,
        },
        bestValueWrap: {
            alignItems: "flex-end",
        },
        bestValue: {
            fontSize: 20,
            lineHeight: 23,
            fontWeight: "900",
            color: colours.text,
        },
        bestUnit: {
            fontSize: 9,
            fontWeight: "800",
            color: colours.textMuted,
        },
    });
}
