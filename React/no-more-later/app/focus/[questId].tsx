import { useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function FocusScreen() {
    const { questId, questTitle } = useLocalSearchParams<{
        questId: string;
        questTitle?: string;
    }>();

    const [selectedMinutes, setSelectedMinutes] = useState(25);

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: "Focus Session",
                }}
            />

            <Text style={styles.label}>Current Quest</Text>

            <Text style={styles.title}>{questTitle ?? "Untitled Quest"}</Text>

            <Text style={styles.sectionTitle}>Choose a session length</Text>

            <View style={styles.durationOptions}>
                <Pressable style={[styles.durationButton, selectedMinutes === 15 && styles.selectedDurationButton]} onPress={() => setSelectedMinutes(15)}>
                    <Text style={[styles.durationText, selectedMinutes === 15 && styles.selectedDurationText]}>15 min</Text>
                </Pressable>

                <Pressable style={[styles.durationButton, selectedMinutes === 25 && styles.selectedDurationButton]} onPress={() => setSelectedMinutes(25)}>
                    <Text style={[styles.durationText, selectedMinutes === 25 && styles.selectedDurationText]}>25 min</Text>
                </Pressable>

                <Pressable style={[styles.durationButton, selectedMinutes === 50 && styles.selectedDurationButton]} onPress={() => setSelectedMinutes(50)}>
                    <Text style={[styles.durationText, selectedMinutes === 50 && styles.selectedDurationText]}>50 min</Text>
                </Pressable>
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
    description: {
        marginTop: 16,
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
        fontSize: 16,
        fontWeight: "600",
    },
    durationOptions: {
        flexDirection: "row",
        gap: 12,
    },
    durationButton: {
        flex: 1,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: "#cccccc",
        borderRadius: 8,
        backgroundColor: "#ffffff",
        alignItems: "center",
    },
    selectedDurationButton: {
        borderColor: "#222222",
        backgroundColor: "#222222",
    },
    durationText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#222222",
    },
    selectedDurationText: {
        color: "#ffffff",
    },
});
