import { useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SessionOutcome = "completed" | "progressed" | "blocked" | "stopped";

type Quest = {
    id: string;
    title: string;
    status?: "active" | "completed";
    nextAction?: string;
    lastAccomplishment?: string;
};

type Journey = {
    id: string;
    title: string;
    status?: "active" | "completed";
};

type FocusSessionRecord = {
    id: string;
    journeyId: string;
    questId: string;
    questTitle: string;
    plannedMinutes: number;
    actualSeconds?: number;
    outcome: SessionOutcome;
    accomplishment: string;
    nextAction: string;
    earnedXp: number;
    completedAt: string;
};

const TOTAL_XP_STORAGE_KEY = "no-more-later-total-xp";
const FOCUS_SESSIONS_STORAGE_KEY = "no-more-later-focus-sessions";
const JOURNEYS_STORAGE_KEY = "no-more-later-journeys";
const STARTING_LEVEL_XP = 100;
const XP_INCREASE_PER_LEVEL = 25;

function getQuestsStorageKey(journeyId: string) {
    return `no-more-later-quests-${journeyId}`;
}

function calculateSessionXp(minutes: number, outcome: SessionOutcome, nextAction: string) {
    let totalXp = 0;

    totalXp += 5;

    if (outcome === "completed") {
        totalXp += 10;
    }

    if (outcome !== "completed" && nextAction.trim()) {
        totalXp += 5;
    }

    return totalXp;
}

function calculateLevel(totalXp: number) {
    let level = 1;
    let remainingXp = totalXp;
    let requiredXp = STARTING_LEVEL_XP;

    while (remainingXp >= requiredXp) {
        remainingXp -= requiredXp;
        level += 1;

        requiredXp = STARTING_LEVEL_XP + (level - 1) * XP_INCREASE_PER_LEVEL;
    }

    return level;
}

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

        if (!selectedOutcome) {
            setValidationMessage("Choose a session outcome.");
            return;
        }

        if (!trimmedAccomplishment) {
            setValidationMessage("Describe what you accomplished.");
            return;
        }

        if (selectedOutcome !== "completed" && !trimmedNextAction) {
            setValidationMessage("Add the next action.");
            return;
        }

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
            const storedTotalXp = await AsyncStorage.getItem(TOTAL_XP_STORAGE_KEY);

            const currentTotalXp = storedTotalXp ? Number(storedTotalXp) : 0;

            const updatedTotalXp = currentTotalXp + sessionXp;

            const previousLevel = calculateLevel(currentTotalXp);

            const updatedLevel = calculateLevel(updatedTotalXp);

            await AsyncStorage.setItem(TOTAL_XP_STORAGE_KEY, updatedTotalXp.toString());

            const questsStorageKey = getQuestsStorageKey(journeyId);

            const storedQuests = await AsyncStorage.getItem(questsStorageKey);

            const currentQuests: Quest[] = storedQuests ? JSON.parse(storedQuests) : [];

            const updatedQuests = currentQuests.map((quest) => {
                if (quest.id !== questId) {
                    return quest;
                }

                return {
                    ...quest,
                    status: selectedOutcome === "completed" ? "completed" : "active",
                    lastAccomplishment: trimmedAccomplishment,
                    nextAction: selectedOutcome === "completed" ? "" : trimmedNextAction,
                };
            });

            const allQuestsCompleted = updatedQuests.length > 0 && updatedQuests.every((quest) => quest.status === "completed");

            await AsyncStorage.setItem(questsStorageKey, JSON.stringify(updatedQuests));

            const storedJourneys = await AsyncStorage.getItem(JOURNEYS_STORAGE_KEY);

            const currentJourneys: Journey[] = storedJourneys ? JSON.parse(storedJourneys) : [];

            const updatedJourneys = currentJourneys.map((journey) => {
                if (journey.id !== journeyId) {
                    return journey;
                }

                return {
                    ...journey,
                    status: allQuestsCompleted ? "completed" : "active",
                };
            });

            await AsyncStorage.setItem(JOURNEYS_STORAGE_KEY, JSON.stringify(updatedJourneys));

            const storedSessions = await AsyncStorage.getItem(FOCUS_SESSIONS_STORAGE_KEY);

            const currentSessions: FocusSessionRecord[] = storedSessions ? JSON.parse(storedSessions) : [];

            const updatedSessions = [newSessionRecord, ...currentSessions];

            await AsyncStorage.setItem(FOCUS_SESSIONS_STORAGE_KEY, JSON.stringify(updatedSessions));

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

            <View style={styles.outcomeList}>
                <Pressable
                    style={[styles.outcomeButton, selectedOutcome === "completed" && styles.selectedOutcomeButton]}
                    onPress={() => setSelectedOutcome("completed")}
                >
                    <Text style={[styles.outcomeText, selectedOutcome === "completed" && styles.selectedOutcomeText]}>Quest completed</Text>
                </Pressable>

                <Pressable
                    style={[styles.outcomeButton, selectedOutcome === "progressed" && styles.selectedOutcomeButton]}
                    onPress={() => setSelectedOutcome("progressed")}
                >
                    <Text style={[styles.outcomeText, selectedOutcome === "progressed" && styles.selectedOutcomeText]}>Made progress</Text>
                </Pressable>

                <Pressable
                    style={[styles.outcomeButton, selectedOutcome === "blocked" && styles.selectedOutcomeButton]}
                    onPress={() => setSelectedOutcome("blocked")}
                >
                    <Text style={[styles.outcomeText, selectedOutcome === "blocked" && styles.selectedOutcomeText]}>Got blocked</Text>
                </Pressable>

                <Pressable
                    style={[styles.outcomeButton, selectedOutcome === "stopped" && styles.selectedOutcomeButton]}
                    onPress={() => setSelectedOutcome("stopped")}
                >
                    <Text style={[styles.outcomeText, selectedOutcome === "stopped" && styles.selectedOutcomeText]}>Stopped early</Text>
                </Pressable>
            </View>

            <Text style={styles.inputLabel}>What did you accomplish?</Text>

            <TextInput
                style={styles.textArea}
                placeholder="Describe what you worked on..."
                value={accomplishment}
                onChangeText={setAccomplishment}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
            />

            <Text style={styles.inputLabel}>What should happen next?</Text>

            <TextInput
                style={styles.textArea}
                placeholder="Write the exact next step..."
                value={nextAction}
                onChangeText={setNextAction}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
            />

            {validationMessage && <Text style={styles.validationMessage}>{validationMessage}</Text>}

            <Pressable
                style={[styles.completeButton, (isSubmitting || earnedXp !== null) && styles.disabledButton]}
                onPress={handleCompleteReview}
                disabled={isSubmitting || earnedXp !== null}
            >
                <Text style={styles.completeButtonText}>{isSubmitting ? "Saving..." : earnedXp !== null ? "Review Completed" : "Complete Review"}</Text>
            </Pressable>

            {earnedXp !== null && (
                <View style={styles.rewardContainer}>
                    <Text style={styles.rewardTitle}>Review complete!</Text>

                    <Text style={styles.rewardXp}>+{earnedXp} XP</Text>

                    {totalXp !== null && <Text style={styles.totalXp}>Total XP: {totalXp}</Text>}

                    {reachedLevel !== null && (
                        <View style={styles.levelUpContainer}>
                            <Text style={styles.levelUpTitle}>Level Up!</Text>

                            <Text style={styles.levelUpText}>You reached Level {reachedLevel}</Text>
                        </View>
                    )}

                    <Pressable style={styles.returnButton} onPress={handleReturnToJourneys}>
                        <Text style={styles.returnButtonText}>Return to Journeys</Text>
                    </Pressable>

                    <Pressable style={styles.historyButton} onPress={handleViewHistory}>
                        <Text style={styles.historyButtonText}>View Session History</Text>
                    </Pressable>
                </View>
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
    description: {
        marginTop: 32,
        fontSize: 16,
    },
    idText: {
        marginTop: 24,
        fontSize: 12,
        color: "#666666",
    },
    sectionTitle: {
        marginTop: 32,
        marginBottom: 12,
        fontSize: 18,
        fontWeight: "600",
    },
    outcomeList: {
        gap: 12,
    },
    outcomeButton: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: "#cccccc",
        borderRadius: 8,
        backgroundColor: "#ffffff",
    },
    selectedOutcomeButton: {
        borderColor: "#222222",
        backgroundColor: "#222222",
    },
    outcomeText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#222222",
    },
    selectedOutcomeText: {
        color: "#ffffff",
    },
    inputLabel: {
        marginTop: 24,
        marginBottom: 8,
        fontSize: 16,
        fontWeight: "600",
    },
    textArea: {
        minHeight: 100,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "#cccccc",
        borderRadius: 8,
        backgroundColor: "#ffffff",
        fontSize: 16,
    },
    validationMessage: {
        marginTop: 16,
        fontSize: 14,
        color: "#b42318",
    },
    completeButton: {
        marginTop: 24,
        paddingVertical: 16,
        borderRadius: 8,
        backgroundColor: "#222222",
        alignItems: "center",
    },
    completeButtonText: {
        fontSize: 17,
        fontWeight: "600",
        color: "#ffffff",
    },
    rewardContainer: {
        marginTop: 24,
        padding: 20,
        borderRadius: 8,
        backgroundColor: "#ffffff",
        alignItems: "center",
    },
    rewardTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    rewardXp: {
        marginTop: 8,
        fontSize: 32,
        fontWeight: "700",
    },
    disabledButton: {
        opacity: 0.5,
    },
    totalXp: {
        marginTop: 8,
        fontSize: 16,
        color: "#666666",
    },
    returnButton: {
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: "#222222",
        alignItems: "center",
    },
    returnButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#ffffff",
    },
    historyButton: {
        marginTop: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: "center",
    },
    historyButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#222222",
    },
    levelUpContainer: {
        marginTop: 18,
        padding: 16,
        borderRadius: 10,
        backgroundColor: "#f0f0f0",
        alignItems: "center",
    },
    levelUpTitle: {
        fontSize: 21,
        fontWeight: "700",
    },
    levelUpText: {
        marginTop: 4,
        fontSize: 15,
        color: "#555555",
    },
});
