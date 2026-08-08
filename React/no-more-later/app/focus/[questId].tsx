import { useEffect, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { useAudioPlayer } from "expo-audio";

import { ActiveFocusSession } from "../../types/models";
import { clearActiveFocusSession, getActiveFocusSession, saveActiveFocusSession } from "../../services/storage/activeFocusSessionStorage";
import { FocusDurationSelector } from "../../components/focus/FocusDurationSelector";
import { FocusTimerDisplay } from "../../components/focus/FocusTimerDisplay";
import { FocusTimerControls } from "../../components/focus/FocusTimerControls";
import { ActiveSessionNotice } from "../../components/focus/ActiveSessionNotice";
import { calculateActualFocusedSeconds, getRemainingSecondsFromEndTime } from "../../utils/focusTimer";
import { colours, spacing } from "@/constants/design";

const focusCompleteSound = require("../../assets/sounds/focus-complete.mp3");

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
                    const restoredRemainingSeconds = getRemainingSecondsFromEndTime(storedSession.endTime);

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

            const nextRemainingSeconds = getRemainingSecondsFromEndTime(activeEndTime);

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
        const actualSeconds = calculateActualFocusedSeconds({
            selectedMinutes,
            remainingSeconds,
            isRunning,
            endTime,
        });

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

    const hasSessionStarted = remainingSeconds !== null;

    const hasSessionFinished = remainingSeconds === 0;

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            <Stack.Screen
                options={{
                    title: "Focus",
                }}
            />

            <View style={styles.header}>
                <Text style={styles.label}>CURRENT QUEST</Text>

                <Text style={styles.title}>{questTitle ?? "Untitled Quest"}</Text>

                <Text style={styles.subtitle}>Give this one thing your attention.</Text>
            </View>

            <View style={styles.sessionContent}>
                <FocusDurationSelector selectedMinutes={selectedMinutes} onSelectMinutes={setSelectedMinutes} disabled={hasSessionStarted} />

                <ActiveSessionNotice message={sessionMessage} showReturnButton={existingActiveSession !== null} onReturn={handleReturnToActiveSession} />

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
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colours.background,
    },

    contentContainer: {
        width: "100%",
        maxWidth: 640,
        alignSelf: "center",
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: 48,
    },

    header: {
        width: "100%",
        marginBottom: spacing.xl,
    },

    label: {
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 0.7,
        color: colours.primary,
    },

    title: {
        marginTop: spacing.sm,
        fontSize: 30,
        lineHeight: 36,
        fontWeight: "800",
        color: colours.text,
    },

    subtitle: {
        marginTop: spacing.sm,
        fontSize: 15,
        lineHeight: 22,
        color: colours.textMuted,
    },

    sessionContent: {
        width: "100%",
    },
});
