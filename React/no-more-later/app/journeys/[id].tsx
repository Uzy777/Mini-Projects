import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Quest = {
    id: string;
    title: string;
    status?: "active" | "completed";
    nextAction?: string;
    lastAccomplishment?: string;
};

function getQuestsStorageKey(journeyId: string) {
    return `no-more-later-quests-${journeyId}`;
}

export default function JourneyDetailsScreen() {
    const router = useRouter();

    const { id, title } = useLocalSearchParams<{ id: string; title?: string }>();
    const [questTitle, setQuestTitle] = useState("");
    const [quests, setQuests] = useState<Quest[]>([]);

    useFocusEffect(
        useCallback(() => {
            async function loadQuests() {
                try {
                    const storedQuests = await AsyncStorage.getItem(getQuestsStorageKey(id));

                    const parsedQuests: Quest[] = storedQuests ? JSON.parse(storedQuests) : [];

                    setQuests(parsedQuests);
                } catch (error) {
                    console.error("Failed to load Quests:", error);
                }
            }

            loadQuests();
        }, [id]),
    );

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
            await AsyncStorage.setItem(getQuestsStorageKey(id), JSON.stringify(updatedQuests));

            setQuests(updatedQuests);
            setQuestTitle("");
        } catch (error) {
            console.error("Failed to save Quest:", error);
        }
    }

    async function handleDeleteQuest(questId: string) {
        const updatedQuests = quests.filter((quest) => quest.id !== questId);

        try {
            await AsyncStorage.setItem(getQuestsStorageKey(id), JSON.stringify(updatedQuests));

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

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: title ?? "Journey" }} />

            <Text style={styles.title}>{title ?? "Journey"}</Text>

            <Text style={styles.description}>Quests for this Journey will appear here.</Text>

            <TextInput style={styles.input} placeholder="What needs to be done?" value={questTitle} onChangeText={setQuestTitle} />

            <Pressable style={styles.addButton} onPress={handleAddQuest}>
                <Text style={styles.addButtonText}>Add Quest</Text>
            </Pressable>

            <View style={styles.questList}>
                {quests.map((quest) => (
                    <View key={quest.id} style={[styles.questCard, quest.status === "completed" && styles.completedQuestCard]}>
                        {/* <Pressable style={styles.deleteButton} onPress={() => handleDeleteQuest(quest.id)}>
                            <Text style={styles.deleteText}>Delete Quest</Text>
                        </Pressable> */}

                        <View style={styles.questHeader}>
                            <Text style={styles.questTitle}>{quest.title}</Text>

                            <View style={styles.questActions}>
                                <Text style={[styles.statusText, quest.status === "completed" && styles.completedStatusText]}>
                                    {quest.status === "completed" ? "Completed" : "Active"}
                                </Text>

                                <Pressable style={styles.deleteButton} onPress={() => handleDeleteQuest(quest.id)}>
                                    <Text style={styles.deleteText}>Delete Quest</Text>
                                </Pressable>
                            </View>
                        </View>

                        {quest.lastAccomplishment && <Text style={styles.progressText}>Last session: {quest.lastAccomplishment}</Text>}

                        {quest.status !== "completed" && quest.nextAction && <Text style={styles.nextActionText}>Next action: {quest.nextAction}</Text>}

                        {quest.status !== "completed" && (
                            <Pressable style={styles.startButton} onPress={() => handleOpenQuest(quest)}>
                                <Text style={styles.startButtonText}>Start Session</Text>
                            </Pressable>
                        )}
                    </View>
                ))}
            </View>
        </View>
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
    idText: {
        marginTop: 24,
        fontSize: 12,
        color: "#666666",
    },
    input: {
        marginTop: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "#cccccc",
        borderRadius: 8,
        backgroundColor: "#ffffff",
        fontSize: 16,
    },
    addButton: {
        marginTop: 12,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: "#222222",
        alignItems: "center",
    },
    addButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
    questList: {
        marginTop: 24,
        gap: 12,
    },
    questCard: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: "#ffffff",
    },
    questTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: "600",
    },
    startText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: "600",
        color: "#555555",
    },
    completedQuestCard: {
        opacity: 0.7,
    },
    questHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    statusText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#666666",
    },
    completedStatusText: {
        color: "#2f7d32",
    },
    progressText: {
        marginTop: 12,
        fontSize: 14,
        color: "#555555",
    },
    nextActionText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: "600",
    },
    startButton: {
        marginTop: 16,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#222222",
        alignItems: "center",
    },
    startButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#ffffff",
    },
    deleteButton: {
        marginTop: 12,
        paddingVertical: 10,
        alignItems: "center",
    },
    deleteText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#b42318",
    },
    questActions: {
        alignItems: "flex-end",
        gap: 6,
    },
});
