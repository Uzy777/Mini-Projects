import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Journey = {
    id: string;
    title: string;
};

export default function JourneyScreen() {
    const [journeyTitle, setJourneyTitle] = useState("");
    const [journeys, setJourneys] = useState<Journey[]>([]);

    function handleAddJourney() {
        const trimmedTitle = journeyTitle.trim();

        if (!trimmedTitle) {
            return;
        }

        const newJourney: Journey = {
            id: Date.now().toString(),
            title: trimmedTitle,
        };

        setJourneys((currentJourneys) => [...currentJourneys, newJourney]);

        setJourneyTitle("");
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Journeys</Text>

            <Text style={styles.description}>Your larger goals and projects will appear here.</Text>

            <TextInput style={styles.input} placeholder="For example, organise the house" value={journeyTitle} onChangeText={setJourneyTitle} />

            <Pressable style={styles.addButton} onPress={handleAddJourney}>
                <Text style={styles.addButtonText}>Add Journey</Text>
            </Pressable>

            <View style={styles.journeyList}>
                {journeys.map((journey) => (
                    <View key={journey.id} style={styles.journeyCard}>
                        <Text style={styles.journeyTitle}>{journey.title}</Text>
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
    },
    journeyTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
});
