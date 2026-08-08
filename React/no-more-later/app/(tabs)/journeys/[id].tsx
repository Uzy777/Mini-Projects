import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";

import type { Quest } from "../../../types/models";
import { getJourneys, saveJourneys } from "../../../services/storage/journeysStorage";
import { getQuests, saveQuests } from "../../../services/storage/questsStorage";
import { QuestCard } from "../../../components/journeys/QuestCard";
import { JourneyProgressCard } from "../../../components/journeys/JourneyProgressCard";
import { AddQuestForm } from "../../../components/journeys/AddQuestForm";
import { confirmDelete } from "../../../utils/confirmDelete";
import { getActiveFocusSession } from "../../../services/storage/activeFocusSessionStorage";
import { showMessage } from "../../../utils/showMessage";
import { syncJourneyStatusFromQuests } from "../../../services/journeyStatusService";
import { colours, radius, spacing } from "@/constants/design";

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
        <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {" "}
            <Stack.Screen options={{ title: "Journey" }} />
            <View style={styles.pageHeader}>
                <Text style={styles.title}>{title ?? "Journey"}</Text>

                <Text style={styles.description}>Break this Journey into small Quests and keep moving forward.</Text>
            </View>
            <JourneyProgressCard totalQuestCount={totalQuestCount} completedQuestCount={completedQuestCount} />
            <AddQuestForm questTitle={questTitle} onChangeQuestTitle={setQuestTitle} onAddQuest={handleAddQuest} />
            <View style={styles.filterContainer}>
                {" "}
                {questFilters.map((filter) => {
                    const isSelected = selectedQuestFilter === filter.value;

                    return (
                        <Pressable
                            key={filter.value}
                            style={({ pressed }) => [
                                styles.filterButton,
                                isSelected && styles.filterButtonSelected,
                                pressed && !isSelected && styles.filterButtonPressed,
                            ]}
                            onPress={() => setSelectedQuestFilter(filter.value)}
                        >
                            <Text style={[styles.filterButtonText, isSelected && styles.filterButtonTextSelected]}>{filter.label}</Text>
                        </Pressable>
                    );
                })}
            </View>
            <View style={styles.questList}>
                {quests.length === 0 ? (
                    <Text style={styles.emptyText}>No Quests yet.</Text>
                ) : filteredQuests.length === 0 ? (
                    <Text style={styles.emptyText}>{selectedQuestFilter === "completed" ? "No completed Quests." : "No active Quests."}</Text>
                ) : (
                    filteredQuests.map((quest) => (
                        <QuestCard
                            key={quest.id}
                            quest={quest}
                            onStartSession={() => handleOpenQuest(quest)}
                            onReopenQuest={() => handleReopenQuest(quest.id)}
                            onDeleteQuest={() => {
                                void handleRequestDeleteQuest(quest);
                            }}
                        />
                    ))
                )}
            </View>
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

    pageHeader: {
        marginBottom: spacing.lg,
    },

    title: {
        fontSize: 30,
        lineHeight: 36,
        fontWeight: "800",
        color: colours.text,
    },

    description: {
        marginTop: spacing.sm,
        fontSize: 15,
        lineHeight: 22,
        color: colours.textMuted,
    },

    filterContainer: {
        width: "100%",
        flexDirection: "row",
        gap: spacing.xs,
        marginTop: spacing.lg,
        padding: spacing.xs,
        borderWidth: 1,
        borderColor: colours.border,
        borderRadius: radius.md,
        backgroundColor: colours.surface,
    },

    filterButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.sm,
    },

    filterButtonPressed: {
        backgroundColor: colours.background,
    },

    filterButtonSelected: {
        backgroundColor: colours.primary,
    },

    filterButtonText: {
        fontSize: 13,
        fontWeight: "700",
        color: colours.textMuted,
    },

    filterButtonTextSelected: {
        color: colours.surface,
    },

    questList: {
        marginTop: spacing.md,
        gap: spacing.md,
    },

    emptyText: {
        paddingVertical: spacing.xl,
        textAlign: "center",
        fontSize: 15,
        lineHeight: 22,
        color: colours.textMuted,
    },
});
