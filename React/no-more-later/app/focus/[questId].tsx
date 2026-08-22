import { useEffect, useMemo, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Platform, StyleSheet, ScrollView, Text, View } from "react-native";
import { useAudioPlayer } from "expo-audio";
import * as Crypto from "expo-crypto";
import { Brain, Settings2 } from "lucide-react-native";

import type { ActiveFocusSession, FocusTimelineEvent } from "../../types/models";
import { getActiveFocusSession, saveActiveFocusSession } from "../../services/storage/activeFocusSessionStorage";
import { FocusTimerDisplay } from "../../components/focus/FocusTimerDisplay";
import { FocusTimerControls } from "../../components/focus/FocusTimerControls";
import { ActiveSessionNotice } from "../../components/focus/ActiveSessionNotice";
import { TimerSettingsModal } from "../../components/focus/TimerSettingsModal";
import { calculateActualFocusedSeconds, getActiveSessionReviewState, getRemainingSecondsFromEndTime } from "../../utils/focusTimer";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";
import { AppCard } from "@/components/ui/AppCard";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
    DEFAULT_TIMER_PREFERENCES,
    getTimerPreferences,
    type TimerPreferences,
} from "@/services/storage/timerPreferencesStorage";
import {
    removeRunningFocusNotification,
    showFocusSessionCompleteNotification,
    showRunningFocusNotification,
} from "@/services/notifications/focusNotificationService";
import {
    finishRemoteFocusRun,
    pauseRemoteFocusRun,
    resumeRemoteFocusRun,
    startRemoteFocusRun,
} from "@/services/focusSessions/focusRunService";

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
    const [preferences, setPreferences] = useState<TimerPreferences>(DEFAULT_TIMER_PREFERENCES);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [selectedMinutes, setSelectedMinutes] = useState(DEFAULT_TIMER_PREFERENCES.focus);
    const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [timelineEvents, setTimelineEvents] = useState<FocusTimelineEvent[]>([]);
    const [serverTracked, setServerTracked] = useState(false);
    const [sessionMessage, setSessionMessage] = useState("");
    const [existingActiveSession, setExistingActiveSession] = useState<ActiveFocusSession | null>(null);

    useEffect(() => {
        async function loadActiveFocusSession() {
            try {
                const [storedSession, timerPreferences] = await Promise.all([getActiveFocusSession(), getTimerPreferences()]);
                setPreferences(timerPreferences);

                if (!storedSession) {
                    setSelectedMinutes(timerPreferences.focus);
                    setServerTracked(false);
                    return;
                }

                if (storedSession.questId !== questId || storedSession.journeyId !== journeyId) {
                    setSelectedMinutes(timerPreferences.focus);
                    setServerTracked(false);
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
                setServerTracked(Boolean(storedSession.serverTracked));

                if (storedSession.isRunning && storedSession.endTime !== null) {
                    const restoredRemainingSeconds = getRemainingSecondsFromEndTime(storedSession.endTime);

                    setRemainingSeconds(restoredRemainingSeconds);

                    if (restoredRemainingSeconds === 0) {
                        const completedTimelineEvents = appendCompletedEvent(storedSession.timelineEvents ?? [], storedSession.endTime);

                        setIsRunning(false);
                        setEndTime(null);
                        setTimelineEvents(completedTimelineEvents);

                        if (storedSession.serverTracked) {
                            const trackingError = await finishRemoteFocusRun(storedSessionId);
                            if (trackingError) console.warn("Failed to finish the restored server-tracked Focus Session:", trackingError);
                        }

                        await saveActiveFocusSession({
                            ...storedSession,
                            id: storedSessionId,
                            remainingSeconds: 0,
                            actualSeconds: storedSession.selectedMinutes * 60,
                            endedEarly: false,
                            isRunning: false,
                            endTime: null,
                            timelineEvents: completedTimelineEvents,
                            serverTracked: storedSession.serverTracked,
                            ...(source ? { source } : {}),
                        });

                        await showFocusSessionCompleteNotification({
                            ...storedSession,
                            id: storedSessionId,
                            remainingSeconds: 0,
                            actualSeconds: storedSession.selectedMinutes * 60,
                            endedEarly: false,
                            isRunning: false,
                            endTime: null,
                            timelineEvents: completedTimelineEvents,
                            serverTracked: storedSession.serverTracked,
                            ...(source ? { source } : {}),
                        });

                        return;
                    }

                    setEndTime(storedSession.endTime);

                    setIsRunning(true);

                    await showRunningFocusNotification({
                        ...storedSession,
                        id: storedSessionId,
                    });

                    return;
                }

                setRemainingSeconds(storedSession.remainingSeconds);

                setEndTime(null);
                setIsRunning(false);
                await removeRunningFocusNotification();
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

                if (Platform.OS !== "android") {
                    completionSoundPlayer.seekTo(0);
                    completionSoundPlayer.play();
                }

                setIsRunning(false);
                setEndTime(null);
                setTimelineEvents(completedTimelineEvents);

                const completedSession: ActiveFocusSession = {
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
                    serverTracked,
                    ...(source ? { source } : {}),
                };

                const finishPromise = serverTracked ? finishRemoteFocusRun(activeSessionId) : Promise.resolve(null);

                finishPromise
                    .then((trackingError) => {
                        if (trackingError) console.warn("Failed to finish the server-tracked Focus Session:", trackingError);
                        return saveActiveFocusSession(completedSession);
                    })
                    .then(() => showFocusSessionCompleteNotification(completedSession))
                    .catch((error) => {
                        console.error("Failed to save completed Focus Session:", error);
                    });
            }
        }

        updateRemainingTime();

        const intervalId = setInterval(updateRemainingTime, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [isRunning, endTime, sessionId, completionSoundPlayer, questId, journeyId, questTitle, selectedMinutes, serverTracked, source, timelineEvents]);

    async function updateSessionFocusDuration(nextPreferences: TimerPreferences) {
        setPreferences((current) => ({ ...current, focus: nextPreferences.focus }));
        if (remainingSeconds === null) setSelectedMinutes(nextPreferences.focus);
    }

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

                    if (completedSession.serverTracked) {
                        const trackingError = await finishRemoteFocusRun(completedSession.id);
                        if (trackingError) console.warn("Failed to finish the expired server-tracked Focus Session:", trackingError);
                    }

                    await saveActiveFocusSession(completedSession);
                    await showFocusSessionCompleteNotification(completedSession);

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

            const trackingResult = await startRemoteFocusRun(newSessionId, selectedMinutes, "quest");

            if (trackingResult.error) {
                console.warn("This Focus Session could not be verified by the server:", trackingResult.error);
                setSessionMessage("Timer started offline. This session can be reviewed, but it will not earn XP or leaderboard time.");
            }

            setSessionId(newSessionId);
            setRemainingSeconds(totalSeconds);
            setEndTime(calculatedEndTime);
            setIsRunning(true);
            setTimelineEvents([startedEvent]);
            setServerTracked(trackingResult.tracked);

            const startedSession: ActiveFocusSession = {
                id: newSessionId,
                questId,
                journeyId,
                questTitle: questTitle ?? (source === "tasks" ? "Untitled Task" : "Untitled Quest"),
                selectedMinutes,
                remainingSeconds: totalSeconds,
                isRunning: true,
                endTime: calculatedEndTime,
                timelineEvents: [startedEvent],
                serverTracked: trackingResult.tracked,
                ...(source ? { source } : {}),
            };

            await saveActiveFocusSession(startedSession);
            await showRunningFocusNotification(startedSession);
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

            const pausedSession: ActiveFocusSession = {
                id: sessionId,

                questId,
                journeyId,
                questTitle: questTitle ?? (source === "tasks" ? "Untitled Task" : "Untitled Quest"),
                selectedMinutes,
                remainingSeconds: pausedRemainingSeconds,
                isRunning: false,
                endTime: null,
                timelineEvents: nextTimelineEvents,
                serverTracked,
                ...(source ? { source } : {}),
            };

            await saveActiveFocusSession(pausedSession);
            if (serverTracked) {
                const trackingError = await pauseRemoteFocusRun(sessionId);
                if (trackingError) console.warn("Failed to pause the server-tracked Focus Session:", trackingError);
            }
            await removeRunningFocusNotification();

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

            const resumedSession: ActiveFocusSession = {
                id: sessionId,
                questId,
                journeyId,
                questTitle: questTitle ?? (source === "tasks" ? "Untitled Task" : "Untitled Quest"),
                selectedMinutes,
                remainingSeconds,
                isRunning: true,
                endTime: resumedEndTime,
                timelineEvents: nextTimelineEvents,
                serverTracked,
                ...(source ? { source } : {}),
            };

            await saveActiveFocusSession(resumedSession);
            if (serverTracked) {
                const trackingError = await resumeRemoteFocusRun(sessionId);
                if (trackingError) console.warn("Failed to resume the server-tracked Focus Session:", trackingError);
            }
            await showRunningFocusNotification(resumedSession);
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
                serverTracked,
                ...(source ? { source } : {}),
            });

            if (serverTracked) {
                const trackingError = await finishRemoteFocusRun(sessionId);
                if (trackingError) console.warn("Failed to finish the server-tracked Focus Session:", trackingError);
            }

            await removeRunningFocusNotification();

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
                    <View style={[styles.timerSetup, hasSessionStarted && styles.timerSetupDisabled]}>
                        <View style={styles.timerSetupIcon}>
                            <Brain size={18} color={colours.primaryStrong} />
                        </View>
                        <View style={styles.timerSetupCopy}>
                            <Text style={styles.timerSetupEyebrow}>FOCUS TIMER</Text>
                            <Text style={styles.timerSetupTitle}>{selectedMinutes} minute{selectedMinutes === 1 ? "" : "s"}</Text>
                            <Text style={styles.timerSetupHint}>Change it for this session; your selected clock style still applies.</Text>
                        </View>
                        <AnimatedPressable
                            accessibilityLabel="Customise timer durations"
                            disabled={hasSessionStarted}
                            onPress={() => setSettingsVisible(true)}
                            style={styles.settingsButton}
                        >
                            <Settings2 size={18} color={hasSessionStarted ? colours.textMuted : colours.primaryStrong} />
                        </AnimatedPressable>
                    </View>

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

            <TimerSettingsModal
                visible={settingsVisible}
                preferences={preferences}
                visibleModes={["focus"]}
                onClose={() => setSettingsVisible(false)}
                onSave={updateSessionFocusDuration}
            />
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

        timerSetup: {
            width: "100%",
            minHeight: 76,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            padding: spacing.sm,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,
            backgroundColor: colours.background,
        },

        timerSetupDisabled: {
            opacity: 0.7,
        },

        timerSetupIcon: {
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.md,
            backgroundColor: colours.primarySoft,
        },

        timerSetupCopy: {
            minWidth: 0,
            flex: 1,
        },

        timerSetupEyebrow: {
            fontSize: 10,
            fontWeight: "900",
            letterSpacing: 0.7,
            color: colours.primaryStrong,
        },

        timerSetupTitle: {
            marginTop: 2,
            fontSize: 15,
            fontWeight: "900",
            color: colours.text,
        },

        timerSetupHint: {
            marginTop: 2,
            fontSize: 10,
            lineHeight: 15,
            color: colours.textMuted,
        },

        settingsButton: {
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.pill,
            backgroundColor: colours.surface,
        },

        scrollView: {
            flex: 1,
            backgroundColor: "transparent",
        },
    });
}
