import { useEffect, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAudioPlayer } from "expo-audio";

import { ACTIVE_FOCUS_SESSION_STORAGE_KEY } from "../../constants/storageKeys";
import { ActiveFocusSession } from "../../types/models";
import { clearActiveFocusSession, getActiveFocusSession, saveActiveFocusSession } from "../../services/storage/activeFocusSessionStorage";
import { FocusDurationSelector } from "../../components/focus/FocusDurationSelector";
import { FocusTimerDisplay } from "../../components/focus/FocusTimerDisplay";
import { FocusTimerControls } from "../../components/focus/FocusTimerControls";

const focusCompleteSound = require("../../assets/sounds/focus-complete.mp3");

// async function saveActiveFocusSession(session: ActiveFocusSession) {
//     try {
//         await AsyncStorage.setItem(ACTIVE_FOCUS_SESSION_STORAGE_KEY, JSON.stringify(session));
//     } catch (error) {
//         console.error("Failed to save active focus session:", error);
//     }
// }

export default function FocusScreen() {
    const router = useRouter();

    const completionSoundPlayer = useAudioPlayer(focusCompleteSound);

    const { questId, questTitle, journeyId } = useLocalSearchParams<{
        questId: string;
        questTitle?: string;
        journeyId: string;
    }>();

    const [selectedMinutes, setSelectedMinutes] = useState(25);
    const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [sessionMessage, setSessionMessage] = useState("");
    const [existingActiveSession, setExistingActiveSession] = useState<ActiveFocusSession | null>(null);

    useEffect(() => {
        async function loadActiveFocusSession() {
            try {
                const storedSession = await getActiveFocusSession();

                if (!storedSession) {
                    return;
                }

                if (storedSession.questId !== questId || storedSession.journeyId !== journeyId) {
                    return;
                }

                setSelectedMinutes(storedSession.selectedMinutes);

                if (storedSession.isRunning && storedSession.endTime !== null) {
                    const restoredRemainingSeconds = Math.max(0, Math.ceil((storedSession.endTime - Date.now()) / 1000));

                    setRemainingSeconds(restoredRemainingSeconds);

                    if (restoredRemainingSeconds === 0) {
                        setIsRunning(false);
                        setEndTime(null);

                        await clearActiveFocusSession();

                        return;
                    }

                    setEndTime(storedSession.endTime);

                    setIsRunning(true);

                    return;
                }

                setRemainingSeconds(storedSession.remainingSeconds);

                setEndTime(null);
                setIsRunning(false);
            } catch (error) {
                console.error("Failed to load active focus session:", error);
            }
        }

        loadActiveFocusSession();
    }, [questId, journeyId]);

    useEffect(() => {
        if (!isRunning || endTime === null) {
            return;
        }

        const activeEndTime = endTime;

        function updateRemainingTime() {
            const millisecondsRemaining = activeEndTime - Date.now();

            const nextRemainingSeconds = Math.max(0, Math.ceil(millisecondsRemaining / 1000));

            setRemainingSeconds(nextRemainingSeconds);

            if (nextRemainingSeconds === 0) {
                completionSoundPlayer.seekTo(0); // Seek back to the start to play again
                completionSoundPlayer.play();

                setIsRunning(false);
                setEndTime(null);

                clearActiveFocusSession().catch((error) => {
                    console.error("Failed to clear active Focus Session:", error);
                });
            }
        }

        updateRemainingTime();

        const intervalId = setInterval(updateRemainingTime, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [isRunning, endTime, completionSoundPlayer]);

    async function handleStartSession() {
        setSessionMessage("");
        setExistingActiveSession(null);

        try {
            const existingSession = await getActiveFocusSession();

            if (existingSession) {
                const hasExpired = existingSession.isRunning && existingSession.endTime !== null && existingSession.endTime <= Date.now();

                if (hasExpired) {
                    await clearActiveFocusSession();
                } else {
                    setExistingActiveSession(existingSession);

                    const isCurrentQuest = existingSession.questId === questId && existingSession.journeyId === journeyId;

                    if (isCurrentQuest) {
                        setSessionMessage("This Quest already has an active Focus Session.");
                    } else {
                        setSessionMessage(`A Focus Session is already active for "${existingSession.questTitle}".`);
                    }

                    return;
                }
            }

            // CONTROL TIMER FOR TESTING
            // const totalSeconds =
            //     selectedMinutes * 60;

            const totalSeconds = 5;

            const calculatedEndTime = Date.now() + totalSeconds * 1000;

            setRemainingSeconds(totalSeconds);
            setEndTime(calculatedEndTime);
            setIsRunning(true);

            await saveActiveFocusSession({
                questId,
                journeyId,
                questTitle: questTitle ?? "Untitled Quest",
                selectedMinutes,
                remainingSeconds: totalSeconds,
                isRunning: true,
                endTime: calculatedEndTime,
            });
        } catch (error) {
            console.error("Failed to start Focus Session:", error);

            setSessionMessage("The Focus Session could not be started.");
        }
    }

    function handleReturnToActiveSession() {
        if (!existingActiveSession) {
            return;
        }

        router.replace({
            pathname: "/focus/[questId]",
            params: {
                questId: existingActiveSession.questId,
                journeyId: existingActiveSession.journeyId,
                questTitle: existingActiveSession.questTitle,
            },
        });
    }

    async function handleToggleTimer() {
        if (isRunning) {
            const pausedRemainingSeconds = endTime !== null ? Math.max(0, Math.ceil((endTime - Date.now()) / 1000)) : (remainingSeconds ?? 0);

            setRemainingSeconds(pausedRemainingSeconds);
            setIsRunning(false);
            setEndTime(null);

            await saveActiveFocusSession({
                questId,
                journeyId,
                questTitle: questTitle ?? "Untitled Quest",
                selectedMinutes,
                remainingSeconds: pausedRemainingSeconds,
                isRunning: false,
                endTime: null,
            });

            return;
        }

        if (remainingSeconds !== null && remainingSeconds > 0) {
            const resumedEndTime = Date.now() + remainingSeconds * 1000;

            setEndTime(resumedEndTime);
            setIsRunning(true);

            await saveActiveFocusSession({
                questId,
                journeyId,
                questTitle: questTitle ?? "Untitled Quest",
                selectedMinutes,
                remainingSeconds,
                isRunning: true,
                endTime: resumedEndTime,
            });
        }
    }

    async function handleEndSessionEarly() {
        const plannedSeconds = selectedMinutes * 60;

        const accurateRemainingSeconds =
            isRunning && endTime !== null ? Math.max(0, Math.ceil((endTime - Date.now()) / 1000)) : (remainingSeconds ?? plannedSeconds);

        const actualSeconds = Math.max(0, plannedSeconds - accurateRemainingSeconds);

        setIsRunning(false);
        setEndTime(null);

        try {
            await clearActiveFocusSession();

            router.replace({
                pathname: "/review/[questId]",
                params: {
                    questId,
                    questTitle,
                    journeyId,
                    plannedMinutes: selectedMinutes.toString(),
                    actualSeconds: actualSeconds.toString(),
                    endedEarly: "true",
                },
            });
        } catch (error) {
            console.error("Failed to end Focus Session early:", error);
        }

        setSessionMessage("The Focus Session could not be ended.");
    }

    function handleReviewSession() {
        router.push({
            pathname: "/review/[questId]",
            params: {
                questId,
                questTitle,
                journeyId,
                plannedMinutes: selectedMinutes.toString(),
                actualSeconds: (selectedMinutes * 60).toString(),
            },
        });
    }

    function formatTime(totalSeconds: number) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }

    const displayedSeconds = remainingSeconds ?? selectedMinutes * 60;

    const hasSessionStarted = remainingSeconds !== null;

    const hasSessionFinished = remainingSeconds === 0;

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: "Focus Session",
                }}
            />

            <Text style={styles.label}>Current Quest</Text>

            <Text style={styles.title}>{questTitle ?? "Untitled Quest"}</Text>

            <FocusDurationSelector selectedMinutes={selectedMinutes} onSelectMinutes={setSelectedMinutes} disabled={hasSessionStarted} />

            {sessionMessage && <Text style={styles.sessionMessage}>{sessionMessage}</Text>}

            {existingActiveSession && (
                <Pressable style={styles.returnButton} onPress={handleReturnToActiveSession}>
                    <Text style={styles.returnButtonText}>Return to active session</Text>
                </Pressable>
            )}

            {remainingSeconds !== null && <FocusTimerDisplay seconds={remainingSeconds} />}

            <FocusTimerControls
                hasStarted={hasSessionStarted}
                hasFinished={hasSessionFinished}
                isRunning={isRunning}
                onStart={handleStartSession}
                onToggleTimer={handleToggleTimer}
                onEndEarly={handleEndSessionEarly}
                onReview={handleReviewSession}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: "#f5f5f5",
    },
    label: {
        marginTop: 24,
        marginBottom: 8,
        fontSize: 14,
        fontWeight: "600",
        color: "#666666",
    },
    title: {
        fontSize: 30,
        fontWeight: "700",
    },

    sessionMessage: {
        marginTop: 16,
        fontSize: 14,
        lineHeight: 20,
        color: "#b42318",
        textAlign: "center",
    },
    returnButton: {
        marginTop: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
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
