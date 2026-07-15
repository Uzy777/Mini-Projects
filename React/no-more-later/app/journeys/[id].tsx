import { Stack, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Quest = {
    id: string;
    title: string;
};

function getQuestsStorageKey(journeyId: string) {
    return `no-more-later-quests-${journeyId}`;
}

export default function JourneyDetailsScreen() {
    const { id, title } = useLocalSearchParams<{ id: string; title?: string }>();
    const [questTitle, setQuestTitle] = useState("");
    const [quests, setQuests] = useState<Quest[]>([]);

    useEffect(() => {
        async function loadQuests() {
            try {
                const storedQuests = await AsyncStorage.getItem(getQuestsStorageKey(id));

                if (storedQuests) {
                    const parsedQuests: Quest[] = JSON.parse(storedQuests);

                    setQuests(parsedQuests);
                }
            } catch (error) {
                console.error("Failed to load Quests:", error);
            }
        }

        loadQuests();
    }, [id]);

    async function handleAddQuest() {
        const trimmedTitle = questTitle.trim();

        if (!trimmedTitle) {
            return;
        }

        const newQuest: Quest = {
            id: Date.now().toString(),
            title: trimmedTitle,
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
                    <View key={quest.id} style={styles.questCard}>
                        <Text style={styles.questTitle}>{quest.title}</Text>
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
        fontSize: 17,
        fontWeight: "600",
    },
});
