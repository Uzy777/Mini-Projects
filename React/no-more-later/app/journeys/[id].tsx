import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";

import type { Journey, Quest } from "../../types/models";
import { getJourneys, saveJourneys } from "../../services/storage/journeysStorage";
import { getQuests, saveQuests } from "../../services/storage/questsStorage";
import { QuestCard } from "../../components/journeys/QuestCard";
import { JourneyProgressCard } from "../../components/journeys/JourneyProgressCard";
import { AddQuestForm } from "../../components/journeys/AddQuestForm";
import { confirmDelete } from "../../utils/confirmDelete";
import { getActiveFocusSession } from "../../services/storage/activeFocusSessionStorage";
import { showMessage } from "../../utils/showMessage";
import { syncJourneyStatusFromQuests } from "../../services/journeyStatusService";

type QuestFilter = "all" | "active" | "completed";

const questFilters: {
    label: string;
    value: QuestFilter;
}[] = [
    {
        label: "All",
        value: "all",
    },
    {
        label: "Active",
        value: "active",
    },
    {
        label: "Completed",
        value: "completed",
    },
];

export default function JourneyDetailsScreen() {
    const router = useRouter();

    const { id, title } = useLocalSearchParams<{ id: string; title?: string }>();
    const [questTitle, setQuestTitle] = useState("");
    const [quests, setQuests] = useState<Quest[]>([]);
    const [selectedQuestFilter, setSelectedQuestFilter] = useState<QuestFilter>("all");

    useFocusEffect(
        useCallback(() => {
            async function loadQuests() {
                try {
                    const currentQuests = await getQuests(id);

                    setQuests(currentQuests);
                } catch (error) {
                    console.error("Failed to load Quests:", error);
                }
            }

            loadQuests();
        }, [id]),
    );

    const totalQuestCount = quests.length;

    const completedQuestCount = quests.filter((quest) => quest.status === "completed").length;

    async function handleAddQuest() {
        const trimmedTitle = questTitle.trim();

        if (!trimmedTitle) {
            return;
        }

        const normalisedTitle = trimmedTitle.toLowerCase();

        const questAlreadyExists = quests.some((quest) => quest.title.trim().toLowerCase() === normalisedTitle);

        if (questAlreadyExists) {
            showMessage("Quest already exists", `A Quest named "${trimmedTitle}" already exists in this Journey.`);

            return;
        }

        const newQuest: Quest = {
            id: Date.now().toString(),
            title: trimmedTitle,
            status: "active",
        };

        const updatedQuests = [...quests, newQuest];

        try {
            await saveQuests(id, updatedQuests);

            const currentJourneys = await getJourneys();

            const updatedJourneys = currentJourneys.map((journey) => {
                if (journey.id !== id) {
                    return journey;
                }

                return {
                    ...journey,
                    status: "active" as const,
                };
            });

            await saveJourneys(updatedJourneys);

            setQuests(updatedQuests);
            setQuestTitle("");
        } catch (error) {
            console.error("Failed to save Quest:", error);
        }
    }

    async function handleDeleteQuest(questId: string) {
        const updatedQuests = quests.filter((quest) => quest.id !== questId);

        try {
            await saveQuests(id, updatedQuests);

            await syncJourneyStatusFromQuests(id, updatedQuests);

            setQuests(updatedQuests);
        } catch (error) {
            console.error("Failed to delete Quest:", error);
        }
    }

    async function handleRequestDeleteQuest(quest: Quest) {
        try {
            const activeSession = await getActiveFocusSession();

            const questHasActiveSession = activeSession?.questId === quest.id;

            if (questHasActiveSession) {
                showMessage("Quest has an active session", `End or review the Focus Session for "${quest.title}" before deleting this Quest.`);

                return;
            }

            confirmDelete({
                title: "Delete Quest?",
                message: `Are you sure you want to delete "${quest.title}"?`,
                onConfirm: () => {
                    void handleDeleteQuest(quest.id);
                },
            });
        } catch (error) {
            console.error("Failed to check active Focus Session:", error);

            showMessage("Quest could not be deleted", "The active Focus Session could not be checked. Please try again.");
        }
    }

    function handleOpenQuest(quest: Quest) {
        if (quest.status === "completed") {
            return;
        }

        router.push({
            pathname: "/focus/[questId]",
            params: {
                questId: quest.id,
                questTitle: quest.title,
                journeyId: id,
            },
        });
    }

    async function handleReopenQuest(questId: string) {
        const updatedQuests = quests.map((quest) => {
            if (quest.id !== questId) {
                return quest;
            }

            return {
                ...quest,
                status: "active" as const,
            };
        });

        try {
            await saveQuests(id, updatedQuests);

            const currentJourneys = await getJourneys();

            const updatedJourneys = currentJourneys.map((journey) => {
                if (journey.id !== id) {
                    return journey;
                }

                return {
                    ...journey,
                    status: "active" as const,
                };
            });

            await saveJourneys(updatedJourneys);

            setQuests(updatedQuests);
        } catch (error) {
            console.error("Failed to reopen Quest:", error);
        }
    }

    const filteredQuests = quests.filter((quest) => {
        if (selectedQuestFilter === "all") {
            return true;
        }

        const questStatus = quest.status ?? "active";

        return questStatus === selectedQuestFilter;
    });

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: title ?? "Journey" }} />

            <Text style={styles.title}>{title ?? "Journey"}</Text>

            <Text style={styles.description}>Quests for this Journey will appear here.</Text>

            <JourneyProgressCard totalQuestCount={totalQuestCount} completedQuestCount={completedQuestCount} />

            <AddQuestForm questTitle={questTitle} onChangeQuestTitle={setQuestTitle} onAddQuest={handleAddQuest} />

            <View style={styles.filterRow}>
                {questFilters.map((filter) => {
                    const isSelected = selectedQuestFilter === filter.value;

                    return (
                        <Pressable
                            key={filter.value}
                            style={[styles.filterButton, isSelected && styles.filterButtonSelected]}
                            onPress={() => setSelectedQuestFilter(filter.value)}
                        >
                            <Text style={[styles.filterButtonText, isSelected && styles.filterButtonTextSelected]}>{filter.label}</Text>
                        </Pressable>
                    );
                })}
            </View>

            <View style={styles.questList}>
                {filteredQuests.map((quest) => (
                    <QuestCard
                        key={quest.id}
                        quest={quest}
                        onStartSession={() => handleOpenQuest(quest)}
                        onReopenQuest={() => handleReopenQuest(quest.id)}
                        onDeleteQuest={() => {
                            void handleRequestDeleteQuest(quest);
                        }}
                    />
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: "#f5f5f5",
    },
    title: {
        marginTop: 24,
        marginBottom: 8,
        fontSize: 32,
        fontWeight: "700",
    },
    description: {
        fontSize: 16,
    },
    questList: {
        marginTop: 24,
        gap: 12,
    },
    filterRow: {
        flexDirection: "row",
        gap: 8,
        marginVertical: 16,
    },

    filterButton: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#d4d4d4",
        borderRadius: 10,
        backgroundColor: "#ffffff",
    },

    filterButtonSelected: {
        backgroundColor: "#171717",
        borderColor: "#171717",
    },

    filterButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#525252",
    },

    filterButtonTextSelected: {
        color: "#ffffff",
    },
});
