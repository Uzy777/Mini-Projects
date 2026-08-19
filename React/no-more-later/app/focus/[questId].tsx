import { useEffect, useMemo, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, ScrollView } from "react-native";
import { useAudioPlayer } from "expo-audio";
import * as Crypto from "expo-crypto";

import type { ActiveFocusSession, FocusTimelineEvent } from "../../types/models";
import { getActiveFocusSession, saveActiveFocusSession } from "../../services/storage/activeFocusSessionStorage";
import { FocusDurationSelector } from "../../components/focus/FocusDurationSelector";
import { FocusTimerDisplay } from "../../components/focus/FocusTimerDisplay";
import { FocusTimerControls } from "../../components/focus/FocusTimerControls";
import { ActiveSessionNotice } from "../../components/focus/ActiveSessionNotice";
import { calculateActualFocusedSeconds, getActiveSessionReviewState, getRemainingSecondsFromEndTime } from "../../utils/focusTimer";
import { spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";
import { AppCard } from "@/components/ui/AppCard";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { getTimerPreferences } from "@/services/storage/timerPreferencesStorage";

const focusCompleteSound = require("../../assets/sounds/focus-complete.mp3");

export default function FocusScreen() {
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    const router = useRouter();

    const completionSoundPlayer = useAudioPlayer(focusCompleteSound);

    const { questId, questTitle, journeyId, source } = useLocalSearchParams<{
        questId: string;
        questTitle?: string;
        journeyId?: string;
        source?: "work" | "tasks" | "quick-focus";
    }>();

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [selectedMinutes, setSelectedMinutes] = useState(25);
    const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [timelineEvents, setTimelineEvents] = useState<FocusTimelineEvent[]>([]);
    const [sessionMessage, setSessionMessage] = useState("");
    const [existingActiveSession, setExistingActiveSession] = useState<ActiveFocusSession | null>(null);

    useEffect(() => {
        async function loadActiveFocusSession() {
            try {
                const [storedSession, timerPreferences] = await Promise.all([getActiveFocusSession(), getTimerPreferences()]);

                if (!storedSession) {
                    setSelectedMinutes(timerPreferences.focus);
                    return;
                }

                if (storedSession.questId !== questId || storedSession.journeyId !== journeyId) {
                    setSelectedMinutes(timerPreferences.focus);
                    return;
                }

                const storedSessionId = storedSession.id || Crypto.randomUUID();

                setSessionId(storedSessionId);

                if (!storedSession.id) {
                    await saveActiveFocusSession({
                        ...storedSession,
                        id: storedSessionId,
                    });
                }
                if (storedSession.questId !== questId || storedSession.journeyId !== journeyId) {
                    return;
                }

                setSelectedMinutes(storedSession.selectedMinutes);
                setTimelineEvents(storedSession.timelineEvents ?? []);

                if (storedSession.isRunning && storedSession.endTime !== null) {
                    const restoredRemainingSeconds = getRemainingSecondsFromEndTime(storedSession.endTime);

                    setRemainingSeconds(restoredRemainingSeconds);

                    if (restoredRemainingSeconds === 0) {
                        const completedTimelineEvents = appendCompletedEvent(storedSession.timelineEvents ?? [], storedSession.endTime);

                        setIsRunning(false);
                        setEndTime(null);
                        setTimelineEvents(completedTimelineEvents);

                        await saveActiveFocusSession({
                            ...storedSession,
                            id: storedSessionId,
                            remainingSeconds: 0,
                            actualSeconds: storedSession.selectedMinutes * 60,
                            endedEarly: false,
                            isRunning: false,
                            endTime: null,
                            timelineEvents: completedTimelineEvents,
                            ...(source ? { source } : {}),
                        });

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
    }, [questId, journeyId, source]);

    useEffect(() => {
        if (!isRunning || endTime === null || !sessionId) {
            return;
        }

        const activeSessionId = sessionId;
        const activeEndTime = endTime;

        function updateRemainingTime() {
            const nextRemainingSeconds = getRemainingSecondsFromEndTime(activeEndTime);

            setRemainingSeconds(nextRemainingSeconds);

            if (nextRemainingSeconds === 0) {
                const completedTimelineEvents = appendCompletedEvent(timelineEvents, activeEndTime);

                completionSoundPlayer.seekTo(0);
                completionSoundPlayer.play();

                setIsRunning(false);
                setEndTime(null);
                setTimelineEvents(completedTimelineEvents);

                saveActiveFocusSession({
                    id: activeSessionId,
                    questId,
                    journeyId,
                    questTitle: questTitle ?? (source === "tasks" ? "Untitled Task" : "Untitled Quest"),
                    selectedMinutes,
                    remainingSeconds: 0,
                    actualSeconds: selectedMinutes * 60,
                    endedEarly: false,
                    isRunning: false,
                    endTime: null,
                    timelineEvents: completedTimelineEvents,
                    ...(source ? { source } : {}),
                }).catch((error) => {
                    console.error("Failed to save completed Focus Session:", error);
                });
            }
        }

        updateRemainingTime();

        const intervalId = setInterval(updateRemainingTime, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [isRunning, endTime, sessionId, completionSoundPlayer, questId, journeyId, questTitle, selectedMinutes, source, timelineEvents]);

    async function handleStartSession() {
        setSessionMessage("");
        setExistingActiveSession(null);

        try {
            const existingSession = await getActiveFocusSession();

            if (existingSession) {
                const hasExpired = existingSession.isRunning && existingSession.endTime !== null && existingSession.endTime <= Date.now();

                if (hasExpired) {
                    const completedTimelineEvents = appendCompletedEvent(existingSession.timelineEvents ?? [], existingSession.endTime ?? Date.now());
                    const completedSession: ActiveFocusSession = {
                        ...existingSession,
                        remainingSeconds: 0,
                        actualSeconds: existingSession.selectedMinutes * 60,
                        endedEarly: false,
                        isRunning: false,
                        endTime: null,
                        timelineEvents: completedTimelineEvents,
                    };

                    await saveActiveFocusSession(completedSession);

                    setExistingActiveSession(completedSession);

                    setSessionMessage(existingSession.timerMode && existingSession.timerMode !== "focus" ? `Your ${existingSession.questTitle} is complete. Return Home to save it.` : `"${existingSession.questTitle}" is ready for Review.`);

                    return;
                } else {
                    setExistingActiveSession(existingSession);

                    const isCurrentQuest = existingSession.questId === questId && existingSession.journeyId === journeyId;

                    if (isCurrentQuest) {
                        setSessionMessage(`This ${source === "tasks" ? "Task" : "Quest"} already has an active Focus Session.`);
                    } else if (existingSession.timerMode && existingSession.timerMode !== "focus") {
                        setSessionMessage(`A ${existingSession.questTitle} is already active.`);
                    } else {
                        setSessionMessage(`A Focus Session is already active for "${existingSession.questTitle}".`);
                    }

                    return;
                }
            }

            const totalSeconds = selectedMinutes * 60;

            const calculatedEndTime = Date.now() + totalSeconds * 1000;

            const newSessionId = Crypto.randomUUID();
            const startedEvent: FocusTimelineEvent = {
                type: "started",
                occurredAt: new Date().toISOString(),
            };

            setSessionId(newSessionId);
            setRemainingSeconds(totalSeconds);
            setEndTime(calculatedEndTime);
            setIsRunning(true);
            setTimelineEvents([startedEvent]);

            await saveActiveFocusSession({
                id: newSessionId,
                questId,
                journeyId,
                questTitle: questTitle ?? (source === "tasks" ? "Untitled Task" : "Untitled Quest"),
                selectedMinutes,
                remainingSeconds: totalSeconds,
                isRunning: true,
                endTime: calculatedEndTime,
                timelineEvents: [startedEvent],
                ...(source ? { source } : {}),
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

        if (existingActiveSession.timerMode && existingActiveSession.timerMode !== "focus") {
            router.replace("/");
            return;
        }

        router.replace({
            pathname: "/focus/[questId]",
            params: {
                questId: existingActiveSession.questId,
                questTitle: existingActiveSession.questTitle,
                ...(existingActiveSession.journeyId
                    ? {
                          journeyId: existingActiveSession.journeyId,
                      }
                    : {}),
                ...(existingActiveSession.source
                    ? {
                          source: existingActiveSession.source,
                      }
                    : {}),
            },
        });
    }

    async function handleToggleTimer() {
        if (!sessionId) {
            return;
        }
        if (isRunning) {
            const pausedRemainingSeconds = endTime !== null ? Math.max(0, Math.ceil((endTime - Date.now()) / 1000)) : (remainingSeconds ?? 0);
            const nextTimelineEvents: FocusTimelineEvent[] = [
                ...timelineEvents,
                {
                    type: "paused",
                    occurredAt: new Date().toISOString(),
                },
            ];

            setRemainingSeconds(pausedRemainingSeconds);
            setIsRunning(false);
            setEndTime(null);
            setTimelineEvents(nextTimelineEvents);

            await saveActiveFocusSession({
                id: sessionId,

                questId,
                journeyId,
                questTitle: questTitle ?? (source === "tasks" ? "Untitled Task" : "Untitled Quest"),
                selectedMinutes,
                remainingSeconds: pausedRemainingSeconds,
                isRunning: false,
                endTime: null,
                timelineEvents: nextTimelineEvents,
                ...(source ? { source } : {}),
            });

            return;
        }

        if (remainingSeconds !== null && remainingSeconds > 0) {
            const resumedEndTime = Date.now() + remainingSeconds * 1000;
            const nextTimelineEvents: FocusTimelineEvent[] = [
                ...timelineEvents,
                {
                    type: "resumed",
                    occurredAt: new Date().toISOString(),
                },
            ];

            setEndTime(resumedEndTime);
            setIsRunning(true);
            setTimelineEvents(nextTimelineEvents);

            await saveActiveFocusSession({
                id: sessionId,
                questId,
                journeyId,
                questTitle: questTitle ?? (source === "tasks" ? "Untitled Task" : "Untitled Quest"),
                selectedMinutes,
                remainingSeconds,
                isRunning: true,
                endTime: resumedEndTime,
                timelineEvents: nextTimelineEvents,
                ...(source ? { source } : {}),
            });
        }
    }

    async function handleEndSessionEarly() {
        if (!sessionId) {
            return;
        }

        const actualSeconds = calculateActualFocusedSeconds({
            selectedMinutes,
            remainingSeconds,
            isRunning,
            endTime,
        });
        const completedTimelineEvents = appendCompletedEvent(timelineEvents, Date.now());

        setIsRunning(false);
        setEndTime(null);
        setRemainingSeconds(0);
        setTimelineEvents(completedTimelineEvents);

        try {
            await saveActiveFocusSession({
                id: sessionId,
                questId,
                journeyId,
                questTitle: questTitle ?? (source === "tasks" ? "Untitled Task" : "Untitled Quest"),
                selectedMinutes,
                remainingSeconds: 0,
                actualSeconds,
                endedEarly: true,
                isRunning: false,
                endTime: null,
                timelineEvents: completedTimelineEvents,
                ...(source ? { source } : {}),
            });

            router.replace({
                pathname: "/review/[questId]",
                params: {
                    questId,
                    questTitle,
                    ...(journeyId ? { journeyId } : {}),
                    ...(source ? { source } : {}),
                    focusSessionId: sessionId,
                    plannedMinutes: selectedMinutes.toString(),
                    actualSeconds: actualSeconds.toString(),
                    endedEarly: "true",
                },
            });
        } catch (error) {
            console.error("Failed to end Focus Session early:", error);

            setSessionMessage("The Focus Session could not be ended.");
        }
    }

    async function handleReviewSession() {
        if (!sessionId) {
            return;
        }

        const storedSession = await getActiveFocusSession();
        const reviewState = storedSession?.id === sessionId
            ? getActiveSessionReviewState(storedSession)
            : { actualSeconds: selectedMinutes * 60, endedEarly: false };

        router.push({
            pathname: "/review/[questId]",
            params: {
                questId,
                questTitle,
                ...(journeyId ? { journeyId } : {}),
                ...(source ? { source } : {}),
                focusSessionId: sessionId,
                plannedMinutes: selectedMinutes.toString(),
                actualSeconds: reviewState.actualSeconds.toString(),
                ...(reviewState.endedEarly ? { endedEarly: "true" } : {}),
            },
        });
    }

    const hasSessionStarted = remainingSeconds !== null;

    const hasSessionFinished = remainingSeconds === 0;
    const shownSeconds = remainingSeconds ?? selectedMinutes * 60;

    return (
        <AppScreenBackground>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <Stack.Screen
                    options={{
                        title: "Focus",
                    }}
                />

                <ScreenHeader eyebrow="FOCUS SESSION" title={questTitle ?? (source === "tasks" ? "Untitled Task" : "Untitled Quest")} subtitle="Give this one thing your attention." />

                <AppCard style={styles.sessionContent} padding="lg" tone="subtle">
                    <FocusDurationSelector selectedMinutes={selectedMinutes} onSelectMinutes={setSelectedMinutes} disabled={hasSessionStarted} />

                    <ActiveSessionNotice message={sessionMessage} showReturnButton={existingActiveSession !== null} onReturn={handleReturnToActiveSession} />

                    <FocusTimerDisplay
                        seconds={shownSeconds}
                        totalSeconds={selectedMinutes * 60}
                        label={hasSessionFinished ? "SESSION COMPLETE" : isRunning ? "STAY WITH IT" : hasSessionStarted ? "PAUSED" : "READY TO FOCUS"}
                        hint={source === "tasks" ? "Stay with this Task until the timer ends." : undefined}
                    />

                    <FocusTimerControls
                        hasStarted={hasSessionStarted}
                        hasFinished={hasSessionFinished}
                        isRunning={isRunning}
                        onStart={handleStartSession}
                        onToggleTimer={handleToggleTimer}
                        onEndEarly={handleEndSessionEarly}
                        onReview={() => void handleReviewSession()}
                    />
                </AppCard>
            </ScrollView>
        </AppScreenBackground>
    );
}

function appendCompletedEvent(events: FocusTimelineEvent[], completedAt: number) {
    if (events.some((event) => event.type === "completed")) {
        return events;
    }

    return [
        ...events,
        {
            type: "completed" as const,
            occurredAt: new Date(completedAt).toISOString(),
        },
    ];
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
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

        sessionContent: {
            width: "100%",
            marginTop: spacing.xl,
            gap: spacing.xl,
        },

        scrollView: {
            flex: 1,
            backgroundColor: "transparent",
        },
    });
}
