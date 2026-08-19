import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Settings2 } from "lucide-react-native";
import { useAudioPlayer } from "expo-audio";
import * as Crypto from "expo-crypto";
import { useFocusEffect, useRouter } from "expo-router";

import { ActiveSessionNotice } from "@/components/focus/ActiveSessionNotice";
import { FocusTimerControls } from "@/components/focus/FocusTimerControls";
import { FocusTimerDisplay } from "@/components/focus/FocusTimerDisplay";
import { TimerModeTabs } from "@/components/focus/TimerModeTabs";
import { TimerSettingsModal } from "@/components/focus/TimerSettingsModal";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { useAuth } from "@/contexts/AuthContext";
import { completeRemoteBreakSession } from "@/services/focusSessions/focusSessionService";
import { clearActiveFocusSession, getActiveFocusSession, saveActiveFocusSession } from "@/services/storage/activeFocusSessionStorage";
import { DEFAULT_TIMER_PREFERENCES, getTimerPreferences, saveTimerPreferences, type TimerPreferences } from "@/services/storage/timerPreferencesStorage";
import type { ActiveFocusSession, FocusTimelineEvent, TimerMode } from "@/types/models";
import { calculateActualFocusedSeconds, getRemainingSecondsFromEndTime } from "@/utils/focusTimer";

const focusCompleteSound = require("../../assets/sounds/focus-complete.mp3");
const QUICK_FOCUS_ROUTE_ID = "quick-focus";

