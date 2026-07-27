import { useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, ScrollView } from "react-native";

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
    const [accomplishment, setAccomplishment] = useState("");
    const [nextAction, setNextAction] = useState("");
    const [validationMessage, setValidationMessage] = useState("");
    const [earnedXp, setEarnedXp] = useState<number | null>(null);
    const [totalXp, setTotalXp] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reachedLevel, setReachedLevel] = useState<number | null>(null);

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

        setValidationMessage("");
        setIsSubmitting(true);

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

        try {
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

            setEarnedXp(sessionXp);
            setTotalXp(updatedTotalXp);

            if (updatedLevel > previousLevel) {
                setReachedLevel(updatedLevel);
            } else {
                setReachedLevel(null);
            }

            console.log({
                journeyId,
                questId,
                questTitle,
                plannedMinutes,
                outcome: selectedOutcome,
                accomplishment: trimmedAccomplishment,
                nextAction: trimmedNextAction,
                earnedXp: sessionXp,
                totalXp: updatedTotalXp,
            });
        } catch (error) {
            console.error("Failed to save XP:", error);
            setValidationMessage("Could not save your XP. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const showNextAction = selectedOutcome !== null && selectedOutcome !== "completed";

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
            <Stack.Screen
                options={{
                    title: "Session Review",
                }}
            />

            <Text style={styles.label}>Quest</Text>

            <Text style={styles.title}>{questTitle ?? "Untitled Quest"}</Text>

            <Text style={styles.sessionLength}>{plannedMinutes ?? "0"} minute session</Text>

            <Text style={styles.sectionTitle}>How did the session go?</Text>

            <SessionOutcomeSelector selectedOutcome={selectedOutcome} onSelectOutcome={setSelectedOutcome} />

            <ReviewForm
                accomplishment={accomplishment}
                nextAction={nextAction}
                showNextAction={showNextAction}
                errorMessage={validationMessage}
                onChangeAccomplishment={setAccomplishment}
                onChangeNextAction={setNextAction}
                onSubmit={handleCompleteReview}
            />

            {earnedXp !== null && totalXp !== null && (
                <ReviewResultCard
                    earnedXp={earnedXp}
                    totalXp={totalXp}
                    reachedLevel={reachedLevel}
                    onReturnToJourneys={handleReturnToJourneys}
                    onViewHistory={handleViewHistory}
                />
            )}

            {/* <Text style={styles.idText}>Quest ID: {questId}</Text> */}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    contentContainer: {
        padding: 24,
        paddingBottom: 48,
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
    sessionLength: {
        marginTop: 8,
        fontSize: 16,
        color: "#666666",
    },
    sectionTitle: {
        marginTop: 32,
        marginBottom: 12,
        fontSize: 18,
        fontWeight: "600",
    },
});
