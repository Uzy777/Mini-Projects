import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock3, FileText, Flag, Folder, Pause, Play, Square, Star, Target } from "lucide-react-native";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { useAuth } from "@/contexts/AuthContext";
import { getRemoteFocusSession } from "@/services/focusSessions/focusSessionService";
import { getRemoteJourneys } from "@/services/journeys/journeyService";
import type { FocusSessionRecord, FocusTimelineEvent, SessionOutcome } from "@/types/models";
import { formatProgressDuration, getSessionSeconds } from "@/utils/dashboardStats";

const OUTCOME_LABELS: Record<SessionOutcome, string> = {
    completed: "Completed",
    progressed: "Progress made",
    blocked: "Blocked",
    stopped: "Stopped early",
};

export default function SessionDetailsScreen() {
    const { colours } = useAppearance();
    const { session: authSession } = useAuth();
    const router = useRouter();
    const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const [focusSession, setFocusSession] = useState<FocusSessionRecord | null>(null);
    const [journeyTitle, setJourneyTitle] = useState("Standalone quests");
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const loadSession = useCallback(async () => {
        if (!authSession || !sessionId) {
            setFocusSession(null);
            setErrorMessage("This Focus Session could not be found.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setErrorMessage("");

        try {
            const [sessionResult, journeysResult] = await Promise.all([
                getRemoteFocusSession(authSession.user.id, sessionId),
                getRemoteJourneys(authSession.user.id),
            ]);

            if (sessionResult.error) {
                throw sessionResult.error;
            }
            if (!sessionResult.data) {
                setFocusSession(null);
                setErrorMessage("This Focus Session no longer exists or is unavailable.");
                return;
            }

            setFocusSession(sessionResult.data);

            if (sessionResult.data.journeyId) {
                const matchingJourney = journeysResult.data?.find((journey) => journey.id === sessionResult.data?.journeyId);
                setJourneyTitle(matchingJourney?.title ?? "Journey quests");
            } else {
                setJourneyTitle("Standalone quests");
            }

            if (journeysResult.error) {
                console.error("Failed to load Session Journey:", journeysResult.error);
            }
        } catch (error) {
            console.error("Failed to load Focus Session details:", error);
            setFocusSession(null);
            setErrorMessage("Session details could not be loaded. Check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    }, [authSession, sessionId]);

    useFocusEffect(
        useCallback(() => {
            void loadSession();
        }, [loadSession]),
    );

    return (
        <AppScreenBackground>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.navigationRow}>
                    <Pressable accessibilityLabel="Back to Progress history" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
                        <ArrowLeft size={22} color={colours.text} />
                    </Pressable>
                </View>

                <Text style={styles.screenTitle}>Session Details</Text>

                {isLoading ? (
                    <View style={styles.loadingState}>
                        <ActivityIndicator size="small" color={colours.primary} />
                        <Text style={styles.loadingText}>Loading Focus Session…</Text>
                    </View>
                ) : errorMessage || !focusSession ? (
                    <View style={styles.errorState}>
                        <AlertCircle size={30} color={colours.danger} />
                        <Text style={styles.errorTitle}>Session unavailable</Text>
                        <Text style={styles.errorText}>{errorMessage}</Text>
                        <Pressable onPress={() => void loadSession()} style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
                            <Text style={styles.retryButtonText}>Try again</Text>
                        </Pressable>
                    </View>
                ) : (
                    <SessionDetailsContent session={focusSession} journeyTitle={journeyTitle} />
                )}
            </ScrollView>
        </AppScreenBackground>
    );
}

function SessionDetailsContent({ session, journeyTitle }: { session: FocusSessionRecord; journeyTitle: string }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const focusedSeconds = getSessionSeconds(session);
    const completedAt = new Date(session.completedAt);
    const calculatedStartedAt = new Date(completedAt.getTime() - focusedSeconds * 1000);
    const outcomeLabel = OUTCOME_LABELS[session.outcome];
    const recordedTimeline = getValidTimelineEvents(session.timelineEvents);
    const hasRecordedTimeline = recordedTimeline.length > 0;
    const timelineEvents: FocusTimelineEvent[] = hasRecordedTimeline
        ? recordedTimeline
        : [{ type: "started", occurredAt: calculatedStartedAt.toISOString() }];
    const hasRecordedCompletion = timelineEvents.some((event) => event.type === "completed");
    const completedEvent: FocusTimelineEvent = {
        type: "completed",
        occurredAt: completedAt.toISOString(),
    };
    const displayedTimeline = hasRecordedCompletion ? timelineEvents : [...timelineEvents, completedEvent];
    const focusCompletedAt = new Date(displayedTimeline[displayedTimeline.length - 1].occurredAt);
    const pauseCount = displayedTimeline.filter((event) => event.type === "paused").length;

    return (
        <View style={styles.sections}>
            <View style={styles.summaryCard}>
                <View style={styles.questHeader}>
                    <View style={styles.questIcon}>
                        <Folder size={23} color={colours.primary} />
                    </View>
                    <View style={styles.questCopy}>
                        <Text style={styles.questTitle}>{session.questTitle}</Text>
                        <View style={styles.journeyRow}>
                            <Folder size={12} color={colours.textMuted} />
                            <Text style={styles.journeyTitle}>{journeyTitle}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.summaryFooter}>
                    <View>
                        <View style={styles.outcomeRow}>
                            {getOutcomeIcon(session.outcome, colours.primary)}
                            <Text style={styles.outcomeText}>{outcomeLabel}</Text>
                        </View>
                        <Text style={styles.completedDate}>
                            {focusCompletedAt.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })} ·{" "}
                            {focusCompletedAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                        </Text>
                    </View>
                    <View style={styles.focusTotal}>
                        <Text style={styles.focusValue}>{formatProgressDuration(focusedSeconds, true)}</Text>
                        <Text style={styles.focusLabel}>Focus Time</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Overview</Text>
                <View style={styles.detailCard}>
                    <DetailRow icon={<Clock3 size={17} color={colours.primary} />} label="Planned Time" value={`${session.plannedMinutes} min`} />
                    <View style={styles.divider} />
                    <DetailRow icon={<Target size={17} color={colours.primary} />} label="Actual Focus Time" value={formatProgressDuration(focusedSeconds, true)} accent />
                    <View style={styles.divider} />
                    <DetailRow icon={getOutcomeIcon(session.outcome, colours.primary)} label="Outcome" value={outcomeLabel} accent />
                    <View style={styles.divider} />
                    <DetailRow icon={<Star size={17} color={colours.primary} />} label="XP Earned" value={`+${session.earnedXp} XP`} accent />
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeadingRow}>
                    <Text style={styles.sectionTitle}>Timeline</Text>
                    <Text style={styles.timelineHint}>
                        {hasRecordedTimeline ? `${pauseCount} ${pauseCount === 1 ? "pause" : "pauses"} recorded` : "Start time calculated from focused duration"}
                    </Text>
                </View>
                <View style={styles.timelineCard}>
                    {displayedTimeline.map((event, index) => {
                        const eventDate = new Date(event.occurredAt);
                        const isFinalEvent = index === displayedTimeline.length - 1;
                        const nextEvent = displayedTimeline[index + 1];

                        return (
                            <TimelineRow
                                key={`${event.type}-${event.occurredAt}-${index}`}
                                icon={getTimelineIcon(event.type, colours.primary)}
                                title={event.type === "completed" ? outcomeLabel : getTimelineEventLabel(event.type)}
                                detail={getTimelineEventDetail(event, eventDate, nextEvent, focusedSeconds)}
                                showLine={!isFinalEvent}
                            />
                        );
                    })}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <View style={styles.notesCard}>
                    <View style={styles.notesHeading}>
                        <FileText size={17} color={colours.primary} />
                        <Text style={styles.notesLabel}>Accomplishment</Text>
                    </View>
                    <Text style={styles.notesText}>{session.accomplishment.trim() || "No accomplishment notes were added."}</Text>

                    {session.nextAction.trim() ? (
                        <View style={styles.nextActionBox}>
                            <Text style={styles.nextActionLabel}>NEXT ACTION</Text>
                            <Text style={styles.nextActionText}>{session.nextAction}</Text>
                        </View>
                    ) : null}
                </View>
            </View>

            {/*
                Editing completed Focus Sessions is intentionally disabled for now.
                <Pressable style={styles.editSessionButton} onPress={handleEditSession}>
                    <Text style={styles.editSessionButtonText}>Edit Session</Text>
                </Pressable>
            */}
        </View>
    );
}

function getValidTimelineEvents(events: FocusTimelineEvent[] | undefined) {
    if (!Array.isArray(events)) {
        return [];
    }

    const validTypes = new Set(["started", "paused", "resumed", "completed"]);

    return [...events]
        .filter((event) => event && validTypes.has(event.type) && !Number.isNaN(new Date(event.occurredAt).getTime()))
        .sort((first, second) => new Date(first.occurredAt).getTime() - new Date(second.occurredAt).getTime());
}

function getTimelineEventLabel(type: FocusTimelineEvent["type"]) {
    if (type === "paused") {
        return "Paused";
    }
    if (type === "resumed") {
        return "Resumed";
    }
    return "Started";
}

function getTimelineIcon(type: FocusTimelineEvent["type"], colour: string) {
    if (type === "paused") {
        return <Pause size={15} color={colour} />;
    }
    if (type === "completed") {
        return <Flag size={16} color={colour} />;
    }
    return <Play size={15} color={colour} fill={colour} />;
}

function getTimelineEventDetail(event: FocusTimelineEvent, eventDate: Date, nextEvent: FocusTimelineEvent | undefined, focusedSeconds: number) {
    const eventTime = eventDate.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

    if (event.type === "completed") {
        return `${eventTime} · Total ${formatProgressDuration(focusedSeconds, true)}`;
    }

    if (event.type === "paused" && nextEvent) {
        const pausedSeconds = Math.max(0, Math.round((new Date(nextEvent.occurredAt).getTime() - eventDate.getTime()) / 1000));
        return `${eventTime} · Paused for ${formatProgressDuration(pausedSeconds, true)}`;
    }

    return eventTime;
}

function DetailRow({ icon, label, value, accent = false }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <View style={styles.detailRow}>
            <View style={styles.detailIcon}>{icon}</View>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={[styles.detailValue, accent && styles.accentValue]}>{value}</Text>
        </View>
    );
}

function TimelineRow({ icon, title, detail, showLine = false }: { icon: React.ReactNode; title: string; detail: string; showLine?: boolean }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <View style={styles.timelineRow}>
            <View style={styles.timelineIconColumn}>
                <View style={styles.timelineIcon}>{icon}</View>
                {showLine ? <View style={styles.timelineLine} /> : null}
            </View>
            <View style={styles.timelineCopy}>
                <Text style={styles.timelineTitle}>{title}</Text>
                <Text style={styles.timelineDetail}>{detail}</Text>
            </View>
        </View>
    );
}

