import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Flame, Trophy } from "lucide-react-native";

import { AppCard } from "@/components/ui/AppCard";
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
    const currentStreak = useMemo(() => calculateCurrentStreak(sessions), [sessions]);
    const bestStreak = useMemo(() => calculateBestStreak(sessions), [sessions]);
    const weekDays = useMemo(() => getCurrentWeekFocusDays(sessions), [sessions]);

    return (
        <AppCard padding="lg" style={styles.card}>
            <View style={styles.headingRow}>
                <View style={styles.flameIcon}>
                    <Flame size={25} color={colours.warning} fill={colours.warningSoft} />
                </View>
                <View style={styles.headingCopy}>
                    <Text style={styles.eyebrow}>CURRENT STREAK</Text>
                    <View style={styles.streakRow}>
                        <Text style={styles.streakValue}>{currentStreak}</Text>
                        <Text style={styles.streakUnit}>{currentStreak === 1 ? "day" : "days"}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.week} accessibilityLabel="Focused days this week">
                {weekDays.map((day) => (
                    <View key={day.dateKey} style={styles.day}>
                        <View
                            style={[
                                styles.dayDot,
                                day.isFocused && styles.focusedDayDot,
                                day.isToday && styles.todayDot,
                            ]}
                            accessibilityLabel={`${day.label}: ${day.isFocused ? "focused" : "not focused"}${day.isToday ? ", today" : ""}`}
                        >
                            {day.isFocused ? <Flame size={13} color={colours.warning} /> : null}
                        </View>
                        <Text style={[styles.dayLabel, day.isToday && styles.todayLabel]}>{day.label}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.bestRow}>
                <View style={styles.trophyIcon}>
                    <Trophy size={18} color={colours.primaryStrong} />
                </View>
                <View style={styles.bestCopy}>
                    <Text style={styles.bestLabel}>BEST STREAK</Text>
                    <Text style={styles.bestHint}>Your longest run so far</Text>
                </View>
                <Text style={styles.bestValue}>{bestStreak} {bestStreak === 1 ? "day" : "days"}</Text>
            </View>
        </AppCard>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        card: {
            width: "100%",
            gap: spacing.lg,
        },
        headingRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
        },
        flameIcon: {
            width: 50,
            height: 50,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.lg,
            backgroundColor: colours.warningSoft,
        },
        headingCopy: {
            flex: 1,
        },
        eyebrow: {
            fontSize: 10,
            lineHeight: 14,
            fontWeight: "900",
            letterSpacing: 0.8,
            color: colours.textMuted,
        },
        streakRow: {
            marginTop: 2,
            flexDirection: "row",
            alignItems: "baseline",
            gap: 6,
        },
        streakValue: {
            fontSize: 30,
            lineHeight: 36,
            fontWeight: "900",
            color: colours.text,
        },
        streakUnit: {
            fontSize: 14,
            fontWeight: "700",
            color: colours.textMuted,
        },
        week: {
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 4,
        },
        day: {
            flex: 1,
            alignItems: "center",
            gap: spacing.sm,
        },
        dayDot: {
            width: 30,
            height: 30,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.pill,
            backgroundColor: colours.background,
        },
        focusedDayDot: {
            borderColor: colours.warningBorder,
            backgroundColor: colours.warningSoft,
        },
        todayDot: {
            borderWidth: 2,
            borderColor: colours.primary,
        },
        dayLabel: {
            fontSize: 10,
            fontWeight: "700",
            color: colours.textMuted,
        },
        todayLabel: {
            color: colours.primaryStrong,
        },
        divider: {
            height: 1,
            backgroundColor: colours.border,
        },
        bestRow: {
            minWidth: 0,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
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
            fontSize: 10,
            lineHeight: 14,
            fontWeight: "900",
            letterSpacing: 0.7,
            color: colours.primaryStrong,
        },
        bestHint: {
            marginTop: 2,
            fontSize: 11,
            lineHeight: 15,
            color: colours.textMuted,
        },
        bestValue: {
            fontSize: 16,
            fontWeight: "900",
            color: colours.text,
        },
    });
}
