import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3 } from "lucide-react-native";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import type { FocusSessionRecord } from "@/types/models";
import { formatProgressDuration, getCalendarDays, getLocalDateKey, getSessionsForDate, getSessionSeconds } from "@/utils/dashboardStats";

import { ProgressCard } from "./DashboardCharts";

type DashboardCalendarProps = {
    sessions: FocusSessionRecord[];
    referenceDate?: Date;
};

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function DashboardCalendar({ sessions, referenceDate = new Date() }: DashboardCalendarProps) {
    const { colours } = useAppearance();
    const { width } = useWindowDimensions();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const isWide = width >= 860;
    const [visibleMonth, setVisibleMonth] = useState(() => new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState(referenceDate);
    const calendarDays = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);
    const selectedSessions = useMemo(() => getSessionsForDate(sessions, selectedDate), [selectedDate, sessions]);
    const selectedSeconds = selectedSessions.reduce((total, session) => total + getSessionSeconds(session), 0);
    const selectedCompleted = selectedSessions.filter((session) => session.outcome === "completed").length;

    function changeMonth(offset: number) {
        const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1);
        setVisibleMonth(nextMonth);
        setSelectedDate(nextMonth);
    }

    return (
        <View style={[styles.content, isWide && styles.desktopContent]}>
            <ProgressCard style={[styles.calendarCard, isWide && styles.desktopCalendarCard]}>
                <View style={styles.monthHeader}>
                    <Pressable accessibilityLabel="Previous month" hitSlop={8} onPress={() => changeMonth(-1)} style={({ pressed }) => [styles.arrowButton, pressed && styles.pressed]}>
                        <ChevronLeft size={20} color={colours.text} />
                    </Pressable>
                    <Text style={styles.monthTitle}>{visibleMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</Text>
                    <Pressable accessibilityLabel="Next month" hitSlop={8} onPress={() => changeMonth(1)} style={({ pressed }) => [styles.arrowButton, pressed && styles.pressed]}>
                        <ChevronRight size={20} color={colours.text} />
                    </Pressable>
                </View>

                <View style={styles.weekHeader}>
                    {WEEKDAY_LABELS.map((label, index) => (
                        <Text key={`${label}-${index}`} style={styles.weekdayLabel}>
                            {label}
                        </Text>
                    ))}
                </View>

                {Array.from({ length: 6 }, (_, weekIndex) => (
                    <View key={weekIndex} style={styles.weekRow}>
                        {calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7).map((date) => {
                            const daySessions = getSessionsForDate(sessions, date);
                            const isSelected = getLocalDateKey(date) === getLocalDateKey(selectedDate);
                            const isToday = getLocalDateKey(date) === getLocalDateKey(referenceDate);
                            const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();

                            return (
                                <Pressable
                                    key={getLocalDateKey(date)}
                                    accessibilityLabel={date.toLocaleDateString()}
                                    onPress={() => setSelectedDate(date)}
                                    style={({ pressed }) => [styles.dayCell, isSelected && styles.selectedDayCell, pressed && styles.pressed]}
                                >
                                    <Text
                                        style={[
                                            styles.dayNumber,
                                            !isCurrentMonth && styles.outsideMonth,
                                            isToday && !isSelected && styles.todayNumber,
                                            isSelected && styles.selectedDayNumber,
                                        ]}
                                    >
                                        {date.getDate()}
                                    </Text>
                                    <View style={styles.dayDots}>
                                        {daySessions.slice(0, 3).map((session, index) => (
                                            <View
                                                key={session.id}
                                                style={[
                                                    styles.dayDot,
                                                    { backgroundColor: colours.primary },
                                                    isSelected && styles.selectedDayDot,
                                                ]}
                                            />
                                        ))}
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                ))}
            </ProgressCard>

            <ProgressCard style={[styles.summaryCard, isWide && styles.desktopSummaryCard]}>
                <View style={styles.summaryHeader}>
                    <View>
                        <Text style={styles.selectedDate}>
                            {selectedDate.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
                        </Text>
                        <Text style={styles.selectedTime}>{formatProgressDuration(selectedSeconds, true)} focused</Text>
                    </View>
                    <View style={styles.summaryMetrics}>
                        <View style={styles.summaryMetric}>
                            <Text style={styles.summaryValue}>{selectedSessions.length}</Text>
                            <Text style={styles.summaryLabel}>Sessions</Text>
                        </View>
                        <View style={styles.summaryMetric}>
                            <Text style={styles.summaryValue}>{selectedCompleted}</Text>
                            <Text style={styles.summaryLabel}>Completed</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                {selectedSessions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <CalendarDays size={28} color={colours.textMuted} />
                        <Text style={styles.emptyTitle}>No focus activity</Text>
                        <Text style={styles.emptyText}>Choose a day with a coloured dot to review its sessions.</Text>
                    </View>
                ) : (
                    <View style={styles.sessionList}>
                        {selectedSessions.map((session) => (
                            <View key={session.id} style={styles.sessionRow}>
                                <View style={[styles.sessionIcon, session.outcome === "completed" ? styles.completedIcon : styles.focusIcon]}>
                                    {session.outcome === "completed" ? (
                                        <CheckCircle2 size={17} color={colours.primary} />
                                    ) : (
                                        <Clock3 size={17} color={colours.primary} />
                                    )}
                                </View>
                                <View style={styles.sessionCopy}>
                                    <Text numberOfLines={1} style={styles.sessionTitle}>
                                        {session.questTitle}
                                    </Text>
                                    <Text style={styles.sessionMeta}>
                                        {new Date(session.completedAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                                    </Text>
                                </View>
                                <Text style={styles.sessionDuration}>{formatProgressDuration(getSessionSeconds(session), true)}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </ProgressCard>
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        content: {
            gap: spacing.md,
        },
        desktopContent: {
            flexDirection: "row",
            alignItems: "flex-start",
        },
        calendarCard: {
            width: "100%",
        },
        desktopCalendarCard: {
            width: "auto",
            flex: 1.25,
            maxWidth: 620,
        },
        summaryCard: {
            width: "100%",
        },
        desktopSummaryCard: {
            width: "auto",
            flex: 0.75,
            minWidth: 300,
        },
        monthHeader: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: spacing.lg,
        },
        monthTitle: {
            fontSize: 16,
            fontWeight: "800",
            color: colours.text,
        },
        arrowButton: {
            width: 38,
            height: 38,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
        },
        pressed: {
            opacity: 0.65,
        },
        weekHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: spacing.sm,
        },
        weekdayLabel: {
            flex: 1,
            maxWidth: 56,
            fontSize: 11,
            fontWeight: "700",
            color: colours.textMuted,
            textAlign: "center",
        },
        weekRow: {
            flexDirection: "row",
            justifyContent: "space-between",
        },
        dayCell: {
            flex: 1,
            maxWidth: 56,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.md,
        },
        selectedDayCell: {
            backgroundColor: colours.primary,
        },
        dayNumber: {
            fontSize: 13,
            fontWeight: "600",
            color: colours.text,
        },
        outsideMonth: {
            color: colours.textMuted,
            opacity: 0.45,
        },
        todayNumber: {
            color: colours.primary,
            fontWeight: "900",
        },
        selectedDayNumber: {
            color: "#ffffff",
            fontWeight: "800",
        },
        dayDots: {
            height: 5,
            marginTop: 4,
            flexDirection: "row",
            gap: 2,
        },
        dayDot: {
            width: 4,
            height: 4,
            borderRadius: radius.pill,
        },
        selectedDayDot: {
            backgroundColor: "#ffffff",
        },
        summaryHeader: {
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: spacing.md,
        },
        selectedDate: {
            fontSize: 15,
            fontWeight: "800",
            color: colours.text,
        },
        selectedTime: {
            marginTop: 4,
            fontSize: 20,
            fontWeight: "800",
            color: colours.text,
        },
        summaryMetrics: {
            flexDirection: "row",
            gap: spacing.lg,
        },
        summaryMetric: {
            alignItems: "center",
        },
        summaryValue: {
            fontSize: 18,
            fontWeight: "800",
            color: colours.text,
        },
        summaryLabel: {
            marginTop: 2,
            fontSize: 9,
            color: colours.textMuted,
        },
        divider: {
            height: 1,
            marginVertical: spacing.md,
            backgroundColor: colours.border,
        },
        emptyState: {
            alignItems: "center",
            paddingVertical: spacing.xl,
        },
        emptyTitle: {
            marginTop: spacing.sm,
            fontSize: 14,
            fontWeight: "700",
            color: colours.text,
        },
        emptyText: {
            maxWidth: 280,
            marginTop: 4,
            fontSize: 12,
            lineHeight: 18,
            color: colours.textMuted,
            textAlign: "center",
        },
        sessionList: {
            gap: spacing.sm,
        },
        sessionRow: {
            minHeight: 58,
            padding: spacing.sm,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            borderRadius: radius.md,
            backgroundColor: colours.background,
        },
        sessionIcon: {
            width: 36,
            height: 36,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.sm,
        },
        completedIcon: {
            backgroundColor: colours.primarySoft,
        },
        focusIcon: {
            backgroundColor: colours.primarySoft,
        },
        sessionCopy: {
            flex: 1,
        },
        sessionTitle: {
            fontSize: 13,
            fontWeight: "700",
            color: colours.text,
        },
        sessionMeta: {
            marginTop: 3,
            fontSize: 10,
            color: colours.textMuted,
        },
        sessionDuration: {
            fontSize: 12,
            fontWeight: "700",
            color: colours.text,
        },
    });
}