export function QuickFocusCard() {
    const { colours } = useAppearance();
    const { session } = useAuth();
    const router = useRouter();
    const completionSoundPlayer = useAudioPlayer(focusCompleteSound);
    const styles = useMemo(() => createStyles(colours), [colours]);
    const [preferences, setPreferences] = useState<TimerPreferences>(DEFAULT_TIMER_PREFERENCES);
    const [mode, setMode] = useState<TimerMode>("focus");
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [selectedMinutes, setSelectedMinutes] = useState(DEFAULT_TIMER_PREFERENCES.focus);
    const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [timelineEvents, setTimelineEvents] = useState<FocusTimelineEvent[]>([]);
    const [existingOtherSession, setExistingOtherSession] = useState<ActiveFocusSession | null>(null);
    const [sessionMessage, setSessionMessage] = useState("");
    const [breakRecorded, setBreakRecorded] = useState(false);

    const recordBreak = useCallback(async (id: string, breakMode: Exclude<TimerMode, "focus">, minutes: number, actualSeconds: number, events: FocusTimelineEvent[]) => {
        if (!session) {
            setSessionMessage("Sign in to save this break to Progress.");
            return false;
        }

        const result = await completeRemoteBreakSession({
            focusSessionId: id,
            mode: breakMode,
            plannedMinutes: minutes,
            actualSeconds,
            timelineEvents: events,
        });

        if (result.error) {
            console.error("Failed to save break session:", result.error);
            setSessionMessage("The break ended, but it could not be saved to Progress. Try again.");
            return false;
        }

        await clearActiveFocusSession();
        setBreakRecorded(true);
        setSessionMessage(actualSeconds > 0 ? "Break saved to Progress. Breaks never award XP." : "Break finished without recorded time.");
        return true;
    }, [session]);

    const restoreQuickSession = useCallback(async (storedSession: ActiveFocusSession) => {
        const restoredMode = storedSession.timerMode ?? "focus";
        const storedSessionId = storedSession.id || Crypto.randomUUID();
        const restoredRemaining = storedSession.isRunning && storedSession.endTime !== null
            ? getRemainingSecondsFromEndTime(storedSession.endTime)
            : storedSession.remainingSeconds;
        const hasFinished = restoredRemaining === 0;
        const restoredTimeline = hasFinished
            ? appendCompletedEvent(storedSession.timelineEvents ?? [], storedSession.endTime ?? Date.now())
            : (storedSession.timelineEvents ?? []);

        setMode(restoredMode);
        setSessionId(storedSessionId);
        setSelectedMinutes(storedSession.selectedMinutes);
        setRemainingSeconds(restoredRemaining);
        setIsRunning(storedSession.isRunning && !hasFinished && storedSession.endTime !== null);
        setEndTime(storedSession.isRunning && !hasFinished ? storedSession.endTime : null);
        setTimelineEvents(restoredTimeline);
        setExistingOtherSession(null);
        setBreakRecorded(false);
        setSessionMessage("");

        if (!storedSession.id || hasFinished) {
            await saveActiveFocusSession({
                ...storedSession,
                id: storedSessionId,
                remainingSeconds: restoredRemaining,
                isRunning: storedSession.isRunning && !hasFinished,
                endTime: storedSession.isRunning && !hasFinished ? storedSession.endTime : null,
                timelineEvents: restoredTimeline,
                source: "quick-focus",
                timerMode: restoredMode,
            });
        }

        if (hasFinished && restoredMode !== "focus") {
            const saved = await recordBreak(storedSessionId, restoredMode, storedSession.selectedMinutes, storedSession.actualSeconds ?? storedSession.selectedMinutes * 60, restoredTimeline);
            setBreakRecorded(saved);
        }
    }, [recordBreak]);

    useFocusEffect(
        useCallback(() => {
            let isCurrent = true;

            async function loadTimer() {
                try {
                    const [storedSession, storedPreferences] = await Promise.all([getActiveFocusSession(), getTimerPreferences()]);
                    if (!isCurrent) return;

                    setPreferences(storedPreferences);

                    const isLegacyAttachedSession = storedSession?.source === "quick-focus" && !storedSession.timerMode && storedSession.questId !== QUICK_FOCUS_ROUTE_ID;

                    if (storedSession?.source === "quick-focus" && !isLegacyAttachedSession) {
                        await restoreQuickSession(storedSession);
                        return;
                    }

                    setExistingOtherSession(storedSession);
                    setSessionMessage(storedSession ? `A Focus Session is already active for "${storedSession.questTitle}".` : "");

                    if (!storedSession) {
                        setMode("focus");
                        setSelectedMinutes(storedPreferences.focus);
                        resetSessionState();
                    }
                } catch (error) {
                    console.error("Failed to load Quick Timer:", error);
                    if (isCurrent) setSessionMessage("The timer could not be loaded.");
                }
            }

            void loadTimer();
            return () => { isCurrent = false; };
        }, [restoreQuickSession]),
    );

    useEffect(() => {
        if (!isRunning || endTime === null || !sessionId) return;

        const activeEndTime = endTime;
        const activeSessionId = sessionId;
        const activeMode = mode;

        function updateRemainingTime() {
            const nextRemainingSeconds = getRemainingSecondsFromEndTime(activeEndTime);
            setRemainingSeconds(nextRemainingSeconds);

            if (nextRemainingSeconds !== 0) return;

            const completedTimeline = appendCompletedEvent(timelineEvents, activeEndTime);
            setIsRunning(false);
            setEndTime(null);
            setTimelineEvents(completedTimeline);
            completionSoundPlayer.seekTo(0);
            completionSoundPlayer.play();

            void saveActiveFocusSession(buildActiveSession(activeSessionId, activeMode, selectedMinutes, 0, false, null, completedTimeline, selectedMinutes * 60))
                .then(async () => {
                    if (activeMode !== "focus") {
                        const saved = await recordBreak(activeSessionId, activeMode, selectedMinutes, selectedMinutes * 60, completedTimeline);
                        setBreakRecorded(saved);
                    }
                })
                .catch((error) => {
                    console.error("Failed to save completed timer:", error);
                    setSessionMessage("The completed timer could not be saved.");
                });
        }

        updateRemainingTime();
        const intervalId = setInterval(updateRemainingTime, 1000);
        return () => clearInterval(intervalId);
    }, [completionSoundPlayer, endTime, isRunning, mode, recordBreak, selectedMinutes, sessionId, timelineEvents]);

    function resetSessionState() {
        setSessionId(null);
        setRemainingSeconds(null);
        setIsRunning(false);
        setEndTime(null);
        setTimelineEvents([]);
        setBreakRecorded(false);
    }

    function selectMode(nextMode: TimerMode) {
        if (remainingSeconds !== null) return;
        setMode(nextMode);
        setSelectedMinutes(preferences[nextMode]);
        setSessionMessage("");
    }

    async function updatePreferences(nextPreferences: TimerPreferences) {
        const savedPreferences = await saveTimerPreferences(nextPreferences);
        setPreferences(savedPreferences);
        if (remainingSeconds === null) setSelectedMinutes(savedPreferences[mode]);
    }

    async function handleStartSession() {
        setSessionMessage("");
        const storedSession = await getActiveFocusSession();

        if (storedSession) {
            const isLegacyAttachedSession = storedSession.source === "quick-focus" && !storedSession.timerMode && storedSession.questId !== QUICK_FOCUS_ROUTE_ID;
            if (storedSession.source === "quick-focus" && !isLegacyAttachedSession) await restoreQuickSession(storedSession);
            else {
                setExistingOtherSession(storedSession);
                setSessionMessage(`A Focus Session is already active for "${storedSession.questTitle}".`);
            }
            return;
        }

        const totalSeconds = selectedMinutes * 60;
        const nextSessionId = Crypto.randomUUID();
        const nextEndTime = Date.now() + totalSeconds * 1000;
        const startedEvent: FocusTimelineEvent = { type: "started", occurredAt: new Date().toISOString() };

        setSessionId(nextSessionId);
        setRemainingSeconds(totalSeconds);
        setIsRunning(true);
        setEndTime(nextEndTime);
        setTimelineEvents([startedEvent]);
        setExistingOtherSession(null);
        setBreakRecorded(false);

        await saveActiveFocusSession(buildActiveSession(nextSessionId, mode, selectedMinutes, totalSeconds, true, nextEndTime, [startedEvent]));
    }

    async function handleToggleTimer() {
        if (!sessionId || remainingSeconds === null) return;

        if (isRunning) {
            const pausedRemaining = endTime === null ? remainingSeconds : getRemainingSecondsFromEndTime(endTime);
            const nextTimeline = [...timelineEvents, createTimelineEvent("paused")];
            setRemainingSeconds(pausedRemaining);
            setIsRunning(false);
            setEndTime(null);
            setTimelineEvents(nextTimeline);
            await saveActiveFocusSession(buildActiveSession(sessionId, mode, selectedMinutes, pausedRemaining, false, null, nextTimeline));
            return;
        }

        if (remainingSeconds > 0) {
            const resumedEndTime = Date.now() + remainingSeconds * 1000;
            const nextTimeline = [...timelineEvents, createTimelineEvent("resumed")];
            setIsRunning(true);
            setEndTime(resumedEndTime);
            setTimelineEvents(nextTimeline);
            await saveActiveFocusSession(buildActiveSession(sessionId, mode, selectedMinutes, remainingSeconds, true, resumedEndTime, nextTimeline));
        }
    }

    async function handleEndSessionEarly() {
        if (!sessionId) return;

        const actualSeconds = calculateActualFocusedSeconds({ selectedMinutes, remainingSeconds, isRunning, endTime });
        const completedTimeline = appendCompletedEvent(timelineEvents, Date.now());
        setRemainingSeconds(0);
        setIsRunning(false);
        setEndTime(null);
        setTimelineEvents(completedTimeline);

        await saveActiveFocusSession(buildActiveSession(sessionId, mode, selectedMinutes, 0, false, null, completedTimeline, actualSeconds));

        if (mode === "focus") {
            openReview(actualSeconds, true);
            return;
        }

        const saved = await recordBreak(sessionId, mode, selectedMinutes, actualSeconds, completedTimeline);
        setBreakRecorded(saved);
    }

    function openReview(actualSeconds: number, endedEarly: boolean) {
        if (!sessionId) return;

        router.push({
            pathname: "/review/[questId]",
            params: {
                questId: QUICK_FOCUS_ROUTE_ID,
                questTitle: "Quick Focus",
                focusSessionId: sessionId,
                plannedMinutes: String(selectedMinutes),
                actualSeconds: String(actualSeconds),
                source: "quick-focus",
                quickFocus: "true",
                ...(endedEarly ? { endedEarly: "true" } : {}),
            },
        });
    }

    async function handleCompletedAction() {
        if (mode === "focus") {
            openReview(selectedMinutes * 60, false);
            return;
        }

        if (!breakRecorded && sessionId) {
            const saved = await recordBreak(sessionId, mode, selectedMinutes, selectedMinutes * 60, timelineEvents);
            if (!saved) return;
        }

        await clearActiveFocusSession();
        setMode("focus");
        setSelectedMinutes(preferences.focus);
        resetSessionState();
        setSessionMessage("Break saved. Ready when you are.");
    }

    function handleReturnToOtherSession() {
        if (!existingOtherSession) return;
        router.push({
            pathname: "/focus/[questId]",
            params: {
                questId: existingOtherSession.questId,
                questTitle: existingOtherSession.questTitle,
                ...(existingOtherSession.journeyId ? { journeyId: existingOtherSession.journeyId } : {}),
                ...(existingOtherSession.source ? { source: existingOtherSession.source } : {}),
            },
        });
    }

    function handleTimerActionError(error: unknown) {
        console.error("Quick Timer action failed:", error);
        setSessionMessage("The timer could not update. Try again.");
    }

    const shownSeconds = remainingSeconds ?? selectedMinutes * 60;
    const hasStarted = remainingSeconds !== null;
    const hasFinished = remainingSeconds === 0;
    const modeCopy = getModeCopy(mode);
    const tone = getModeTone(mode, colours);
    const displayedDurations = hasStarted ? { ...preferences, [mode]: selectedMinutes } : preferences;

    return (
        <View style={[styles.card, { borderColor: tone.border, backgroundColor: tone.background }]}>
            <View style={styles.header}>
                <View style={styles.headerCopy}>
                    <Text style={[styles.eyebrow, { color: tone.strong }]}>{modeCopy.eyebrow}</Text>
                    <Text style={styles.cardTitle}>{modeCopy.title}</Text>
                </View>
                <AnimatedPressable accessibilityLabel="Customise timer durations" disabled={hasStarted} onPress={() => setSettingsVisible(true)} style={[styles.settingsButton, hasStarted && styles.disabled]}>
                    <Settings2 size={18} color={hasStarted ? colours.textMuted : tone.strong} />
                </AnimatedPressable>
            </View>

            <TimerModeTabs selectedMode={mode} minutes={displayedDurations} disabled={hasStarted} onSelectMode={selectMode} />

            <FocusTimerDisplay
                seconds={shownSeconds}
                totalSeconds={selectedMinutes * 60}
                mode={mode}
                label={hasFinished ? (mode === "focus" ? "SESSION COMPLETE" : "BREAK COMPLETE") : isRunning ? modeCopy.runningLabel : hasStarted ? "PAUSED" : modeCopy.readyLabel}
                hint={modeCopy.hint}
            />

            {/* Task and Project attachment is intentionally hidden on Home. Quick Focus stays a friction-free standalone timer. */}

            <ActiveSessionNotice message={sessionMessage} showReturnButton={existingOtherSession !== null} onReturn={handleReturnToOtherSession} />

            {!existingOtherSession ? (
                <FocusTimerControls
                    hasStarted={hasStarted}
                    hasFinished={hasFinished}
                    isRunning={isRunning}
                    mode={mode}
                    onStart={() => void handleStartSession().catch(handleTimerActionError)}
                    onToggleTimer={() => void handleToggleTimer().catch(handleTimerActionError)}
                    onEndEarly={() => void handleEndSessionEarly().catch(handleTimerActionError)}
                    onReview={() => void handleCompletedAction().catch(handleTimerActionError)}
                />
            ) : null}

            <TimerSettingsModal visible={settingsVisible} preferences={preferences} onClose={() => setSettingsVisible(false)} onSave={updatePreferences} />
        </View>
    );
}

