import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Check, ChevronRight, Clock3, Folder, TimerReset, X } from "lucide-react-native";
import { useAudioPlayer } from "expo-audio";
import * as Crypto from "expo-crypto";
import { useFocusEffect, useRouter } from "expo-router";

import { ActiveSessionNotice } from "@/components/focus/ActiveSessionNotice";
import { FocusDurationSelector } from "@/components/focus/FocusDurationSelector";
import { FocusTimerControls } from "@/components/focus/FocusTimerControls";
import { FocusTimerDisplay } from "@/components/focus/FocusTimerDisplay";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { useAuth } from "@/contexts/AuthContext";
import { getRemoteWorkJourneys, getRemoteWorkQuests } from "@/services/work/workService";
import { getActiveFocusSession, saveActiveFocusSession } from "@/services/storage/activeFocusSessionStorage";
import type { ActiveFocusSession, FocusTimelineEvent } from "@/types/models";
import type { WorkJourney, WorkQuest } from "@/types/work";
import { calculateActualFocusedSeconds, getRemainingSecondsFromEndTime } from "@/utils/focusTimer";

const focusCompleteSound = require("../../assets/sounds/focus-complete.mp3");
const QUICK_FOCUS_ROUTE_ID = "quick-focus";

export function QuickFocusCard() {
    const { colours } = useAppearance();
    const { session } = useAuth();
    const router = useRouter();
    const completionSoundPlayer = useAudioPlayer(focusCompleteSound);
    const styles = useMemo(() => createStyles(colours), [colours]);
    const [quests, setQuests] = useState<WorkQuest[]>([]);
    const [journeys, setJourneys] = useState<WorkJourney[]>([]);
    const [selectedQuest, setSelectedQuest] = useState<WorkQuest | null>(null);
    const [isQuestPickerVisible, setIsQuestPickerVisible] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [selectedMinutes, setSelectedMinutes] = useState(25);
    const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [timelineEvents, setTimelineEvents] = useState<FocusTimelineEvent[]>([]);
    const [existingOtherSession, setExistingOtherSession] = useState<ActiveFocusSession | null>(null);
    const [sessionMessage, setSessionMessage] = useState("");

    const restoreQuickSession = useCallback(
        async (storedSession: ActiveFocusSession, availableQuests: WorkQuest[]) => {
            const storedSessionId = storedSession.id || Crypto.randomUUID();
            const matchingQuest = availableQuests.find((quest) => quest.id === storedSession.questId) ?? null;
            const restoredRemaining =
                storedSession.isRunning && storedSession.endTime !== null
                    ? getRemainingSecondsFromEndTime(storedSession.endTime)
                    : storedSession.remainingSeconds;
            const hasFinished = restoredRemaining === 0;
            const restoredTimeline = hasFinished
                ? appendCompletedEvent(storedSession.timelineEvents ?? [], storedSession.endTime ?? Date.now())
                : (storedSession.timelineEvents ?? []);

            setSessionId(storedSessionId);
            setSelectedQuest(matchingQuest);
            setSelectedMinutes(storedSession.selectedMinutes);
            setRemainingSeconds(restoredRemaining);
            setIsRunning(storedSession.isRunning && !hasFinished && storedSession.endTime !== null);
            setEndTime(storedSession.isRunning && !hasFinished ? storedSession.endTime : null);
            setTimelineEvents(restoredTimeline);
            setExistingOtherSession(null);
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
                });
            }
        },
        [],
    );

    useFocusEffect(
        useCallback(() => {
            let isCurrent = true;

            async function loadQuickFocus() {
                try {
                    const [storedSession, questsResult, journeysResult] = await Promise.all([
                        getActiveFocusSession(),
                        session ? getRemoteWorkQuests(session.user.id) : Promise.resolve({ data: [], error: null }),
                        session ? getRemoteWorkJourneys(session.user.id) : Promise.resolve({ data: [], error: null }),
                    ]);

                    if (!isCurrent) {
                        return;
                    }

                    const availableQuests = (questsResult.data ?? []).filter((quest) => quest.status === "active");
                    setQuests(availableQuests);
                    setJourneys((journeysResult.data ?? []).filter((journey) => journey.status === "active"));

                    if (questsResult.error) {
                        console.error("Failed to load Quick Focus Quests:", questsResult.error);
                    }
                    if (journeysResult.error) {
                        console.error("Failed to load Quick Focus Journeys:", journeysResult.error);
                    }

                    if (storedSession?.source === "quick-focus") {
                        await restoreQuickSession(storedSession, availableQuests);
                        return;
                    }

                    setExistingOtherSession(storedSession);
                    setSessionMessage(storedSession ? `A Focus Session is already active for "${storedSession.questTitle}".` : "");

                    if (!storedSession) {
                        setSessionId(null);
                        setRemainingSeconds(null);
                        setIsRunning(false);
                        setEndTime(null);
                        setTimelineEvents([]);
                    }
                } catch (error) {
                    console.error("Failed to load Quick Focus:", error);
                    if (isCurrent) {
                        setSessionMessage("Quick Focus could not be loaded.");
                    }
                }
            }

            void loadQuickFocus();

            return () => {
                isCurrent = false;
            };
        }, [restoreQuickSession, session]),
    );

    useEffect(() => {
        if (!isRunning || endTime === null || !sessionId) {
            return;
        }

        const activeEndTime = endTime;
        const activeSessionId = sessionId;

        function updateRemainingTime() {
            const nextRemainingSeconds = getRemainingSecondsFromEndTime(activeEndTime);
            setRemainingSeconds(nextRemainingSeconds);

            if (nextRemainingSeconds === 0) {
                const completedTimeline = appendCompletedEvent(timelineEvents, activeEndTime);
                setIsRunning(false);
                setEndTime(null);
                setTimelineEvents(completedTimeline);
                completionSoundPlayer.seekTo(0);
                completionSoundPlayer.play();

                void saveActiveFocusSession({
                    id: activeSessionId,
                    questId: selectedQuest?.id ?? QUICK_FOCUS_ROUTE_ID,
                    journeyId: selectedQuest?.journeyId,
                    questTitle: selectedQuest?.title ?? "Quick Focus",
                    selectedMinutes,
                    remainingSeconds: 0,
                    isRunning: false,
                    endTime: null,
                    timelineEvents: completedTimeline,
                    source: "quick-focus",
                }).catch((error) => {
                    console.error("Failed to save completed Quick Focus Session:", error);
                    setSessionMessage("The completed session could not be saved locally.");
                });
            }
        }

        updateRemainingTime();
        const intervalId = setInterval(updateRemainingTime, 1000);

        return () => clearInterval(intervalId);
    }, [completionSoundPlayer, endTime, isRunning, selectedMinutes, selectedQuest, sessionId, timelineEvents]);

    async function handleStartSession() {
        setSessionMessage("");

        const storedSession = await getActiveFocusSession();
        if (storedSession) {
            if (storedSession.source === "quick-focus") {
                await restoreQuickSession(storedSession, quests);
            } else {
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

        await saveActiveFocusSession({
            id: nextSessionId,
            questId: selectedQuest?.id ?? QUICK_FOCUS_ROUTE_ID,
            journeyId: selectedQuest?.journeyId,
            questTitle: selectedQuest?.title ?? "Quick Focus",
            selectedMinutes,
            remainingSeconds: totalSeconds,
            isRunning: true,
            endTime: nextEndTime,
            timelineEvents: [startedEvent],
            source: "quick-focus",
        });
    }

    async function handleToggleTimer() {
        if (!sessionId || remainingSeconds === null) {
            return;
        }

        if (isRunning) {
            const pausedRemaining = endTime === null ? remainingSeconds : getRemainingSecondsFromEndTime(endTime);
            const nextTimeline = [...timelineEvents, createTimelineEvent("paused")];
            setRemainingSeconds(pausedRemaining);
            setIsRunning(false);
            setEndTime(null);
            setTimelineEvents(nextTimeline);

            await saveQuickFocusSession(pausedRemaining, false, null, nextTimeline);
            return;
        }

        if (remainingSeconds > 0) {
            const resumedEndTime = Date.now() + remainingSeconds * 1000;
            const nextTimeline = [...timelineEvents, createTimelineEvent("resumed")];
            setIsRunning(true);
            setEndTime(resumedEndTime);
            setTimelineEvents(nextTimeline);

            await saveQuickFocusSession(remainingSeconds, true, resumedEndTime, nextTimeline);
        }
    }

    async function handleEndSessionEarly() {
        if (!sessionId) {
            return;
        }

        const actualSeconds = calculateActualFocusedSeconds({ selectedMinutes, remainingSeconds, isRunning, endTime });
        const completedTimeline = appendCompletedEvent(timelineEvents, Date.now());
        setRemainingSeconds(0);
        setIsRunning(false);
        setEndTime(null);
        setTimelineEvents(completedTimeline);

        await saveQuickFocusSession(0, false, null, completedTimeline);
        openReview(actualSeconds, true);
    }

    function handleReviewSession() {
        openReview(selectedMinutes * 60, false);
    }

    async function saveQuickFocusSession(
        nextRemainingSeconds: number,
        nextIsRunning: boolean,
        nextEndTime: number | null,
        nextTimelineEvents: FocusTimelineEvent[],
    ) {
        if (!sessionId) {
            return;
        }

        await saveActiveFocusSession({
            id: sessionId,
            questId: selectedQuest?.id ?? QUICK_FOCUS_ROUTE_ID,
            journeyId: selectedQuest?.journeyId,
            questTitle: selectedQuest?.title ?? "Quick Focus",
            selectedMinutes,
            remainingSeconds: nextRemainingSeconds,
            isRunning: nextIsRunning,
            endTime: nextEndTime,
            timelineEvents: nextTimelineEvents,
            source: "quick-focus",
        });
    }

    function openReview(actualSeconds: number, endedEarly: boolean) {
        if (!sessionId) {
            return;
        }

        router.push({
            pathname: "/review/[questId]",
            params: {
                questId: selectedQuest?.id ?? QUICK_FOCUS_ROUTE_ID,
                questTitle: selectedQuest?.title ?? "Quick Focus",
                focusSessionId: sessionId,
                plannedMinutes: String(selectedMinutes),
                actualSeconds: String(actualSeconds),
                source: "quick-focus",
                ...(selectedQuest?.journeyId ? { journeyId: selectedQuest.journeyId } : {}),
                ...(!selectedQuest ? { quickFocus: "true" } : {}),
                ...(endedEarly ? { endedEarly: "true" } : {}),
            },
        });
    }

    function handleReturnToOtherSession() {
        if (!existingOtherSession) {
            return;
        }

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
        console.error("Quick Focus action failed:", error);
        setSessionMessage("Quick Focus could not update the session. Try again.");
    }

    const shownSeconds = remainingSeconds ?? selectedMinutes * 60;
    const hasStarted = remainingSeconds !== null;
    const hasFinished = remainingSeconds === 0;
    const journeyTitle = selectedQuest?.journeyId ? journeys.find((journey) => journey.id === selectedQuest.journeyId)?.title : undefined;

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.eyebrow}>QUICK FOCUS</Text>
                    <Text style={styles.cardTitle}>Start where you are</Text>
                </View>
                <View style={styles.timerIcon}>
                    <TimerReset size={20} color={colours.primary} />
                </View>
            </View>

            <FocusTimerDisplay
                seconds={shownSeconds}
                label="READY WHEN YOU ARE"
                hint={selectedQuest ? `Focus on ${selectedQuest.title} until the timer ends.` : "Focus without attaching this session to a Quest."}
            />
            <FocusDurationSelector selectedMinutes={selectedMinutes} onSelectMinutes={setSelectedMinutes} disabled={hasStarted} />

            <View style={styles.divider} />

            <Text style={styles.workingLabel}>WORKING ON</Text>
            <Pressable
                disabled={hasStarted}
                onPress={() => setIsQuestPickerVisible(true)}
                style={({ pressed }) => [styles.questSelector, hasStarted && styles.disabledSelector, pressed && !hasStarted && styles.pressed]}
            >
                <View style={styles.questIcon}>
                    {selectedQuest ? <Folder size={18} color={colours.primary} /> : <Clock3 size={18} color={colours.textMuted} />}
                </View>
                <View style={styles.questCopy}>
                    <Text style={styles.questTitle}>{selectedQuest?.title ?? "No Quest"}</Text>
                    <Text numberOfLines={1} style={styles.questMeta}>
                        {selectedQuest ? (journeyTitle ?? "Standalone Quest") : "Focus without a Quest or Journey"}
                    </Text>
                </View>
                {!hasStarted ? (
                    <View style={styles.changeAction}>
                        <Text style={styles.changeText}>Change</Text>
                        <ChevronRight size={16} color={colours.primary} />
                    </View>
                ) : null}
            </Pressable>

            <ActiveSessionNotice message={sessionMessage} showReturnButton={existingOtherSession !== null} onReturn={handleReturnToOtherSession} />

            {!existingOtherSession ? (
                <FocusTimerControls
                    hasStarted={hasStarted}
                    hasFinished={hasFinished}
                    isRunning={isRunning}
                    onStart={() => void handleStartSession().catch(handleTimerActionError)}
                    onToggleTimer={() => void handleToggleTimer().catch(handleTimerActionError)}
                    onEndEarly={() => void handleEndSessionEarly().catch(handleTimerActionError)}
                    onReview={handleReviewSession}
                />
            ) : null}

            <Modal visible={isQuestPickerVisible} transparent animationType="fade" onRequestClose={() => setIsQuestPickerVisible(false)}>
                <View style={styles.modalOverlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsQuestPickerVisible(false)} />
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.eyebrow}>OPTIONAL</Text>
                                <Text style={styles.modalTitle}>Choose a Quest</Text>
                            </View>
                            <Pressable onPress={() => setIsQuestPickerVisible(false)} style={styles.closeButton}>
                                <X size={19} color={colours.textMuted} />
                            </Pressable>
                        </View>
                        <ScrollView style={styles.questList} contentContainerStyle={styles.questListContent} showsVerticalScrollIndicator={false}>
                            <QuestPickerOption
                                title="No Quest"
                                subtitle="Keep this as a standalone Quick Focus session"
                                selected={selectedQuest === null}
                                onPress={() => {
                                    setSelectedQuest(null);
                                    setIsQuestPickerVisible(false);
                                }}
                            />
                            {quests.map((quest) => (
                                <QuestPickerOption
                                    key={quest.id}
                                    title={quest.title}
                                    subtitle={quest.journeyId ? journeys.find((journey) => journey.id === quest.journeyId)?.title ?? "Journey Quest" : "Standalone Quest"}
                                    selected={selectedQuest?.id === quest.id}
                                    onPress={() => {
                                        setSelectedQuest(quest);
                                        setIsQuestPickerVisible(false);
                                    }}
                                />
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function QuestPickerOption({ title, subtitle, selected, onPress }: { title: string; subtitle: string; selected: boolean; onPress: () => void }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <Pressable onPress={onPress} style={({ pressed }) => [styles.pickerOption, selected && styles.selectedPickerOption, pressed && styles.pressed]}>
            <View style={styles.pickerOptionIcon}>
                <Folder size={18} color={selected ? colours.primary : colours.textMuted} />
            </View>
            <View style={styles.questCopy}>
                <Text style={[styles.pickerOptionTitle, selected && styles.selectedPickerOptionTitle]}>{title}</Text>
                <Text style={styles.questMeta}>{subtitle}</Text>
            </View>
            {selected ? <Check size={18} color={colours.primary} /> : null}
        </Pressable>
    );
}

function createTimelineEvent(type: "paused" | "resumed"): FocusTimelineEvent {
    return { type, occurredAt: new Date().toISOString() };
}

function appendCompletedEvent(events: FocusTimelineEvent[], completedAt: number) {
    if (events.some((event) => event.type === "completed")) {
        return events;
    }

    return [...events, { type: "completed", occurredAt: new Date(completedAt).toISOString() } satisfies FocusTimelineEvent];
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        card: {
            width: "100%",
            padding: spacing.lg,
            gap: spacing.md,
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.md,
        },
        eyebrow: {
            fontSize: 11,
            fontWeight: "900",
            letterSpacing: 0.8,
            color: colours.primary,
        },
        cardTitle: {
            marginTop: 3,
            fontSize: 18,
            fontWeight: "800",
            color: colours.text,
        },
        timerIcon: {
            width: 38,
            height: 38,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
            backgroundColor: colours.primarySoft,
        },
        divider: {
            height: 1,
            backgroundColor: colours.border,
        },
        workingLabel: {
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 0.7,
            color: colours.textMuted,
        },
        questSelector: {
            minHeight: 64,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            padding: spacing.sm,
            borderRadius: radius.md,
            backgroundColor: colours.background,
        },
        disabledSelector: {
            opacity: 0.78,
        },
        pressed: {
            opacity: 0.68,
        },
        questIcon: {
            width: 38,
            height: 38,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
            backgroundColor: colours.surface,
        },
        questCopy: {
            minWidth: 0,
            flex: 1,
        },
        questTitle: {
            fontSize: 14,
            fontWeight: "800",
            color: colours.text,
        },
        questMeta: {
            marginTop: 3,
            fontSize: 11,
            lineHeight: 16,
            color: colours.textMuted,
        },
        changeAction: {
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
        },
        changeText: {
            fontSize: 12,
            fontWeight: "800",
            color: colours.primary,
        },
        modalOverlay: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: spacing.lg,
            backgroundColor: "rgba(8, 8, 20, 0.55)",
        },
        modalCard: {
            width: "100%",
            maxWidth: 520,
            maxHeight: "76%",
            padding: spacing.lg,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },
        modalHeader: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.md,
        },
        modalTitle: {
            marginTop: 3,
            fontSize: 21,
            fontWeight: "800",
            color: colours.text,
        },
        closeButton: {
            width: 38,
            height: 38,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
            backgroundColor: colours.background,
        },
        questList: {
            marginTop: spacing.lg,
        },
        questListContent: {
            gap: spacing.sm,
            paddingBottom: spacing.xs,
        },
        pickerOption: {
            minHeight: 68,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,
            backgroundColor: colours.background,
        },
        selectedPickerOption: {
            borderColor: colours.primaryBorder,
            backgroundColor: colours.primarySoft,
        },
        pickerOptionIcon: {
            width: 36,
            height: 36,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
            backgroundColor: colours.surface,
        },
        pickerOptionTitle: {
            fontSize: 14,
            fontWeight: "700",
            color: colours.text,
        },
        selectedPickerOptionTitle: {
            color: colours.primary,
        },
    });
}
