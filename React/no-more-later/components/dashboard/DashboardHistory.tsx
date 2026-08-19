import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AlertCircle, Check, CheckCircle2, ChevronDown, ChevronRight, Clock3, Coffee, Search, Square } from "lucide-react-native";
import { useRouter } from "expo-router";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import type { FocusSessionRecord, Journey, SessionOutcome } from "@/types/models";
import { formatProgressDuration, getLocalDateKey, getSessionSeconds, isBreakSession } from "@/utils/dashboardStats";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";

type DashboardHistoryProps = {
    sessions: FocusSessionRecord[];
    journeys: Journey[];
};

type HistoryFilter = "all" | "focus" | "break" | SessionOutcome;

const HISTORY_FILTERS: { id: HistoryFilter; label: string }[] = [
    { id: "all", label: "All sessions" },
    { id: "focus", label: "Focus sessions" },
    { id: "break", label: "Breaks" },
    { id: "completed", label: "Completed" },
    { id: "progressed", label: "Progress made" },
    { id: "blocked", label: "Blocked" },
    { id: "stopped", label: "Stopped early" },
];

const PAGE_SIZE = 12;

export function DashboardHistory({ sessions, journeys }: DashboardHistoryProps) {
    const { colours } = useAppearance();
    const router = useRouter();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const [filter, setFilter] = useState<HistoryFilter>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const journeyTitles = useMemo(() => new Map(journeys.map((journey) => [journey.id, journey.title])), [journeys]);
    const normalisedSearch = searchQuery.trim().toLowerCase();
    const filteredSessions = useMemo(
        () =>
            sessions.filter((session) => {
                if (filter === "focus" && isBreakSession(session)) {
                    return false;
                }
                if (filter === "break" && !isBreakSession(session)) {
                    return false;
                }
                if (!["all", "focus", "break"].includes(filter) && (isBreakSession(session) || session.outcome !== filter)) {
                    return false;
                }

                if (!normalisedSearch) {
                    return true;
                }

                const locationLabel = getSessionLocationLabel(session, journeyTitles);
                return session.questTitle.toLowerCase().includes(normalisedSearch) || locationLabel.toLowerCase().includes(normalisedSearch);
            }),
        [filter, journeyTitles, normalisedSearch, sessions],
    );
    const displayedSessions = filteredSessions.slice(0, visibleCount);
    const groupedSessions = useMemo(() => groupSessionsByDate(displayedSessions), [displayedSessions]);
    const selectedFilterLabel = HISTORY_FILTERS.find((option) => option.id === filter)?.label ?? "All sessions";

    function selectFilter(nextFilter: HistoryFilter) {
        setFilter(nextFilter);
        setVisibleCount(PAGE_SIZE);
        setIsFilterVisible(false);
    }

    return (
        <View style={styles.content}>
            <View style={styles.toolbar}>
                <AnimatedPressable onPress={() => setIsFilterVisible(true)} style={styles.filterButton} haptic="selection">
                    <Text style={styles.filterButtonText}>{selectedFilterLabel}</Text>
                    <ChevronDown size={15} color={colours.primary} />
                </AnimatedPressable>

                <View style={styles.toolbarActions}>
                    <AnimatedPressable
                        accessibilityLabel="Search history"
                        onPress={() => {
                            setIsSearchVisible((current) => !current);
                            if (isSearchVisible) {
                                setSearchQuery("");
                            }
                        }}
                        style={[styles.actionButton, isSearchVisible && styles.activeActionButton]}
                        haptic="selection"
                    >
                        <Search size={17} color={isSearchVisible ? colours.primary : colours.textMuted} />
                        <Text style={[styles.actionButtonText, isSearchVisible && styles.activeActionButtonText]}>Search</Text>
                    </AnimatedPressable>
                    {/*
                        The left dropdown is the single History filter control.
                        <Pressable onPress={() => setIsFilterVisible(true)} style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
                            <SlidersHorizontal size={17} color={colours.textMuted} />
                            <Text style={styles.actionButtonText}>Filter</Text>
                        </Pressable>
                    */}
                </View>
            </View>

            {isSearchVisible ? (
                <View style={styles.searchField}>
                    <Search size={17} color={colours.textMuted} />
                    <TextInput
                        autoFocus
                        value={searchQuery}
                        onChangeText={(value) => {
                            setSearchQuery(value);
                            setVisibleCount(PAGE_SIZE);
                        }}
                        placeholder="Search sessions"
                        placeholderTextColor={colours.textMuted}
                        returnKeyType="search"
                        style={styles.searchInput}
                    />
                </View>
            ) : null}

            {groupedSessions.length === 0 ? (
                <View style={styles.emptyState}>
                    <Clock3 size={28} color={colours.textMuted} />
                    <Text style={styles.emptyTitle}>No matching sessions</Text>
                    <Text style={styles.emptyText}>{sessions.length === 0 ? "Completed focus sessions and breaks will appear here." : "Try another search or session filter."}</Text>
                </View>
            ) : (
                groupedSessions.map((group) => (
                    <View key={group.dateKey} style={styles.dateGroup}>
                        <Text style={styles.dateHeading}>{formatDateHeading(group.date)}</Text>
                        <View style={styles.sessionGroup}>
                            {group.sessions.map((session) => (
                                <HistorySessionRow
                                    key={session.id}
                                    session={session}
                                    journeyTitle={getSessionLocationLabel(session, journeyTitles)}
                                    onPress={() =>
                                        router.push({
                                            pathname: "/session/[sessionId]",
                                            params: { sessionId: session.id },
                                        })
                                    }
                                />
                            ))}
                        </View>
                    </View>
                ))
            )}

            {visibleCount < filteredSessions.length ? (
                <AnimatedPressable onPress={() => setVisibleCount((current) => current + PAGE_SIZE)} style={styles.loadMoreButton}>
                    <Text style={styles.loadMoreText}>Load more</Text>
                    <ChevronDown size={16} color={colours.primary} />
                </AnimatedPressable>
            ) : null}

            <Modal transparent animationType="fade" visible={isFilterVisible} onRequestClose={() => setIsFilterVisible(false)}>
                <Pressable style={styles.modalBackdrop} onPress={() => setIsFilterVisible(false)}>
                    <Pressable style={styles.filterModal} onPress={() => undefined}>
                        <Text style={styles.modalTitle}>Filter history</Text>
                        {HISTORY_FILTERS.map((option) => {
                            const isSelected = option.id === filter;
                            return (
                                <AnimatedPressable
                                    key={option.id}
                                    onPress={() => selectFilter(option.id)}
                                    style={[styles.filterOption, isSelected && styles.selectedFilterOption]}
                                    haptic="selection"
                                >
                                    <Text style={[styles.filterOptionText, isSelected && styles.selectedFilterOptionText]}>{option.label}</Text>
                                    {isSelected ? <Check size={18} color={colours.primary} /> : null}
                                </AnimatedPressable>
                            );
                        })}
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

function getSessionLocationLabel(session: FocusSessionRecord, journeyTitles: Map<string, string>) {
    if (isBreakSession(session)) {
        return "Recovery time";
    }
    if (session.sessionKind === "quick") {
        return "No Quest attached";
    }

    return session.journeyId ? journeyTitles.get(session.journeyId) ?? "Journey quests" : "Standalone Quest";
}

function HistorySessionRow({ session, journeyTitle, onPress }: { session: FocusSessionRecord; journeyTitle: string; onPress: () => void }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const focusedSeconds = getSessionSeconds(session);
    const calculatedStartedAt = new Date(new Date(session.completedAt).getTime() - focusedSeconds * 1000);
    const recordedStartedAt = session.timelineEvents?.find((event) => event.type === "started")?.occurredAt;
    const startedAt = recordedStartedAt ? new Date(recordedStartedAt) : calculatedStartedAt;
    const isBreak = isBreakSession(session);

    return (
        <AnimatedPressable onPress={onPress} style={styles.sessionRow} haptic="selection">
            <Text style={styles.sessionTime}>{startedAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</Text>
            <View style={[styles.outcomeIcon, isBreak && styles.breakOutcomeIcon]}>{isBreak ? <Coffee size={18} color={colours.success} /> : getOutcomeIcon(session.outcome, colours.primary)}</View>
            <View style={styles.sessionCopy}>
                <Text numberOfLines={1} style={styles.sessionTitle}>
                    {session.questTitle}
                </Text>
                <Text numberOfLines={1} style={styles.journeyTitle}>
                    {journeyTitle}
                </Text>
            </View>
            <View style={styles.sessionTotals}>
                <Text style={styles.duration}>{formatProgressDuration(focusedSeconds, true)}</Text>
                <Text style={[styles.xp, isBreak && styles.breakXp]}>{isBreak ? "No XP" : `+${session.earnedXp} XP`}</Text>
            </View>
            <ChevronRight size={18} color={colours.textMuted} />
        </AnimatedPressable>
    );
}

function getOutcomeIcon(outcome: SessionOutcome, colour: string) {
    if (outcome === "completed") {
        return <CheckCircle2 size={18} color={colour} />;
    }
    if (outcome === "blocked") {
        return <AlertCircle size={18} color={colour} />;
    }
    if (outcome === "stopped") {
        return <Square size={16} color={colour} />;
    }
    return <Clock3 size={18} color={colour} />;
}

function groupSessionsByDate(sessions: FocusSessionRecord[]) {
    const groups = new Map<string, { dateKey: string; date: Date; sessions: FocusSessionRecord[] }>();

    sessions.forEach((session) => {
        const date = new Date(session.completedAt);
        const dateKey = getLocalDateKey(date);
        const existingGroup = groups.get(dateKey);

        if (existingGroup) {
            existingGroup.sessions.push(session);
        } else {
            groups.set(dateKey, { dateKey, date, sessions: [session] });
        }
    });

    return Array.from(groups.values());
}

function formatDateHeading(date: Date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (getLocalDateKey(date) === getLocalDateKey(today)) {
        return "TODAY";
    }
    if (getLocalDateKey(date) === getLocalDateKey(yesterday)) {
        return "YESTERDAY";
    }

    return date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase();
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        content: {
            width: "100%",
            maxWidth: 860,
            alignSelf: "center",
            gap: spacing.md,
        },
        toolbar: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.md,
        },
        filterButton: {
            minHeight: 38,
            paddingHorizontal: spacing.md,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.md,
            backgroundColor: colours.primarySubtle,
        },
        filterButtonText: {
            fontSize: 12,
            fontWeight: "700",
            color: colours.primaryStrong,
        },
        toolbarActions: {
            flexDirection: "row",
            gap: spacing.sm,
        },
        actionButton: {
            minHeight: 38,
            paddingHorizontal: spacing.md,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,
            backgroundColor: colours.surface,
        },
        activeActionButton: {
            borderColor: colours.primaryBorder,
            backgroundColor: colours.primarySubtle,
        },
        actionButtonText: {
            fontSize: 12,
            fontWeight: "700",
            color: colours.textMuted,
        },
        activeActionButtonText: {
            color: colours.primaryStrong,
        },
        pressed: {
            opacity: 0.68,
        },
        searchField: {
            minHeight: 44,
            paddingHorizontal: spacing.md,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.md,
            backgroundColor: colours.surface,
        },
        searchInput: {
            flex: 1,
            paddingVertical: 10,
            fontSize: 13,
            color: colours.text,
        },
        dateGroup: {
            gap: spacing.sm,
        },
        dateHeading: {
            paddingHorizontal: spacing.sm,
            paddingVertical: 7,
            borderRadius: radius.md,
            backgroundColor: colours.primarySubtle,
            fontSize: 10,
            fontWeight: "800",
            letterSpacing: 0.45,
            color: colours.textMuted,
        },
        sessionGroup: {
            gap: spacing.sm,
        },
        sessionRow: {
            minHeight: 72,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },
        sessionTime: {
            width: 58,
            fontSize: 11,
            color: colours.textMuted,
        },
        outcomeIcon: {
            width: 36,
            height: 36,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
            backgroundColor: colours.primarySoft,
        },
        breakOutcomeIcon: { backgroundColor: colours.successSoft },
        sessionCopy: {
            flex: 1,
            minWidth: 0,
        },
        sessionTitle: {
            fontSize: 14,
            fontWeight: "800",
            color: colours.text,
        },
        journeyTitle: {
            marginTop: 3,
            fontSize: 11,
            color: colours.textMuted,
        },
        sessionTotals: {
            alignItems: "flex-end",
        },
        duration: {
            fontSize: 14,
            fontWeight: "800",
            color: colours.text,
        },
        xp: {
            marginTop: 3,
            fontSize: 11,
            fontWeight: "700",
            color: colours.primary,
        },
        breakXp: { color: colours.success },
        loadMoreButton: {
            minHeight: 46,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,
            backgroundColor: colours.surface,
        },
        loadMoreText: {
            fontSize: 12,
            fontWeight: "800",
            color: colours.primary,
        },
        emptyState: {
            minHeight: 220,
            alignItems: "center",
            justifyContent: "center",
            padding: spacing.xl,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },
        emptyTitle: {
            marginTop: spacing.sm,
            fontSize: 15,
            fontWeight: "800",
            color: colours.text,
        },
        emptyText: {
            maxWidth: 300,
            marginTop: 5,
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
        filterModal: {
            width: "100%",
            maxWidth: 380,
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
        filterOption: {
            minHeight: 46,
            paddingHorizontal: spacing.md,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: radius.md,
        },
        selectedFilterOption: {
            backgroundColor: colours.primarySoft,
        },
        filterOptionText: {
            fontSize: 13,
            fontWeight: "600",
            color: colours.text,
        },
        selectedFilterOptionText: {
            fontWeight: "800",
            color: colours.primary,
        },
    });
}