function buildActiveSession(id: string, mode: TimerMode, selectedMinutes: number, remainingSeconds: number, isRunning: boolean, endTime: number | null, timelineEvents: FocusTimelineEvent[], actualSeconds?: number): ActiveFocusSession {
    return {
        id,
        questId: mode === "focus" ? QUICK_FOCUS_ROUTE_ID : `${mode}-timer`,
        questTitle: getModeCopy(mode).sessionTitle,
        selectedMinutes,
        remainingSeconds,
        ...(actualSeconds === undefined ? {} : { actualSeconds }),
        isRunning,
        endTime,
        timelineEvents,
        source: "quick-focus",
        timerMode: mode,
    };
}

function getModeCopy(mode: TimerMode) {
    if (mode === "short-break") return { eyebrow: "SHORT BREAK", title: "Take a quick reset", sessionTitle: "Short Break", readyLabel: "READY TO RESET", runningLabel: "RECHARGING", hint: "Step away, breathe, stretch, or get some water." };
    if (mode === "long-break") return { eyebrow: "LONG BREAK", title: "Step away properly", sessionTitle: "Long Break", readyLabel: "READY TO RECHARGE", runningLabel: "RESTING", hint: "Give your attention a real pause before the next block." };
    return { eyebrow: "QUICK FOCUS", title: "Start where you are", sessionTitle: "Quick Focus", readyLabel: "READY WHEN YOU ARE", runningLabel: "FOCUSING", hint: "Choose one useful thing and stay with it until the timer ends." };
}

function getModeTone(mode: TimerMode, colours: AppColours) {
    if (mode === "short-break") return { border: colours.success, background: colours.surface, strong: colours.success };
    if (mode === "long-break") return { border: colours.warningBorder, background: colours.surface, strong: colours.warning };
    return { border: colours.primaryBorder, background: colours.surface, strong: colours.primaryStrong };
}

function createTimelineEvent(type: "paused" | "resumed"): FocusTimelineEvent {
    return { type, occurredAt: new Date().toISOString() };
}

function appendCompletedEvent(events: FocusTimelineEvent[], completedAt: number) {
    if (events.some((event) => event.type === "completed")) return events;
    return [...events, { type: "completed", occurredAt: new Date(completedAt).toISOString() } satisfies FocusTimelineEvent];
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        card: { width: "100%", padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderRadius: radius.lg },
        header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
        headerCopy: { minWidth: 0, flex: 1 },
        eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 0.8 },
        cardTitle: { marginTop: 3, fontSize: 18, fontWeight: "800", color: colours.text },
        settingsButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colours.border, borderRadius: radius.pill, backgroundColor: colours.background },
        disabled: { opacity: 0.55 },
    });
}
