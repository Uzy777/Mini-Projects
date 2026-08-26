import { useEffect, useMemo, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Info } from "lucide-react-native";
import Animated, { FadeInUp, useReducedMotion } from "react-native-reanimated";

import { calculateLevel } from "../../utils/level";
import type { SessionOutcome } from "../../types/models";
import { SessionOutcomeSelector } from "../../components/review/SessionOutcomeSelector";
import { ReviewResultCard } from "../../components/review/ReviewResultCard";
import { ReviewForm } from "../../components/review/ReviewForm";
import { getReviewValidationMessage } from "../../utils/reviewValidation";
import { clearActiveFocusSession, getActiveFocusSession } from "../../services/storage/activeFocusSessionStorage";
import { getScreenGutter, radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import { useAuth } from "@/contexts/AuthContext";
import { getRemoteQuest } from "@/services/quests/questService";
import { completeRemoteReview, getDailyCreditedFocusSeconds } from "@/services/reviews/reviewService";
import { LevelUpCelebration } from "@/components/level/LevelUpCelebration";
import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { KeyboardAwareScrollView } from "@/components/ui/KeyboardAwareLayout";
import { getActiveSessionReviewState } from "@/utils/focusTimer";
import { ReviewXpPreview } from "@/components/review/ReviewXpPreview";
import { MINIMUM_XP_FOCUS_SECONDS } from "@/constants/xp";
import { BadgeUnlockCelebration } from "@/components/badges/BadgeUnlockCelebration";
import { evaluateBadgeUnlocks, getMyTotalXp } from "@/services/badges/badgeService";
import type { BadgeUnlockAward } from "@/types/badges";

export default function ReviewSessionScreen() {
    const { colours } = useAppearance();
    const { width } = useWindowDimensions();
    const reduceMotion = useReducedMotion();

    const styles = useMemo(() => createStyles(colours, getScreenGutter(width)), [colours, width]);

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
    const routeEndedEarly = endedEarly === "true";
    const routeReviewedSeconds = Math.max(0, Number(actualSeconds ?? Number(plannedMinutes ?? 0) * 60));

    type LevelUpDetails = {
        previousLevel: number;
        newLevel: number;
        earnedXp: number;
    };

    const [reviewedSeconds, setReviewedSeconds] = useState(routeReviewedSeconds);
    const [isEndedEarly, setIsEndedEarly] = useState(routeEndedEarly);
    const [selectedOutcome, setSelectedOutcome] = useState<SessionOutcome | null>(routeReviewedSeconds < MINIMUM_XP_FOCUS_SECONDS ? "stopped" : null);
    const [questDoneWhen, setQuestDoneWhen] = useState<string | null>(null);
    const [accomplishment, setAccomplishment] = useState("");
    const [validationMessage, setValidationMessage] = useState("");
    const [earnedXp, setEarnedXp] = useState<number | null>(null);
    const [totalXp, setTotalXp] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reachedLevel, setReachedLevel] = useState<number | null>(null);
    const [finishLineConfirmed, setFinishLineConfirmed] = useState(false);
    const [levelUpDetails, setLevelUpDetails] = useState<LevelUpDetails | null>(null);
    const [dailyCreditedSeconds, setDailyCreditedSeconds] = useState(0);
    const [awardedBaseXp, setAwardedBaseXp] = useState(0);
    const [awardedBonusXp, setAwardedBonusXp] = useState(0);
    const [awardedBadgeXp, setAwardedBadgeXp] = useState(0);
    const [awardedCreditedSeconds, setAwardedCreditedSeconds] = useState(0);
    const [xpCreditStatus, setXpCreditStatus] = useState<"credited" | "under_minimum" | "daily_limit" | "unverified" | "legacy">("credited");
    const [serverTracked, setServerTracked] = useState(true);
    const [savedOutcome, setSavedOutcome] = useState<SessionOutcome | null>(null);
    const [badgeUnlockAwards, setBadgeUnlockAwards] = useState<BadgeUnlockAward[]>([]);
    const [badgeCelebrationIndex, setBadgeCelebrationIndex] = useState(0);
    const earnsNoXp = reviewedSeconds < MINIMUM_XP_FOCUS_SECONDS;

    useEffect(() => {
        let isCurrent = true;

        async function verifyActiveSession() {
            const activeFocusSession = await getActiveFocusSession();
            if (!isCurrent || activeFocusSession?.id !== focusSessionId) return;

            const reviewState = getActiveSessionReviewState(activeFocusSession);
            setReviewedSeconds(reviewState.actualSeconds);
            setIsEndedEarly(reviewState.endedEarly);
            setServerTracked(Boolean(activeFocusSession.serverTracked));

            if (reviewState.actualSeconds < MINIMUM_XP_FOCUS_SECONDS) {
                setSelectedOutcome("stopped");
                setAccomplishment("");
                setFinishLineConfirmed(false);
            }
        }

        void verifyActiveSession().catch((error) => {
            console.error("Failed to verify active Focus Session:", error);
        });

        return () => {
            isCurrent = false;
        };
    }, [focusSessionId]);

    useEffect(() => {
        void getDailyCreditedFocusSeconds()
            .then(setDailyCreditedSeconds)
            .catch((error) => {
                console.warn("Failed to load today's credited Focus time:", error);
            });
    }, []);

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

        const activeFocusSession = await getActiveFocusSession();
        const matchingActiveSession = activeFocusSession?.id === focusSessionId ? activeFocusSession : null;
        const verifiedReviewState = matchingActiveSession ? getActiveSessionReviewState(matchingActiveSession) : null;
        const focusedSeconds = verifiedReviewState?.actualSeconds ?? reviewedSeconds;
        const verifiedOutcome: SessionOutcome | null = focusedSeconds < MINIMUM_XP_FOCUS_SECONDS ? "stopped" : selectedOutcome;
        const trimmedAccomplishment = accomplishment.trim();
        const savedAccomplishment = verifiedOutcome === "stopped" ? "" : trimmedAccomplishment;

        const reviewValidationMessage = getReviewValidationMessage({
            selectedOutcome: verifiedOutcome,
            accomplishment: savedAccomplishment,
        });

        if (reviewValidationMessage) {
            setValidationMessage(reviewValidationMessage);

            return;
        }

        if (!verifiedOutcome) {
            return;
        }

        if (verifiedOutcome === "completed" && questDoneWhen && !finishLineConfirmed) {
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
            const sessionMinutes = matchingActiveSession?.selectedMinutes ?? Number(plannedMinutes ?? 0);
            const timelineEvents = matchingActiveSession?.timelineEvents ?? [];

            const reviewInput = {
                focusSessionId,
                journeyId,
                questId: isQuestlessQuickFocus ? undefined : questId,
                plannedMinutes: sessionMinutes,
                actualSeconds: focusedSeconds,
                outcome: verifiedOutcome,
                finishLineConfirmed,
                accomplishment: savedAccomplishment,
                nextAction: "",
                timelineEvents,
            };

            const { data: completedReview, error: completeReviewError } = await completeRemoteReview(reviewInput);

            if (completeReviewError || !completedReview) {
                console.error("Failed to complete remote Review:", completeReviewError);

                setValidationMessage("Could not save your Review. Try again.");

                return;
            }

            const sessionXp = completedReview.earnedXp;
            const { data: badgeEvaluation, error: badgeEvaluationError } = await evaluateBadgeUnlocks();
            let badgeXp = 0;
            let unlockedBadges: BadgeUnlockAward[] = [];
            let updatedTotalXp = completedReview.totalXp;

            if (badgeEvaluationError || !badgeEvaluation) {
                console.warn("Review saved, but badges could not be evaluated:", badgeEvaluationError);
                const totalXpResult = await getMyTotalXp();
                updatedTotalXp = totalXpResult.data ?? completedReview.totalXp;
            } else {
                badgeXp = badgeEvaluation.badgeXpAwarded;
                unlockedBadges = badgeEvaluation.unlocks;
                updatedTotalXp = badgeEvaluation.totalXp;
            }

            const reviewAwardXp = sessionXp + badgeXp;
            const previousTotalXp = Math.max(0, updatedTotalXp - reviewAwardXp);

            const previousLevel = calculateLevel(previousTotalXp);

            const updatedLevel = calculateLevel(updatedTotalXp);

            await clearActiveFocusSession();

            setEarnedXp(reviewAwardXp);
            setTotalXp(updatedTotalXp);
            setAwardedBaseXp(completedReview.baseXp);
            setAwardedBonusXp(completedReview.bonusXp);
            setAwardedBadgeXp(badgeXp);
            setAwardedCreditedSeconds(completedReview.creditedFocusSeconds);
            setXpCreditStatus(completedReview.xpCreditStatus);
            setSavedOutcome(verifiedOutcome);
            setBadgeUnlockAwards(unlockedBadges);
            setBadgeCelebrationIndex(0);

            if (updatedLevel > previousLevel) {
                setReachedLevel(updatedLevel);

                setLevelUpDetails({
                    previousLevel,
                    newLevel: updatedLevel,
                    earnedXp: reviewAwardXp,
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

    function handleSelectOutcome(outcome: SessionOutcome) {
        if (earnsNoXp) return;

        setSelectedOutcome(outcome);
        if (outcome === "stopped") setAccomplishment("");
        setFinishLineConfirmed(false);
        setValidationMessage("");
    }

    function handleCloseLevelUpCelebration() {
        setLevelUpDetails(null);
    }

    function handleCloseBadgeCelebration() {
        if (badgeCelebrationIndex + 1 < badgeUnlockAwards.length) {
            setBadgeCelebrationIndex((current) => current + 1);
            return;
        }

        setBadgeUnlockAwards([]);
        setBadgeCelebrationIndex(0);
    }

    const activeBadgeAward = badgeUnlockAwards[badgeCelebrationIndex] ?? null;

    return (
        <AppScreenBackground>
            <KeyboardAwareScrollView
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

                {!levelUpDetails && activeBadgeAward ? (
                    <BadgeUnlockCelebration
                        award={activeBadgeAward}
                        position={badgeCelebrationIndex}
                        total={badgeUnlockAwards.length}
                        onContinue={handleCloseBadgeCelebration}
                    />
                ) : null}

                <ScreenHeader
                    eyebrow="SESSION REVIEW"
                    title={isQuestlessQuickFocus ? "Quick Focus" : (questTitle ?? (source === "tasks" ? "Untitled Task" : "Untitled Quest"))}
                    subtitle="Capture the progress while it is still fresh."
                    action={<View style={styles.sessionBadge}><Text style={styles.sessionLength}>{plannedMinutes ?? "0"} min</Text></View>}
                />

                <Animated.View entering={reduceMotion ? undefined : FadeInUp.duration(260)}>
                    {earnedXp !== null && totalXp !== null ? (
                        <ReviewResultCard
                        earnedXp={earnedXp}
                        totalXp={totalXp}
                        baseXp={awardedBaseXp}
                        bonusXp={awardedBonusXp}
                        badgeXp={awardedBadgeXp}
                        creditedFocusSeconds={awardedCreditedSeconds}
                        xpCreditStatus={xpCreditStatus}
                        reachedLevel={reachedLevel}
                        onReturnToJourneys={handleReturnToJourneys}
                        onViewHistory={handleViewHistory}
                        returnLabel={source === "quick-focus" ? "Return Home" : source === "tasks" ? "Return to Tasks" : undefined}
                        outcome={savedOutcome ?? undefined}
                        itemKind={isQuestlessQuickFocus ? undefined : source === "tasks" ? "Task" : "Quest"}
                        />
                    ) : (
                        <View style={styles.reviewSections}>
                        {earnsNoXp || isEndedEarly ? (
                            <View style={[styles.xpNotice, earnsNoXp ? styles.noXpNotice : styles.earlyXpNotice]}>
                                <Info size={18} color={earnsNoXp ? colours.warning : colours.primaryStrong} />
                                <View style={styles.xpNoticeCopy}>
                                    <Text style={styles.xpNoticeTitle}>{earnsNoXp ? "Short Focus Session" : "Your focused time still counts"}</Text>
                                    <Text style={styles.xpNoticeText}>{earnsNoXp ? "Focus for at least five complete minutes to earn XP. You can still save this session to History." : "You ended the timer early. Choose what actually happened—XP is based on the time you genuinely focused."}</Text>
                                </View>
                            </View>
                        ) : null}

                        <SessionOutcomeSelector
                            selectedOutcome={selectedOutcome}
                            onSelectOutcome={handleSelectOutcome}
                            isQuestlessQuickFocus={isQuestlessQuickFocus}
                            terminology={source === "tasks" ? "task" : "quest"}
                            isLocked={earnsNoXp}
                        />

                        <ReviewXpPreview
                            actualFocusedSeconds={reviewedSeconds}
                            selectedOutcome={selectedOutcome}
                            dailyCreditedSeconds={dailyCreditedSeconds}
                            serverTracked={serverTracked}
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
                            showAccomplishment={selectedOutcome !== "stopped"}
                            errorMessage={validationMessage}
                            onChangeAccomplishment={setAccomplishment}
                            isSubmitting={isSubmitting}
                            onSubmit={handleCompleteReview}
                        />
                        </View>
                    )}
                </Animated.View>
            </KeyboardAwareScrollView>
        </AppScreenBackground>
    );
}

function createStyles(colours: AppColours, gutter: number) {
    return StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: colours.background,
        },

        contentContainer: {
            width: "100%",
            maxWidth: 720,
            alignSelf: "center",
            paddingHorizontal: gutter,
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