function getOutcomeIcon(outcome: SessionOutcome, colour: string) {
    if (outcome === "completed") {
        return <CheckCircle2 size={18} color={colour} />;
    }
    if (outcome === "blocked") {
        return <AlertCircle size={18} color={colour} />;
    }
    if (outcome === "stopped") {
        return <Square size={16} color={colour} />;
    }
    return <Clock3 size={18} color={colour} />;
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: "transparent",
        },
        contentContainer: {
            width: "100%",
            maxWidth: 720,
            alignSelf: "center",
            paddingHorizontal: spacing.md,
            paddingTop: spacing.md,
            paddingBottom: 56,
        },
        navigationRow: {
            minHeight: 42,
            justifyContent: "center",
        },
        backButton: {
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
        },
        pressed: {
            opacity: 0.65,
        },
        screenTitle: {
            marginTop: spacing.sm,
            marginBottom: spacing.lg,
            fontSize: 27,
            lineHeight: 33,
            fontWeight: "900",
            color: colours.text,
        },
        loadingState: {
            minHeight: 320,
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },
        loadingText: {
            fontSize: 12,
            color: colours.textMuted,
        },
        errorState: {
            minHeight: 320,
            alignItems: "center",
            justifyContent: "center",
            padding: spacing.xl,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },
        errorTitle: {
            marginTop: spacing.md,
            fontSize: 17,
            fontWeight: "800",
            color: colours.text,
        },
        errorText: {
            maxWidth: 360,
            marginTop: spacing.sm,
            fontSize: 12,
            lineHeight: 18,
            color: colours.textMuted,
            textAlign: "center",
        },
        retryButton: {
            minHeight: 40,
            marginTop: spacing.lg,
            paddingHorizontal: spacing.lg,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.md,
            backgroundColor: colours.primary,
        },
        retryButtonText: {
            fontSize: 12,
            fontWeight: "800",
            color: "#ffffff",
        },
        sections: {
            gap: spacing.lg,
        },
        summaryCard: {
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },
        questHeader: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
        },
        questIcon: {
            width: 48,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.md,
            backgroundColor: colours.primarySoft,
        },
        questCopy: {
            flex: 1,
        },
        questTitle: {
            fontSize: 18,
            fontWeight: "800",
            color: colours.text,
        },
        journeyRow: {
            marginTop: 5,
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
        },
        journeyTitle: {
            flex: 1,
            fontSize: 12,
            color: colours.textMuted,
        },
        summaryFooter: {
            marginTop: spacing.lg,
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: spacing.md,
        },
        outcomeRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
        },
        outcomeText: {
            fontSize: 13,
            fontWeight: "800",
            color: colours.primary,
        },
        completedDate: {
            marginTop: 5,
            fontSize: 11,
            color: colours.textMuted,
        },
        focusTotal: {
            alignItems: "flex-end",
        },
        focusValue: {
            fontSize: 24,
            fontWeight: "900",
            color: colours.text,
        },
        focusLabel: {
            marginTop: 2,
            fontSize: 11,
            color: colours.textMuted,
        },
        section: {
            gap: spacing.sm,
        },
        sectionHeadingRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.md,
        },
        sectionTitle: {
            fontSize: 15,
            fontWeight: "800",
            color: colours.text,
        },
        timelineHint: {
            flexShrink: 1,
            fontSize: 9,
            color: colours.textMuted,
            textAlign: "right",
        },
        detailCard: {
            paddingHorizontal: spacing.md,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },
        detailRow: {
            minHeight: 56,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
        },
        detailIcon: {
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
            backgroundColor: colours.primarySoft,
        },
        detailLabel: {
            flex: 1,
            fontSize: 12,
            color: colours.text,
        },
        detailValue: {
            fontSize: 12,
            fontWeight: "800",
            color: colours.text,
        },
        accentValue: {
            color: colours.primary,
        },
        divider: {
            height: 1,
            marginLeft: 40,
            backgroundColor: colours.border,
        },
        timelineCard: {
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },
        timelineRow: {
            minHeight: 66,
            flexDirection: "row",
            gap: spacing.md,
        },
        timelineIconColumn: {
            width: 38,
            alignItems: "center",
        },
        timelineIcon: {
            zIndex: 1,
            width: 36,
            height: 36,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
            backgroundColor: colours.primarySoft,
        },
        timelineLine: {
            position: "absolute",
            top: 36,
            bottom: -30,
            width: 2,
            backgroundColor: colours.primaryBorder,
        },
        timelineCopy: {
            flex: 1,
            paddingTop: 3,
        },
        timelineTitle: {
            fontSize: 13,
            fontWeight: "800",
            color: colours.text,
        },
        timelineDetail: {
            marginTop: 4,
            fontSize: 11,
            color: colours.textMuted,
        },
        notesCard: {
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },
        notesHeading: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
        },
        notesLabel: {
            fontSize: 12,
            fontWeight: "800",
            color: colours.text,
        },
        notesText: {
            marginTop: spacing.md,
            fontSize: 13,
            lineHeight: 20,
            color: colours.text,
        },
        nextActionBox: {
            marginTop: spacing.md,
            padding: spacing.md,
            borderRadius: radius.md,
            backgroundColor: colours.primarySoft,
        },
        nextActionLabel: {
            fontSize: 10,
            fontWeight: "800",
            letterSpacing: 0.6,
            color: colours.primary,
        },
        nextActionText: {
            marginTop: 4,
            fontSize: 12,
            lineHeight: 18,
            fontWeight: "600",
            color: colours.text,
        },
        editSessionButton: {
            minHeight: 46,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.md,
            backgroundColor: colours.primarySoft,
        },
        editSessionButtonText: {
            fontSize: 13,
            fontWeight: "800",
            color: colours.primary,
        },
    });
}
