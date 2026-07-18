import { Pressable, StyleSheet, Text, View } from "react-native";
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

const TOTAL_XP_STORAGE_KEY = "no-more-later-total-xp";

const ACTIVE_FOCUS_SESSION_STORAGE_KEY = "no-more-later-active-focus-session";

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

export default function HomeScreen() {
    const router = useRouter();

    const [totalXp, setTotalXp] = useState(0);
    const [activeSession, setActiveSession] = useState<ActiveFocusSession | null>(null);

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

    const { level, xpIntoLevel, xpRequired } = calculateLevelProgress(totalXp);

    const levelProgressPercentage = (xpIntoLevel / xpRequired) * 100;

    const xpUntilNextLevel = xpRequired - xpIntoLevel;

    const activeSessionHasFinished = activeSession?.isRunning === true && activeSession.endTime !== null && activeSession.endTime <= Date.now();

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
        <View style={styles.container}>
            <Text style={styles.title}>No More Later</Text>

            <Text style={styles.tagline}>Turn later into progress.</Text>

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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: "#f5f5f5",
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
    },
    progressCard: {
        width: "100%",
        maxWidth: 400,
        marginBottom: 24,
        padding: 20,
        borderRadius: 12,
        backgroundColor: "#ffffff",
        alignItems: "center",
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
});
