import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart3, CalendarDays, LayoutDashboard } from "lucide-react-native";
import { useFocusEffect } from "expo-router";

import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";
import { DashboardCalendar } from "@/components/dashboard/DashboardCalendar";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { getFocusSessions } from "@/services/storage/focusSessionsStorage";
import { getJourneys } from "@/services/storage/journeysStorage";
import type { FocusSessionRecord, Journey } from "@/types/models";

type ProgressSection = "overview" | "calendar" | "stats";

const PROGRESS_VIEWS: { id: ProgressSection; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "stats", label: "Stats", icon: BarChart3 },
];

export default function ProgressScreen() {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const [selectedView, setSelectedView] = useState<ProgressSection>("overview");
    const [sessions, setSessions] = useState<FocusSessionRecord[]>([]);
    const [journeys, setJourneys] = useState<Journey[]>([]);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            async function loadProgress() {
                try {
                    const [storedSessions, storedJourneys] = await Promise.all([getFocusSessions(), getJourneys()]);
                    if (!isActive) {
                        return;
                    }

                    setSessions(storedSessions);
                    setJourneys(storedJourneys);
                } catch (error) {
                    console.error("Failed to load local Progress data:", error);
                    if (isActive) {
                        setSessions([]);
                        setJourneys([]);
                    }
                }
            }

            loadProgress();

            return () => {
                isActive = false;
            };
        }, []),
    );

    return (
        <AppScreenBackground>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.eyebrow}>NO MORE LATER</Text>
                        <Text style={styles.title}>Progress</Text>
                        <Text style={styles.subtitle}>See where your focused time is going.</Text>
                    </View>
                    <View style={styles.headerIcon}>
                        <BarChart3 size={22} color={colours.primary} />
                    </View>
                </View>

                <View accessibilityRole="tablist" style={styles.segmentedControl}>
                    {PROGRESS_VIEWS.map((view) => {
                        const isSelected = view.id === selectedView;
                        const Icon = view.icon;
                        return (
                            <Pressable
                                key={view.id}
                                accessibilityRole="tab"
                                accessibilityState={{ selected: isSelected }}
                                onPress={() => setSelectedView(view.id)}
                                style={({ pressed }) => [styles.segment, isSelected && styles.selectedSegment, pressed && styles.pressedSegment]}
                            >
                                <Icon size={15} color={isSelected ? "#ffffff" : colours.textMuted} />
                                <Text style={[styles.segmentText, isSelected && styles.selectedSegmentText]}>{view.label}</Text>
                            </Pressable>
                        );
                    })}
                </View>

                {sessions.length === 0 && (
                    <View style={styles.emptyNotice}>
                        <View style={styles.noticeDot} />
                        <Text style={styles.noticeText}>Complete a Focus Session to begin building your Progress history.</Text>
                    </View>
                )}

                {selectedView === "overview" && <DashboardOverview sessions={sessions} journeys={journeys} />}
                {selectedView === "calendar" && <DashboardCalendar sessions={sessions} />}
                {selectedView === "stats" && <DashboardStats sessions={sessions} journeys={journeys} />}
            </ScrollView>
        </AppScreenBackground>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        scrollView: {
            flex: 1,
            backgroundColor: "transparent",
        },
        contentContainer: {
            width: "100%",
            maxWidth: 1040,
            alignSelf: "center",
            paddingHorizontal: spacing.md,
            paddingTop: spacing.lg,
            paddingBottom: 56,
            gap: spacing.md,
        },
        header: {
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: spacing.md,
        },
        eyebrow: {
            fontSize: 11,
            fontWeight: "900",
            letterSpacing: 0.9,
            color: colours.primary,
        },
        title: {
            marginTop: 4,
            fontSize: 30,
            lineHeight: 36,
            fontWeight: "900",
            color: colours.text,
        },
        subtitle: {
            marginTop: 4,
            fontSize: 14,
            lineHeight: 20,
            color: colours.textMuted,
        },
        headerIcon: {
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
            backgroundColor: colours.primarySoft,
        },
        segmentedControl: {
            width: "100%",
            padding: 4,
            flexDirection: "row",
            gap: 4,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,
            backgroundColor: colours.surface,
        },
        segment: {
            flex: 1,
            minHeight: 40,
            paddingHorizontal: spacing.sm,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            borderRadius: radius.sm,
        },
        selectedSegment: {
            backgroundColor: colours.primary,
        },
        pressedSegment: {
            opacity: 0.75,
        },
        segmentText: {
            fontSize: 12,
            fontWeight: "700",
            color: colours.textMuted,
        },
        selectedSegmentText: {
            color: "#ffffff",
        },
        emptyNotice: {
            minHeight: 34,
            paddingHorizontal: spacing.md,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.md,
            backgroundColor: colours.primarySoft,
        },
        noticeDot: {
            width: 7,
            height: 7,
            borderRadius: radius.pill,
            backgroundColor: colours.primary,
        },
        noticeText: {
            flex: 1,
            fontSize: 11,
            lineHeight: 16,
            color: colours.primary,
        },
    });
}
