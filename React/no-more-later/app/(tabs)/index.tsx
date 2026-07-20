import { Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";

type ActiveFocusSession = {
    questId: string;
    journeyId: string;
    questTitle: string;
    selectedMinutes: number;
    remainingSeconds: number;
    isRunning: boolean;
    endTime: number | null;
};

type FocusSessionSummary = {
    actualSeconds: number;
    plannedMinutes: number;
    completedAt: string;
};

const TOTAL_XP_STORAGE_KEY = "no-more-later-total-xp";

const ACTIVE_FOCUS_SESSION_STORAGE_KEY = "no-more-later-active-focus-session";

const FOCUS_SESSIONS_STORAGE_KEY = "no-more-later-focus-sessions";

const STARTING_LEVEL_XP = 100;
const XP_INCREASE_PER_LEVEL = 25;

function getXpRequiredForLevel(level: number) {
    return STARTING_LEVEL_XP + (level - 1) * XP_INCREASE_PER_LEVEL;
}

function calculateLevelProgress(totalXp: number) {
    let level = 1;
    let xpIntoLevel = totalXp;
    let xpRequired = getXpRequiredForLevel(level);

    while (xpIntoLevel >= xpRequired) {
        xpIntoLevel -= xpRequired;
        level += 1;
        xpRequired = getXpRequiredForLevel(level);
    }

    return {
        level,
        xpIntoLevel,
        xpRequired,
    };
}

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

export default function HomeScreen() {
    const router = useRouter();

    const [totalXp, setTotalXp] = useState(0);
    const [activeSession, setActiveSession] = useState<ActiveFocusSession | null>(null);
    const [focusSessions, setFocusSessions] = useState<FocusSessionSummary[]>([]);

    useFocusEffect(
        useCallback(() => {
            async function loadTotalXp() {
                try {
                    const storedTotalXp = await AsyncStorage.getItem(TOTAL_XP_STORAGE_KEY);

                    const parsedTotalXp = storedTotalXp ? Number(storedTotalXp) : 0;

                    setTotalXp(parsedTotalXp);
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
                    const storedSession = await AsyncStorage.getItem(ACTIVE_FOCUS_SESSION_STORAGE_KEY);

                    const parsedSession: ActiveFocusSession | null = storedSession ? JSON.parse(storedSession) : null;

                    setActiveSession(parsedSession);
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
                    const storedSessions = await AsyncStorage.getItem(FOCUS_SESSIONS_STORAGE_KEY);

                    const parsedSessions: FocusSessionSummary[] = storedSessions ? JSON.parse(storedSessions) : [];

                    setFocusSessions(parsedSessions);
                } catch (error) {
                    console.error("Failed to load focus sessions:", error);

                    setFocusSessions([]);
                }
            }

            loadFocusSessions();
        }, []),
    );

    const { level, xpIntoLevel, xpRequired } = calculateLevelProgress(totalXp);

    const levelProgressPercentage = (xpIntoLevel / xpRequired) * 100;

    const xpUntilNextLevel = xpRequired - xpIntoLevel;

    const activeSessionHasFinished = activeSession?.isRunning === true && activeSession.endTime !== null && activeSession.endTime <= Date.now();

    const todayDate = new Date().toDateString();

    const currentStreak = calculateCurrentStreak(focusSessions);

    const todaysSessions = focusSessions.filter((session) => {
        const sessionDate = new Date(session.completedAt).toDateString();

        return sessionDate === todayDate;
    });

    const todayFocusedSeconds = todaysSessions.reduce((total, session) => {
        const sessionSeconds = session.actualSeconds ?? session.plannedMinutes * 60;

        return total + sessionSeconds;
    }, 0);

    const todayFocusedMinutes = Math.floor(todayFocusedSeconds / 60);

    function getActiveSessionStatus() {
        if (!activeSession) {
            return "";
        }

        if (activeSessionHasFinished) {
            return "Ready for review";
        }

        if (activeSession.isRunning) {
            return "In progress";
        }

        return "Paused";
    }

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

    return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.pageContent}>
                <View style={styles.headerRow}>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>No More Later</Text>

                        <Text style={styles.tagline}>Turn later into progress.</Text>
                    </View>

                    <View style={styles.streakBadge}>
                        <Text style={styles.streakValue}>{currentStreak}</Text>

                        <Text style={styles.streakLabel}>{currentStreak === 1 ? "day streak" : "day streak"}</Text>
                    </View>
                </View>

                <View style={styles.progressCard}>
                    <Text style={styles.levelText}>Level {level}</Text>

                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${levelProgressPercentage}%` }]}></View>
                    </View>

                    <Text style={styles.xpText}>
                        {xpIntoLevel} / {xpRequired} XP
                    </Text>

                    <Text style={styles.nextLevelText}>
                        {xpUntilNextLevel} XP until Level {level + 1}
                    </Text>

                    <Text style={styles.totalXpText}>Total XP: {totalXp}</Text>
                </View>

                <View style={styles.todayCard}>
                    <Text style={styles.todayTitle}>Today</Text>

                    <View style={styles.todayStats}>
                        <View style={styles.todayStat}>
                            <Text style={styles.todayStatValue}>{todaysSessions.length}</Text>

                            <Text style={styles.todayStatLabel}>{todaysSessions.length === 1 ? "Focus session" : "Focus sessions"}</Text>
                        </View>

                        <View style={styles.todayStat}>
                            <Text style={styles.todayStatValue}>{todayFocusedMinutes}</Text>

                            <Text style={styles.todayStatLabel}>Minutes focused</Text>
                        </View>
                    </View>
                </View>

                {/* <View style={styles.streakCard}>
                    <Text style={styles.streakLabel}>Current Streak</Text>

                    <Text style={styles.streakValue}>
                        {currentStreak} {currentStreak === 1 ? "day" : "days"}
                    </Text>

                    <Text style={styles.streakDescription}>Complete at least one Focus Session each day to keep yoru streak going.</Text>
                </View> */}

                {activeSession && (
                    <View style={styles.activeSessionCard}>
                        <Text style={styles.activeSessionLabel}>Active Focus Session</Text>

                        <Text style={styles.activeSessionTitle}>{activeSession.questTitle}</Text>

                        <Text style={styles.activeSessionDetails}>
                            {activeSession.selectedMinutes}-minute session
                            {" · "}
                            {getActiveSessionStatus()}
                        </Text>

                        <Pressable style={styles.returnButton} onPress={handleReturnToActiveSession}>
                            <Text style={styles.returnButtonText}>{activeSessionHasFinished ? "Review Session" : "Return to Session"}</Text>
                        </Pressable>
                    </View>
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
    title: {
        fontSize: 32,
        fontWeight: "700",
        marginBottom: 8,
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
    progressCard: {
        width: "100%",
        maxWidth: 400,
        marginBottom: 24,
        padding: 20,
        borderRadius: 12,
        backgroundColor: "#ffffff",
        alignItems: "center",
        alignSelf: "center",
    },
    levelText: {
        fontSize: 24,
        fontWeight: "700",
    },
    xpText: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: "600",
    },
    totalXpText: {
        marginTop: 4,
        fontSize: 14,
        color: "#666666",
    },
    progressTrack: {
        width: "100%",
        height: 12,
        marginTop: 16,
        borderRadius: 6,
        backgroundColor: "#dddddd",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 6,
        backgroundColor: "#222222",
    },
    nextLevelText: {
        marginTop: 6,
        fontSize: 14,
        color: "#666666",
    },
    activeSessionCard: {
        marginTop: 20,
        padding: 18,
        borderRadius: 12,
        backgroundColor: "#ffffff",
    },
    activeSessionLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#666666",
    },
    activeSessionTitle: {
        marginTop: 6,
        fontSize: 18,
        fontWeight: "700",
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
    todayCard: {
        marginTop: 20,
        marginBottom: 18,
        padding: 18,
        borderRadius: 12,
        backgroundColor: "#ffffff",
    },
    todayTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    todayStats: {
        marginTop: 16,
        flexDirection: "row",
        gap: 16,
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

    headerRow: {
        width: "100%",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
    },
    headerText: {
        flex: 1,
    },
    streakBadge: {
        minWidth: 82,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: "#ffffff",
        alignItems: "center",
    },
    streakValue: {
        fontSize: 22,
        fontWeight: "700",
    },
    streakLabel: {
        marginTop: 2,
        fontSize: 12,
        fontWeight: "600",
        color: "#666666",
    },
});
