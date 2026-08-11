import { useState, useEffect } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, ScrollView, View, Pressable } from "react-native";

import { calculateLevel } from "../../utils/level";
import type { SessionOutcome, FocusSessionRecord } from "../../types/models";
import { addFocusSession } from "../../services/storage/focusSessionsStorage";
import { getTotalXp, saveTotalXp } from "../../services/storage/xpStorage";
import { SessionOutcomeSelector } from "../../components/review/SessionOutcomeSelector";
import { ReviewResultCard } from "../../components/review/ReviewResultCard";
import { ReviewForm } from "../../components/review/ReviewForm";
import { calculateSessionXp } from "../../utils/sessionXp";
import { getReviewValidationMessage } from "../../utils/reviewValidation";
import { updateReviewProgress } from "../../services/reviewProgressService";
import { clearActiveFocusSession } from "../../services/storage/activeFocusSessionStorage";
import { colours, radius, spacing } from "@/constants/design";
import { getQuests } from "../../services/storage/questsStorage";

export default function ReviewSessionScreen() {
    const router = useRouter();

    const { questId, questTitle, journeyId, plannedMinutes, actualSeconds, endedEarly } = useLocalSearchParams<{
        questId: string;
        questTitle?: string;
        journeyId: string;
        plannedMinutes?: string;
        actualSeconds?: string;
        endedEarly?: string;
    }>();

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

    useEffect(() => {
        async function loadQuest() {
            const quests = await getQuests(journeyId);

            const quest = quests.find((quest) => quest.id === questId);

            setQuestDoneWhen(quest?.doneWhen?.trim() || null);
        }

        loadQuest();
    }, [journeyId, questId]);

    function handleReturnToJourneys() {
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

        setValidationMessage("");
        setIsSubmitting(true);

        try {
            const sessionMinutes = Number(plannedMinutes ?? 0);

            const focusedSeconds = Number(actualSeconds ?? sessionMinutes * 60);

            const sessionXp = calculateSessionXp(sessionMinutes, selectedOutcome, trimmedNextAction);

            const completedAt = new Date().toISOString();

            const newSessionRecord: FocusSessionRecord = {
                id: Date.now().toString(),
                journeyId,
                questId,
                questTitle: questTitle ?? "Untitled Quest",
                plannedMinutes: sessionMinutes,
                actualSeconds: focusedSeconds,
                outcome: selectedOutcome,
                accomplishment: trimmedAccomplishment,
                nextAction: trimmedNextAction,
                earnedXp: sessionXp,
                completedAt,
            };

            const currentTotalXp = await getTotalXp();

            const updatedTotalXp = currentTotalXp + sessionXp;

            const previousLevel = calculateLevel(currentTotalXp);

            const updatedLevel = calculateLevel(updatedTotalXp);

            await saveTotalXp(updatedTotalXp);

            await updateReviewProgress({
                journeyId,
                questId,
                outcome: selectedOutcome,
                accomplishment: trimmedAccomplishment,
                nextAction: trimmedNextAction,
            });

            await addFocusSession(newSessionRecord);

            await clearActiveFocusSession();

            setEarnedXp(sessionXp);
            setTotalXp(updatedTotalXp);

            if (updatedLevel > previousLevel) {
                setReachedLevel(updatedLevel);
            } else {
                setReachedLevel(null);
            }
        } catch (error) {
            console.error("Failed to complete Review:", error);

            setValidationMessage("Could not save your Review. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const showNextAction = selectedOutcome !== null && selectedOutcome !== "completed";

    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            <Stack.Screen
                options={{
                    title: "Review",
                }}
            />

            <View style={styles.header}>
                <Text style={styles.label}>SESSION REVIEW</Text>

                <Text style={styles.title}>{questTitle ?? "Untitled Quest"}</Text>

                <View style={styles.sessionBadge}>
                    <Text style={styles.sessionLength}>{plannedMinutes ?? "0"} minute Focus Session</Text>
                </View>
            </View>

            {earnedXp !== null && totalXp !== null ? (
                <ReviewResultCard
                    earnedXp={earnedXp}
                    totalXp={totalXp}
                    reachedLevel={reachedLevel}
                    onReturnToJourneys={handleReturnToJourneys}
                    onViewHistory={handleViewHistory}
                />
            ) : (
                <View style={styles.reviewSections}>
                    <SessionOutcomeSelector selectedOutcome={selectedOutcome} onSelectOutcome={setSelectedOutcome} />

                    {selectedOutcome === "completed" && questDoneWhen && (
                        <View style={styles.finishLineCard}>
                            <Text style={styles.finishLineLabel}>YOUR FINISH LINE</Text>

                            <Text style={styles.finishLineDescription}>You said this Quest would be complete when:</Text>

                            <Text style={styles.finishLineText}>{questDoneWhen}</Text>

                            <Pressable style={styles.confirmationRow} onPress={() => setFinishLineConfirmed((currentValue) => !currentValue)}>
                                <View style={[styles.checkbox, finishLineConfirmed && styles.checkboxConfirmed]}>
                                    {finishLineConfirmed && <Text style={styles.checkmark}>✓</Text>}
                                </View>

                                <Text style={styles.confirmationText}>I genuinely met this finish line.</Text>
                            </Pressable>
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
    );
}

const styles = StyleSheet.create({
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

    header: {
        width: "100%",
        marginBottom: spacing.xl,
    },

    label: {
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 0.8,
        color: colours.primary,
    },

    title: {
        marginTop: spacing.sm,
        fontSize: 30,
        lineHeight: 36,
        fontWeight: "800",
        color: colours.text,
    },

    sessionBadge: {
        alignSelf: "flex-start",
        marginTop: spacing.md,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: radius.pill,
        backgroundColor: colours.primarySoft,
    },

    sessionLength: {
        fontSize: 13,
        fontWeight: "700",
        color: colours.primary,
    },

    reviewSections: {
        width: "100%",
        gap: spacing.xl,
    },
    finishLineCard: {
        width: "100%",
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colours.primaryBorder,
        borderRadius: radius.lg,
        backgroundColor: colours.primarySoft,
    },

    finishLineLabel: {
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 0.8,
        color: colours.primary,
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
        color: colours.surface,
    },

    confirmationText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: "600",
        color: colours.text,
    },
});
