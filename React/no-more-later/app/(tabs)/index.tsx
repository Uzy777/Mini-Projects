import { Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";

import { calculateLevelProgress } from "../../utils/level";
import { ACTIVE_FOCUS_SESSION_STORAGE_KEY, FOCUS_SESSIONS_STORAGE_KEY, TOTAL_XP_STORAGE_KEY } from "../../constants/storageKeys";
import type { FocusSessionRecord, ActiveFocusSession } from "../../types/models";
import { getFocusSessions } from "../../services/storage/focusSessionsStorage";
import { getTotalXp } from "../../services/storage/xpStorage";
import { getActiveFocusSession } from "../../services/storage/activeFocusSessionStorage";
import { HomeHeader } from "../../components/home/HomeHeader";
import { LevelProgressCard } from "../../components/home/LevelProgressCard";
import { TodaySummaryCard } from "../../components/home/TodaySummaryCard";
import { ContinueQuestCard } from "../../components/home/ContinueQuestCard";
import { ActiveFocusSessionCard } from "../../components/home/ActiveFocusSessionCard";

type FocusSessionSummary = {
    journeyId: string;
    questId: string;
    questTitle: string;
    outcome: "completed" | "progressed" | "blocked" | "stopped";
    nextAction: string;
    actualSeconds?: number;
    plannedMinutes: number;
    completedAt: string;
};

// Using year, month, day to follow the users local calendar
function getLocalDataKey(date: Date) {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDay()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function calculateCurrentStreak(sessions: FocusSessionSummary[]) {
    const sessionDateKeys = new Set(sessions.map((session) => getLocalDataKey(new Date(session.completedAt))));

    const today = new Date();

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let currentDate: Date;

    if (sessionDateKeys.has(getLocalDataKey(today))) {
        currentDate = new Date(today);
    } else if (sessionDateKeys.has(getLocalDataKey(yesterday))) {
        currentDate = new Date(yesterday);
    } else {
        return 0;
    }

    let streak = 0;

    while (sessionDateKeys.has(getLocalDataKey(currentDate))) {
        streak += 1;

        currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
}

function findLatestUnfinishedSession(sessions: FocusSessionSummary[]) {
    const checkedQuestIds = new Set<string>();

    for (const session of sessions) {
        if (checkedQuestIds.has(session.questId)) {
            continue;
        }

        checkedQuestIds.add(session.questId);

        if (session.outcome !== "completed" && session.nextAction.trim()) {
            return session;
        }
    }

    return undefined;
}

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

    const todayDate = new Date().toDateString();

    const currentStreak = calculateCurrentStreak(focusSessions);

    const latestUnfinishedSession = findLatestUnfinishedSession(focusSessions);

    const todaysSessions = focusSessions.filter((session) => {
        const sessionDate = new Date(session.completedAt).toDateString();

        return sessionDate === todayDate;
    });

    const todayFocusedSeconds = todaysSessions.reduce((total, session) => {
        const sessionSeconds = session.actualSeconds ?? session.plannedMinutes * 60;

        return total + sessionSeconds;
    }, 0);

    const todayFocusedMinutes = Math.floor(todayFocusedSeconds / 60);

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

    return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.pageContent}>
                <HomeHeader currentStreak={currentStreak} />

                <LevelProgressCard level={level} xpIntoLevel={xpIntoLevel} xpRequired={xpRequired} />

                <TodaySummaryCard sessionCount={todaysSessions.length} focusedMinutes={todayFocusedMinutes} />

                {!activeSession && latestUnfinishedSession && (
                    <ContinueQuestCard
                        questTitle={latestUnfinishedSession.questTitle}
                        nextAction={latestUnfinishedSession.nextAction}
                        onContinue={handleContinueQuest}
                    />
                )}

                {activeSession && activeSessionStatus && (
                    <ActiveFocusSessionCard questTitle={activeSession.questTitle} status={activeSessionStatus} onReturn={handleReturnToActiveSession} />
                )}

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
    scrollView: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    pageContent: {
        width: "100%",
        maxWidth: 700,
        alignSelf: "center",
    },
    contentContainer: {
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 120,
    },
    tagline: {
        fontSize: 18,
        marginBottom: 32,
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
    totalXpText: {
        marginTop: 4,
        fontSize: 14,
        color: "#666666",
    },
    nextLevelText: {
        marginTop: 6,
        fontSize: 14,
        color: "#666666",
    },
    activeSessionDetails: {
        marginTop: 6,
        fontSize: 14,
        color: "#555555",
    },
    returnButton: {
        marginTop: 16,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#222222",
        alignItems: "center",
    },
    returnButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#ffffff",
    },

    todayStat: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        backgroundColor: "#f0f0f0",
    },
    todayStatValue: {
        fontSize: 24,
        fontWeight: "700",
    },
    todayStatLabel: {
        marginTop: 4,
        fontSize: 13,
        color: "#666666",
    },
    streakCard: {
        width: "100%",
        marginTop: 20,
        padding: 18,
        borderRadius: 12,
        backgroundColor: "#ffffff",
    },
    streakDescription: {
        marginTop: 8,
        fontSize: 14,
        lineHeight: 20,
        color: "#666666",
    },
});
