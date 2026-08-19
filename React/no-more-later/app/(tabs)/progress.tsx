import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart3, CalendarDays, LayoutDashboard, RotateCcwClock } from "lucide-react-native";
import { useFocusEffect } from "expo-router";

import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";
import { DashboardCalendar } from "@/components/dashboard/DashboardCalendar";
import { DashboardHistory } from "@/components/dashboard/DashboardHistory";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import type { AppColours } from "@/constants/appearanceColours";
import { layout, radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { useAuth } from "@/contexts/AuthContext";
import { getRemoteFocusSessions } from "@/services/focusSessions/focusSessionService";
import { getRemoteJourneys } from "@/services/journeys/journeyService";
import { updateDailyFocusGoal } from "@/services/profile/profileService";
import type { FocusSessionRecord, Journey } from "@/types/models";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import Animated, { FadeIn } from "react-native-reanimated";

type ProgressSection = "overview" | "calendar" | "stats" | "history";

const PROGRESS_VIEWS: { id: ProgressSection; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "stats", label: "Stats", icon: BarChart3 },
    { id: "history", label: "History", icon: RotateCcwClock },
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
                <ScreenHeader
                    title="Progress"
                    subtitle="See where your focused time is going and what your consistency is building."
                    action={
                        <View style={styles.headerIcon}>
                            <BarChart3 size={21} color={colours.primaryStrong} />
                        </View>
                    }
                />

                <View accessibilityRole="tablist" style={styles.segmentedControl}>
                    {PROGRESS_VIEWS.map((view) => {
                        const isSelected = view.id === selectedView;
                        const Icon = view.icon;
                        return (
                            <AnimatedPressable
                                key={view.id}
                                accessibilityRole="tab"
                                accessibilityState={{ selected: isSelected }}
                                onPress={() => setSelectedView(view.id)}
                                style={({ pressed }) => [styles.segment, isSelected && styles.selectedSegment, pressed && styles.pressedSegment]}
                            >
                                <Icon size={15} color={isSelected ? colours.primaryStrong : colours.textMuted} />
                                <Text style={[styles.segmentText, isSelected && styles.selectedSegmentText]}>{view.label}</Text>
                            </AnimatedPressable>
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

                {!isLoading && !errorMessage ? (
                    <Animated.View key={selectedView} entering={FadeIn.duration(180)}>
                        {selectedView === "overview" && (
                            <DashboardOverview
                                sessions={sessions}
                                journeys={journeys}
                                dailyGoalMinutes={profile?.daily_focus_goal_minutes ?? 180}
                                onSaveDailyGoal={handleSaveDailyGoal}
                            />
                        )}
                        {selectedView === "calendar" && <DashboardCalendar sessions={sessions} />}
                        {selectedView === "stats" && <DashboardStats sessions={sessions} journeys={journeys} />}
                        {selectedView === "history" && <DashboardHistory sessions={sessions} journeys={journeys} />}
                    </Animated.View>
                ) : null}
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
            maxWidth: layout.contentMaxWidth,
            alignSelf: "center",
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: 56,
            gap: spacing.md,
        },
        headerIcon: {
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
            backgroundColor: colours.primarySubtle,
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
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            backgroundColor: colours.primarySoft,
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
            color: colours.primaryStrong,
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
            backgroundColor: colours.primarySubtle,
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
            color: colours.primaryStrong,
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
            color: colours.onPrimary,
        },
    });
}
