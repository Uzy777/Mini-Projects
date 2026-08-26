import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Coffee } from "lucide-react-native";

import type { AppColours } from "@/constants/appearanceColours";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import type { FocusSessionRecord } from "@/types/models";
import { formatProgressDuration, getCalendarDays, getLocalDateKey, getSessionsForDate, getSessionSeconds, isBreakSession } from "@/utils/dashboardStats";

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
    const selectedFocusSessions = selectedSessions.filter((session) => !isBreakSession(session));
    const selectedBreakSessions = selectedSessions.filter(isBreakSession);
    const selectedSeconds = selectedFocusSessions.reduce((total, session) => total + getSessionSeconds(session), 0);
    const selectedBreakSeconds = selectedBreakSessions.reduce((total, session) => total + getSessionSeconds(session), 0);
    const selectedIsToday = getLocalDateKey(selectedDate) === getLocalDateKey(referenceDate);

    function changeMonth(offset: number) {
        const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1);
        setVisibleMonth(nextMonth);
        setSelectedDate(nextMonth);
    }

    return (
        <View style={[styles.content, isWide && styles.desktopContent]}>
            <ProgressCard style={[styles.calendarCard, isWide && styles.desktopCalendarCard]}>
                <View style={styles.monthHeader}>
                    <AnimatedPressable accessibilityLabel="Previous month" hitSlop={8} onPress={() => changeMonth(-1)} style={({ pressed }) => [styles.arrowButton, pressed && styles.pressed]}>
                        <ChevronLeft size={20} color={colours.text} />
                    </AnimatedPressable>
                    <Text style={styles.monthTitle}>{visibleMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</Text>
                    <AnimatedPressable accessibilityLabel="Next month" hitSlop={8} onPress={() => changeMonth(1)} style={({ pressed }) => [styles.arrowButton, pressed && styles.pressed]}>
                        <ChevronRight size={20} color={colours.text} />
                    </AnimatedPressable>
                </View>

                <View style={styles.calendarLegend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colours.primary }]} />
                        <Text style={styles.legendText}>Focus</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colours.success }]} />
                        <Text style={styles.legendText}>Break</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={styles.todayLegendMarker} />
                        <Text style={styles.legendText}>Today</Text>
                    </View>
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
                                <AnimatedPressable
                                    key={getLocalDateKey(date)}
                                    accessibilityLabel={`${date.toLocaleDateString()}${isToday ? ", today" : ""}. ${daySessions.length} timer ${daySessions.length === 1 ? "entry" : "entries"}.`}
                                    accessibilityState={{ selected: isSelected }}
                                    onPress={() => setSelectedDate(date)}
                                    style={({ pressed }) => [styles.dayCell, isToday && !isSelected && styles.todayDayCell, isSelected && styles.selectedDayCell, pressed && styles.pressed]}
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
                                                    { backgroundColor: isBreakSession(session) ? colours.success : colours.primary },
                                                    isSelected && styles.selectedDayDot,
                                                ]}
                                            />
                                        ))}
                                    </View>
                                </AnimatedPressable>
                            );
                        })}
                    </View>
                ))}
            </ProgressCard>

            <ProgressCard style={[styles.summaryCard, isWide && styles.desktopSummaryCard]}>
                <View style={styles.summaryHeader}>
                    <View>
                        <View style={styles.selectedDateRow}>
                            <Text style={styles.selectedDate}>
                                {selectedDate.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
                            </Text>
                            {selectedIsToday ? <Text style={styles.todayBadge}>TODAY</Text> : null}
                        </View>
                        <Text style={styles.selectedTime}>{formatProgressDuration(selectedSeconds, true)} focused</Text>
                        {selectedBreakSeconds > 0 ? <Text style={styles.selectedBreakTime}>{formatProgressDuration(selectedBreakSeconds, true)} break time</Text> : null}
                    </View>
                    <View style={styles.summaryMetrics}>
                        <View style={styles.summaryMetric}>
                            <Text style={styles.summaryValue}>{selectedFocusSessions.length}</Text>
                            <Text style={styles.summaryLabel}>Focus</Text>
                        </View>
                        <View style={styles.summaryMetric}>
                            <Text style={styles.summaryValue}>{selectedBreakSessions.length}</Text>
                            <Text style={styles.summaryLabel}>Breaks</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                {selectedSessions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <CalendarDays size={28} color={colours.textMuted} />
                        <Text style={styles.emptyTitle}>No timer activity</Text>
                        <Text style={styles.emptyText}>Choose a day with a coloured dot to review its focus sessions and breaks.</Text>
                    </View>
                ) : (
                    <>
                        <ScrollView
                            style={styles.sessionScroller}
                            contentContainerStyle={styles.sessionList}
                            nestedScrollEnabled
                            showsVerticalScrollIndicator={selectedSessions.length > 4}
                        >
                            {selectedSessions.map((session) => (
                                <View key={session.id} style={styles.sessionRow}>
                                    <View style={[styles.sessionIcon, isBreakSession(session) ? styles.breakIcon : session.outcome === "completed" ? styles.completedIcon : styles.focusIcon]}>
                                        {isBreakSession(session) ? (
                                            <Coffee size={17} color={colours.success} />
                                        ) : session.outcome === "completed" ? (
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
                        </ScrollView>
                        {selectedSessions.length > 4 ? <Text style={styles.scrollHint}>Scroll to review all {selectedSessions.length} sessions</Text> : null}
                    </>
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
        calendarLegend: {
            marginBottom: spacing.md,
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.md,
        },
        legendItem: {
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
        },
        legendDot: {
            width: 7,
            height: 7,
            borderRadius: radius.pill,
        },
        todayLegendMarker: {
            width: 13,
            height: 13,
            borderWidth: 2,
            borderColor: colours.primary,
            borderRadius: radius.pill,
            backgroundColor: colours.primarySubtle,
        },
        legendText: {
            fontSize: 10,
            fontWeight: "700",
            color: colours.textMuted,
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
        todayDayCell: {
            borderWidth: 2,
            borderColor: colours.primaryBorder,
            backgroundColor: colours.primarySubtle,
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
            color: colours.onPrimary,
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
            backgroundColor: colours.onPrimary,
        },
        summaryHeader: {
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: spacing.md,
        },
        selectedDateRow: {
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            gap: spacing.sm,
        },
        selectedDate: {
            fontSize: 15,
            fontWeight: "800",
            color: colours.text,
        },
        todayBadge: {
            paddingHorizontal: 7,
            paddingVertical: 3,
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.pill,
            backgroundColor: colours.primarySubtle,
            fontSize: 8,
            fontWeight: "900",
            letterSpacing: 0.5,
            color: colours.primaryStrong,
        },
        selectedTime: {
            marginTop: 4,
            fontSize: 20,
            fontWeight: "800",
            color: colours.text,
        },
        selectedBreakTime: { marginTop: 2, fontSize: 11, fontWeight: "700", color: colours.success },
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
            paddingRight: 3,
        },
        sessionScroller: {
            maxHeight: 300,
        },
        scrollHint: {
            marginTop: spacing.sm,
            fontSize: 10,
            color: colours.textMuted,
            textAlign: "center",
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
        breakIcon: {
            backgroundColor: colours.successSoft,
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
