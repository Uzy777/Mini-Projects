import { Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { useState, useCallback, useEffect } from "react";
import { useFocusEffect, useRouter } from "expo-router";

import { calculateLevelProgress } from "../../utils/level";
import type { FocusSessionRecord, ActiveFocusSession } from "../../types/models";
import { getFocusSessions } from "../../services/storage/focusSessionsStorage";
import { getTotalXp } from "../../services/storage/xpStorage";
import { getActiveFocusSession } from "../../services/storage/activeFocusSessionStorage";
import { HomeHeader } from "../../components/home/HomeHeader";
import { LevelProgressCard } from "../../components/home/LevelProgressCard";
import { TodaySummaryCard } from "../../components/home/TodaySummaryCard";
import { ContinueQuestCard } from "../../components/home/ContinueQuestCard";
import { ActiveFocusSessionCard } from "../../components/home/ActiveFocusSessionCard";
import { calculateCurrentStreak, calculateTodayFocusSummary, findLatestUnfinishedSession } from "../../utils/focusSessionStats";
import { colours, spacing, radius } from "../../constants/design";
import { RankDisplay } from "@/components/ranks/RankDisplay";
import { RANK_VISUAL_STYLE } from "@/constants/rankConfig";
import { supabase } from "@/lib/supabase";
import { signOut } from "@/services/auth/authService";

export default function HomeScreen() {
    const router = useRouter();

    const [totalXp, setTotalXp] = useState(0);
    const [activeSession, setActiveSession] = useState<ActiveFocusSession | null>(null);
    const [focusSessions, setFocusSessions] = useState<FocusSessionRecord[]>([]);

    useFocusEffect(
        useCallback(() => {
            async function loadTotalXp() {
                try {
                    const currentTotalXp = await getTotalXp();

                    setTotalXp(currentTotalXp);
                } catch (error) {
                    console.error("Failed to load total XP:", error);
                }
            }

            loadTotalXp();
        }, []),
    );

    useFocusEffect(
        useCallback(() => {
            async function loadActiveSession() {
                try {
                    const currentActiveSession = await getActiveFocusSession();

                    setActiveSession(currentActiveSession);
                } catch (error) {
                    console.error("Failed to load active session:", error);

                    setActiveSession(null);
                }
            }

            loadActiveSession();
        }, []),
    );

    useFocusEffect(
        useCallback(() => {
            async function loadFocusSessions() {
                try {
                    const currentSessions = await getFocusSessions();

                    setFocusSessions(currentSessions);
                } catch (error) {
                    console.error("Failed to load focus sessions:", error);

                    setFocusSessions([]);
                }
            }

            loadFocusSessions();
        }, []),
    );

    const { level, xpIntoLevel, xpRequired } = calculateLevelProgress(totalXp);

    const activeSessionHasFinished = activeSession?.isRunning === true && activeSession.endTime !== null && activeSession.endTime <= Date.now();

    const { sessionCount: todaySessionCount, focusedMinutes: todayFocusedMinutes } = calculateTodayFocusSummary(focusSessions);

    const currentStreak = calculateCurrentStreak(focusSessions);

    const latestUnfinishedSession = findLatestUnfinishedSession(focusSessions);

    function getActiveSessionStatus(): "In progress" | "Paused" | "Ready for review" | null {
        if (!activeSession) {
            return null;
        }

        if (activeSessionHasFinished) {
            return "Ready for review";
        }

        if (activeSession.isRunning) {
            return "In progress";
        }

        return "Paused";
    }

    const activeSessionStatus = getActiveSessionStatus();

    function handleStartSession() {
        router.navigate("/journeys");
    }

    function handleReturnToActiveSession() {
        if (!activeSession) {
            return;
        }

        router.push({
            pathname: "/focus/[questId]",
            params: {
                questId: activeSession.questId,
                journeyId: activeSession.journeyId,
                questTitle: activeSession.questTitle,
            },
        });
    }

    function handleContinueQuest() {
        if (!latestUnfinishedSession) {
            return;
        }

        router.push({
            pathname: "/focus/[questId]",
            params: {
                questId: latestUnfinishedSession.questId,
                journeyId: latestUnfinishedSession.journeyId,
                questTitle: latestUnfinishedSession.questTitle,
            },
        });
    }

    async function handleSignOut() {
        const { error } = await signOut();

        if (error) {
            console.error("Failed to sign out:", error);
        }
    }

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.contentSections}>
                <HomeHeader currentStreak={currentStreak} />
                
                <Pressable style={styles.signOutButton} onPress={handleSignOut}>
                    <Text style={styles.signOutButtonText}>Sign out</Text>
                </Pressable>

                <LevelProgressCard level={level} xpIntoLevel={xpIntoLevel} xpRequired={xpRequired} />

                <TodaySummaryCard sessionCount={todaySessionCount} focusedMinutes={todayFocusedMinutes} />

                {activeSession && activeSessionStatus ? (
                    <ActiveFocusSessionCard questTitle={activeSession.questTitle} status={activeSessionStatus} onReturn={handleReturnToActiveSession} />
                ) : latestUnfinishedSession ? (
                    <ContinueQuestCard
                        questTitle={latestUnfinishedSession.questTitle}
                        nextAction={latestUnfinishedSession.nextAction}
                        onContinue={handleContinueQuest}
                    />
                ) : null}

                {!activeSession && (
                    <Pressable style={styles.startButton} onPress={handleStartSession}>
                        <Text style={styles.startButtonText}>Start a focus session</Text>
                    </Pressable>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        width: "100%",
        maxWidth: 720,
        alignSelf: "center",
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: 48,
    },
    startButton: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: "#222222",
    },
    startButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
        textAlign: "center",
    },
    contentSections: {
        gap: spacing.md,
    },
    screen: {
        flex: 1,
        backgroundColor: colours.background,
    },
    signOutButton: {
        alignSelf: "flex-start",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderColor: colours.border,
        borderRadius: radius.md,
        backgroundColor: colours.surface,
        marginTop: -25,
    },

    signOutButtonText: {
        fontSize: 14,
        fontWeight: "700",
        color: colours.textMuted,
    },
});
