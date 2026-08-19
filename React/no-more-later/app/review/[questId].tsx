import { useEffect, useMemo, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, ScrollView, View } from "react-native";
import { Info } from "lucide-react-native";

import { calculateLevel } from "../../utils/level";
import type { SessionOutcome } from "../../types/models";
import { SessionOutcomeSelector } from "../../components/review/SessionOutcomeSelector";
import { ReviewResultCard } from "../../components/review/ReviewResultCard";
import { ReviewForm } from "../../components/review/ReviewForm";
import { getReviewValidationMessage } from "../../utils/reviewValidation";
import { clearActiveFocusSession, getActiveFocusSession } from "../../services/storage/activeFocusSessionStorage";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import { useAuth } from "@/contexts/AuthContext";
import { getRemoteQuest } from "@/services/quests/questService";
import { completeRemoteReview } from "@/services/reviews/reviewService";
import { LevelUpCelebration } from "@/components/level/LevelUpCelebration";
import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

export default function ReviewSessionScreen() {
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    const router = useRouter();
    const { session } = useAuth();

    const { questId, questTitle, journeyId, focusSessionId, plannedMinutes, actualSeconds, endedEarly, source, quickFocus } = useLocalSearchParams<{
        questId: string;
        questTitle?: string;
        journeyId?: string;
        focusSessionId: string;
        plannedMinutes?: string;
        actualSeconds?: string;
        endedEarly?: string;
        source?: "work" | "tasks" | "quick-focus";
        quickFocus?: string;
    }>();
    const isQuestlessQuickFocus = quickFocus === "true";
    const reviewedSeconds = Math.max(0, Number(actualSeconds ?? Number(plannedMinutes ?? 0) * 60));
    const earnsNoXp = reviewedSeconds < 10 * 60;
    const hasEarlyFinishXp = endedEarly === "true" && !earnsNoXp;

    type LevelUpDetails = {
        previousLevel: number;
        newLevel: number;
        earnedXp: number;
    };

    const [selectedOutcome, setSelectedOutcome] = useState<SessionOutcome | null>(endedEarly === "true" ? "stopped" : null);
    const [questDoneWhen, setQuestDoneWhen] = useState<string | null>(null);
    const [accomplishment, setAccomplishment] = useState("");
    const [nextAction, setNextAction] = useState("");
    const [validationMessage, setValidationMessage] = useState("");
    const [earnedXp, setEarnedXp] = useState<number | null>(null);
    const [totalXp, setTotalXp] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reachedLevel, setReachedLevel] = useState<number | null>(null);
    const [finishLineConfirmed, setFinishLineConfirmed] = useState(false);
    const [levelUpDetails, setLevelUpDetails] = useState<LevelUpDetails | null>(null);

    useEffect(() => {
        async function loadQuest() {
            if (isQuestlessQuickFocus) {
                setQuestDoneWhen(null);
                return;
            }

            const { data: remoteQuest, error: remoteQuestError } = await getRemoteQuest(journeyId, questId);

            if (remoteQuestError) {
                console.error("Failed to load remote Quest:", remoteQuestError);

                setQuestDoneWhen(null);

                return;
            }

            setQuestDoneWhen(remoteQuest?.doneWhen?.trim() || null);
        }

        loadQuest();
    }, [isQuestlessQuickFocus, journeyId, questId]);

    function handleReturnToJourneys() {
        if (source === "work") {
            router.replace("/work");
            return;
        }

        if (source === "tasks") {
            router.replace("/tasks");
            return;
        }

        if (source === "quick-focus") {
            router.replace("/");
            return;
        }

        router.replace("/journeys");
    }

    function handleViewHistory() {
        router.replace("/history");
    }

    async function handleCompleteReview() {
        if (isSubmitting || earnedXp !== null) {
            return;
        }

        const trimmedAccomplishment = accomplishment.trim();
        const trimmedNextAction = nextAction.trim();

        const reviewValidationMessage = getReviewValidationMessage({
            selectedOutcome,
            accomplishment,
            nextAction,
        });

        if (reviewValidationMessage) {
            setValidationMessage(reviewValidationMessage);

            return;
        }

        if (!selectedOutcome) {
            return;
        }

        if (selectedOutcome === "completed" && questDoneWhen && !finishLineConfirmed) {
            setValidationMessage(`Confirm that you genuinely met your ${source === "tasks" ? "Task" : "Quest"} finish line.`);

            return;
        }

        if (!session) {
            setValidationMessage("You need to be signed in to save this Review.");

            return;
        }

        setValidationMessage("");
        setIsSubmitting(true);

        try {
            const sessionMinutes = Number(plannedMinutes ?? 0);

            const focusedSeconds = Number(actualSeconds ?? sessionMinutes * 60);
            const activeFocusSession = await getActiveFocusSession();
            const timelineEvents = activeFocusSession?.id === focusSessionId ? (activeFocusSession.timelineEvents ?? []) : [];

            const reviewInput = {
                focusSessionId,
                journeyId,
                questId: isQuestlessQuickFocus ? undefined : questId,
                plannedMinutes: sessionMinutes,
                actualSeconds: focusedSeconds,
                outcome: selectedOutcome,
                accomplishment: trimmedAccomplishment,
                nextAction: trimmedNextAction,
                timelineEvents,
            };

            const { data: completedReview, error: completeReviewError } = await completeRemoteReview(reviewInput);

            if (completeReviewError || !completedReview) {
                console.error("Failed to complete remote Review:", completeReviewError);

                setValidationMessage("Could not save your Review. Try again.");

                return;
            }

            const sessionXp = completedReview.earnedXp;

            const updatedTotalXp = completedReview.totalXp;

            const previousTotalXp = Math.max(0, updatedTotalXp - sessionXp);

            const previousLevel = calculateLevel(previousTotalXp);

            const updatedLevel = calculateLevel(updatedTotalXp);

            await clearActiveFocusSession();

            setEarnedXp(sessionXp);
            setTotalXp(updatedTotalXp);

            if (updatedLevel > previousLevel) {
                setReachedLevel(updatedLevel);

                setLevelUpDetails({
                    previousLevel,
                    newLevel: updatedLevel,
                    earnedXp: sessionXp,
                });
            } else {
                setReachedLevel(null);
                setLevelUpDetails(null);
            }
        } catch (error) {
            console.error("Failed to complete Review:", error);

            setValidationMessage("Could not save your Review. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const showNextAction = selectedOutcome !== null && selectedOutcome !== "completed";

    function handleSelectOutcome(outcome: SessionOutcome) {
        setSelectedOutcome(outcome);
        setFinishLineConfirmed(false);
        setValidationMessage("");
    }

    function handleCloseLevelUpCelebration() {
        setLevelUpDetails(null);
    }

    return (
        <AppScreenBackground>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Stack.Screen
                    options={{
                        title: "Review",
                    }}
                />

                {levelUpDetails && (
                    <LevelUpCelebration
                        previousLevel={levelUpDetails.previousLevel}
                        newLevel={levelUpDetails.newLevel}
                        earnedXp={levelUpDetails.earnedXp}
                        onContinue={handleCloseLevelUpCelebration}
                    />
                )}

                <ScreenHeader
                    eyebrow="SESSION REVIEW"
                    title={isQuestlessQuickFocus ? "Quick Focus" : (questTitle ?? (source === "tasks" ? "Untitled Task" : "Untitled Quest"))}
                    subtitle="Capture the progress while it is still fresh."
                    action={<View style={styles.sessionBadge}><Text style={styles.sessionLength}>{plannedMinutes ?? "0"} min</Text></View>}
                />

                {earnedXp !== null && totalXp !== null ? (
                    <ReviewResultCard
                        earnedXp={earnedXp}
                        totalXp={totalXp}
                        reachedLevel={reachedLevel}
                        onReturnToJourneys={handleReturnToJourneys}
                        onViewHistory={handleViewHistory}
                        returnLabel={source === "quick-focus" ? "Return Home" : source === "tasks" ? "Return to Tasks" : undefined}
                    />
                ) : (
                    <View style={styles.reviewSections}>
                        {earnsNoXp || hasEarlyFinishXp ? (
                            <View style={[styles.xpNotice, earnsNoXp ? styles.noXpNotice : styles.earlyXpNotice]}>
                                <Info size={18} color={earnsNoXp ? colours.warning : colours.primaryStrong} />
                                <View style={styles.xpNoticeCopy}>
                                    <Text style={styles.xpNoticeTitle}>{earnsNoXp ? "No XP for this session" : "Early-finish XP"}</Text>
                                    <Text style={styles.xpNoticeText}>{earnsNoXp ? "Focus for at least 10 minutes to earn XP. You can still save this session to History." : "You focused for at least 10 minutes, so this early finish will award 20 XP after Review."}</Text>
                                </View>
                            </View>
                        ) : null}

                        <SessionOutcomeSelector
                            selectedOutcome={selectedOutcome}
                            onSelectOutcome={handleSelectOutcome}
                            isQuestlessQuickFocus={isQuestlessQuickFocus}
                            terminology={source === "tasks" ? "task" : "quest"}
                        />

                        {selectedOutcome === "completed" && questDoneWhen && (
                            <View style={styles.finishLineCard}>
                                <Text style={styles.finishLineLabel}>YOUR FINISH LINE</Text>

                                <Text style={styles.finishLineDescription}>You said this {source === "tasks" ? "Task" : "Quest"} would be complete when:</Text>

                                <Text style={styles.finishLineText}>{questDoneWhen}</Text>

                                <AnimatedPressable style={styles.confirmationRow} haptic="selection" onPress={() => setFinishLineConfirmed((currentValue) => !currentValue)}>
                                    <View style={[styles.checkbox, finishLineConfirmed && styles.checkboxConfirmed]}>
                                        {finishLineConfirmed && <Text style={styles.checkmark}>✓</Text>}
                                    </View>

                                    <Text style={styles.confirmationText}>I genuinely met this finish line.</Text>
                                </AnimatedPressable>
                            </View>
                        )}

                        <ReviewForm
                            accomplishment={accomplishment}
                            nextAction={nextAction}
                            showNextAction={showNextAction}
                            errorMessage={validationMessage}
                            onChangeAccomplishment={setAccomplishment}
                            onChangeNextAction={setNextAction}
                            isSubmitting={isSubmitting}
                            onSubmit={handleCompleteReview}
                        />
                    </View>
                )}
            </ScrollView>
        </AppScreenBackground>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: colours.background,
        },

        contentContainer: {
            width: "100%",
            maxWidth: 720,
            alignSelf: "center",
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: 48,
        },

        sessionBadge: {
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            backgroundColor: colours.primarySubtle,
        },

        sessionLength: {
            fontSize: 13,
            fontWeight: "700",
            color: colours.primaryStrong,
        },

        reviewSections: {
            width: "100%",
            marginTop: spacing.xl,
            gap: spacing.xl,
        },
        xpNotice: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, padding: spacing.md, borderWidth: 1, borderRadius: radius.md },
        noXpNotice: { borderColor: colours.warningBorder, backgroundColor: colours.warningSoft },
        earlyXpNotice: { borderColor: colours.primaryBorder, backgroundColor: colours.primarySubtle },
        xpNoticeCopy: { minWidth: 0, flex: 1 },
        xpNoticeTitle: { fontSize: 13, fontWeight: "800", color: colours.text },
        xpNoticeText: { marginTop: 3, fontSize: 12, lineHeight: 18, color: colours.textMuted },
        finishLineCard: {
            width: "100%",
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.lg,
            backgroundColor: colours.primarySubtle,
        },

        finishLineLabel: {
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 0.8,
            color: colours.primaryStrong,
        },

        finishLineDescription: {
            marginTop: spacing.sm,
            fontSize: 13,
            lineHeight: 19,
            color: colours.textMuted,
        },

        finishLineText: {
            marginTop: spacing.sm,
            fontSize: 16,
            lineHeight: 23,
            fontWeight: "600",
            color: colours.text,
        },
        confirmationRow: {
            marginTop: spacing.lg,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
        },

        checkbox: {
            width: 22,
            height: 22,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: colours.primaryBorder,
            borderRadius: 6,
            backgroundColor: colours.surface,
        },

        checkboxConfirmed: {
            borderColor: colours.primary,
            backgroundColor: colours.primary,
        },

        checkmark: {
            fontSize: 14,
            fontWeight: "800",
            color: colours.onPrimary,
        },

        confirmationText: {
            flex: 1,
            fontSize: 14,
            lineHeight: 20,
            fontWeight: "600",
            color: colours.text,
        },
        scrollView: {
            flex: 1,
            backgroundColor: "transparent",
        },
    });
}
