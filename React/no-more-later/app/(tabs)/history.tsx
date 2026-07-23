import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import type { SessionOutcome } from "../../types/models";
import { FOCUS_SESSIONS_STORAGE_KEY } from "../../constants/storageKeys";
import type { FocusSessionRecord } from "../../types/models";
import { getFocusSessions } from "../../services/storage/focusSessionsStorage";
import { FocusSessionHistoryCard } from "../../components/history/FocusSessionHistoryCard";

function getOutcomeLabel(outcome: SessionOutcome) {
    if (outcome === "completed") {
        return "Quest completed";
    }

    if (outcome === "progressed") {
        return "Made progress";
    }

    if (outcome === "blocked") {
        return "Got blocked";
    }

    return "Stopped early";
}

function formatFocusedTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);

    const seconds = totalSeconds % 60;

    if (minutes === 0) {
        return `${seconds} sec`;
    }

    if (seconds === 0) {
        return `${minutes} min`;
    }

    return `${minutes} min ${seconds} sec`;
}

export default function HistoryScreen() {
    const [sessions, setSessions] = useState<FocusSessionRecord[]>([]);

    useFocusEffect(
        useCallback(() => {
            async function loadSessions() {
                try {
                    const currentSessions = await getFocusSessions();

                    setSessions(currentSessions);
                } catch (error) {
                    console.error("Failed to load focus sessions:", error);
                }
            }

            loadSessions();
        }, []),
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>History</Text>

            <Text style={styles.description}>Review the focused progress you have made.</Text>

            <FlatList
                data={sessions}
                keyExtractor={(session, index) => `${session.completedAt}-${index}`}
                renderItem={({ item }) => <FocusSessionHistoryCard session={item} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        backgroundColor: "#f5f5f5",
    },
    title: {
        marginTop: 48,
        fontSize: 32,
        fontWeight: "700",
    },
    description: {
        marginTop: 8,
        fontSize: 16,
        color: "#666666",
    },
});
