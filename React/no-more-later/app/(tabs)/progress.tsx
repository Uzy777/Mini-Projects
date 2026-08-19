import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart3, CalendarDays, LayoutDashboard } from "lucide-react-native";
import { useFocusEffect } from "expo-router";

import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";
import { DashboardCalendar } from "@/components/dashboard/DashboardCalendar";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { useAuth } from "@/contexts/AuthContext";
import { getRemoteFocusSessions } from "@/services/focusSessions/focusSessionService";
import { getRemoteJourneys } from "@/services/journeys/journeyService";
import { updateDailyFocusGoal } from "@/services/profile/profileService";
import type { FocusSessionRecord, Journey } from "@/types/models";

type ProgressSection = "overview" | "calendar" | "stats";

const PROGRESS_VIEWS: { id: ProgressSection; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "stats", label: "Stats", icon: BarChart3 },
];

export default function ProgressScreen() {
    const { colours } = useAppearance();
    const { session, profile, refreshProfile } = useAuth();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const [selectedView, setSelectedView] = useState<ProgressSection>("overview");
    const [sessions, setSessions] = useState<FocusSessionRecord[]>([]);
    const [journeys, setJourneys] = useState<Journey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const requestId = useRef(0);

    const loadProgress = useCallback(
        async (mode: "initial" | "refresh" = "initial") => {
            const currentRequestId = requestId.current + 1;
            requestId.current = currentRequestId;

            if (mode === "refresh") {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            if (!session) {
                setSessions([]);
                setJourneys([]);
                setErrorMessage("Sign in to load your Progress history.");
                setIsLoading(false);
                setIsRefreshing(false);
                return;
            }

            try {
                const [focusSessionsResult, journeysResult] = await Promise.all([
                    getRemoteFocusSessions(session.user.id),
                    getRemoteJourneys(session.user.id),
                ]);

                if (requestId.current !== currentRequestId) {
                    return;
                }

                const loadError = focusSessionsResult.error ?? journeysResult.error;

                if (loadError) {
                    throw loadError;
                }

                setSessions(focusSessionsResult.data ?? []);
                setJourneys(journeysResult.data ?? []);
                setErrorMessage("");
            } catch (error) {
                console.error("Failed to load Progress from Supabase:", error);

                if (requestId.current === currentRequestId) {
                    setErrorMessage("Progress could not be loaded. Check your connection and try again.");
                }
            } finally {
                if (requestId.current === currentRequestId) {
                    setIsLoading(false);
                    setIsRefreshing(false);
                }
            }
        },
        [session],
    );

    useFocusEffect(
        useCallback(() => {
            void loadProgress();

            return () => {
                requestId.current += 1;
            };
        }, [loadProgress]),
    );

    async function handleSaveDailyGoal(minutes: number) {
        if (!session) {
            return "Sign in to save your daily focus goal.";
        }

        try {
            const { error } = await updateDailyFocusGoal(session.user.id, minutes);

            if (error) {
                console.error("Failed to update daily focus goal:", error);
                return "Your goal could not be saved. Try again.";
            }

            await refreshProfile();
            return null;
        } catch (error) {
            console.error("Failed to update daily focus goal:", error);
            return "Your goal could not be saved. Try again.";
        }
    }

    return (
        <AppScreenBackground>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => void loadProgress("refresh")}
                        tintColor={colours.primary}
                        colors={[colours.primary]}
                    />
                }
            >
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

                {errorMessage ? (
                    <View style={styles.errorNotice}>
                        <Text style={styles.errorText}>{errorMessage}</Text>
                        <Pressable onPress={() => void loadProgress("refresh")} style={({ pressed }) => [styles.retryButton, pressed && styles.pressedSegment]}>
                            <Text style={styles.retryButtonText}>Try again</Text>
                        </Pressable>
                    </View>
                ) : null}

                {isLoading ? (
                    <View style={styles.loadingState}>
                        <ActivityIndicator size="small" color={colours.primary} />
                        <Text style={styles.loadingText}>Loading your Progress…</Text>
                    </View>
                ) : null}

                {!isLoading && !errorMessage && sessions.length === 0 && (
                    <View style={styles.emptyNotice}>
                        <View style={styles.noticeDot} />
                        <Text style={styles.noticeText}>Complete and review a Focus Session to begin building your Progress history.</Text>
                    </View>
                )}

                {!isLoading && selectedView === "overview" && (
                    <DashboardOverview
                        sessions={sessions}
                        journeys={journeys}
                        dailyGoalMinutes={profile?.daily_focus_goal_minutes ?? 180}
                        onSaveDailyGoal={handleSaveDailyGoal}
                    />
                )}
                {!isLoading && selectedView === "calendar" && <DashboardCalendar sessions={sessions} />}
                {!isLoading && selectedView === "stats" && <DashboardStats sessions={sessions} journeys={journeys} />}
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
        loadingState: {
            minHeight: 180,
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },
        loadingText: {
            fontSize: 12,
            color: colours.textMuted,
        },
        errorNotice: {
            minHeight: 52,
            padding: spacing.md,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            borderWidth: 1,
            borderColor: colours.warningBorder,
            borderRadius: radius.md,
            backgroundColor: colours.warningSoft,
        },
        errorText: {
            flex: 1,
            fontSize: 12,
            lineHeight: 18,
            color: colours.warning,
        },
        retryButton: {
            minHeight: 34,
            paddingHorizontal: spacing.md,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.sm,
            backgroundColor: colours.primary,
        },
        retryButtonText: {
            fontSize: 11,
            fontWeight: "800",
            color: "#ffffff",
        },
    });
}
