import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pressable, StyleSheet, Text, TextInput, View, ScrollView } from "react-native";

import type { Journey, Quest } from "../../types/models";
import { JOURNEYS_STORAGE_KEY, getQuestsStorageKey } from "../../constants/storageKeys";
import { getJourneys, saveJourneys } from "../../services/storage/journeysStorage";
import { getQuests, saveQuests } from "../../services/storage/questsStorage";
import { QuestCard } from "../../components/journeys/QuestCard";
import { JourneyProgressCard } from "../../components/journeys/JourneyProgressCard";
import { AddQuestForm } from "../../components/journeys/AddQuestForm";

export default function JourneyDetailsScreen() {
    const router = useRouter();

    const { id, title } = useLocalSearchParams<{ id: string; title?: string }>();
    const [questTitle, setQuestTitle] = useState("");
    const [quests, setQuests] = useState<Quest[]>([]);

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

    const journeyProgressPercentage = totalQuestCount > 0 ? (completedQuestCount / totalQuestCount) * 100 : 0;

    async function handleAddQuest() {
        const trimmedTitle = questTitle.trim();

        if (!trimmedTitle) {
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

            setQuests(updatedQuests);
        } catch (error) {
            console.error("Failed to delete Quest:", error);
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

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: title ?? "Journey" }} />

            <Text style={styles.title}>{title ?? "Journey"}</Text>

            <Text style={styles.description}>Quests for this Journey will appear here.</Text>

            <JourneyProgressCard totalQuestCount={totalQuestCount} completedQuestCount={completedQuestCount} />

            <AddQuestForm questTitle={questTitle} onChangeQuestTitle={setQuestTitle} onAddQuest={handleAddQuest} />

            <View style={styles.questList}>
                {quests.map((quest) => (
                    <QuestCard
                        key={quest.id}
                        quest={quest}
                        onStartSession={() => handleOpenQuest(quest)}
                        onReopenQuest={() => handleReopenQuest(quest.id)}
                        onDeleteQuest={() => handleDeleteQuest(quest.id)}
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
});
