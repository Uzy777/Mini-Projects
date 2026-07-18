import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pressable, StyleSheet, Text, TextInput, View, ScrollView } from "react-native";

type Journey = {
    id: string;
    title: string;
};

const JOURNEYS_STORAGE_KEY = "no-more-later-journeys";

export default function JourneyScreen() {
    const router = useRouter();

    const [journeyTitle, setJourneyTitle] = useState("");
    const [journeys, setJourneys] = useState<Journey[]>([]);

    useEffect(() => {
        async function loadJourneys() {
            try {
                const storedJourneys = await AsyncStorage.getItem(JOURNEYS_STORAGE_KEY);

                if (storedJourneys) {
                    const parsedJourneys: Journey[] = JSON.parse(storedJourneys);

                    setJourneys(parsedJourneys);
                }
            } catch (error) {
                console.error("Failed to load Journeys:", error);
            }
        }

        loadJourneys();
    }, []);

    async function handleAddJourney() {
        const trimmedTitle = journeyTitle.trim();

        if (!trimmedTitle) {
            return;
        }

        const newJourney: Journey = {
            id: Date.now().toString(),
            title: trimmedTitle,
        };

        // setJourneys((currentJourneys) => [...currentJourneys, newJourney]);

        const updatedJourneys = [...journeys, newJourney];

        try {
            await AsyncStorage.setItem(JOURNEYS_STORAGE_KEY, JSON.stringify(updatedJourneys));

            setJourneys(updatedJourneys);
            setJourneyTitle("");
        } catch (error) {
            console.error("Failed to save Journey:", error);
        }
    }

    async function handleDeleteJourney(journeyId: string) {
        const updatedJourneys = journeys.filter((journey) => journey.id !== journeyId);

        try {
            await AsyncStorage.setItem(JOURNEYS_STORAGE_KEY, JSON.stringify(updatedJourneys));
            setJourneys(updatedJourneys);
        } catch (error) {
            console.error("Failed to delete Journey:", error);
        }
    }

    function handleOpenJourney(journey: Journey) {
        router.push({ pathname: "/journeys/[id]", params: { id: journey.id, title: journey.title } });
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Journeys</Text>

            <Text style={styles.description}>Your larger goals and projects will appear here.</Text>

            <TextInput style={styles.input} placeholder="For example, organise the house" value={journeyTitle} onChangeText={setJourneyTitle} />

            <Pressable style={styles.addButton} onPress={handleAddJourney}>
                <Text style={styles.addButtonText}>Add Journey</Text>
            </Pressable>

            <View style={styles.journeyList}>
                {journeys.map((journey) => (
                    <View key={journey.id} style={styles.journeyCard}>
                        <Pressable style={styles.journeyContent} onPress={() => handleOpenJourney(journey)}>
                            <Text style={styles.journeyTitle}>{journey.title}</Text>
                        </Pressable>
                        <Pressable onPress={() => handleDeleteJourney(journey.id)}>
                            <Text style={styles.deleteText}>Delete</Text>
                        </Pressable>
                    </View>
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
        fontSize: 32,
        fontWeight: "700",
        marginTop: 48,
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
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
    journeyList: {
        marginTop: 24,
        gap: 12,
    },
    journeyCard: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: "#ffffff",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    journeyTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    deleteText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#b42318",
    },
    journeyContent: {},
});
