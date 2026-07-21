import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import type { SessionOutcome } from "../../types/models";
import { FOCUS_SESSIONS_STORAGE_KEY } from "../../constants/storageKeys";
import type { FocusSessionRecord } from "../../types/models";
import { getFocusSessions } from "../../services/storage/focusSessionsStorage";

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
                keyExtractor={(session) => session.id}
                contentContainerStyle={styles.sessionList}
                ListEmptyComponent={<Text style={styles.emptyText}>Your completed focus sessions will appear here.</Text>}
                renderItem={({ item: session }) => (
                    <View style={styles.sessionCard}>
                        <View style={styles.sessionHeader}>
                            <Text style={styles.questTitle}>{session.questTitle}</Text>

                            <Text style={styles.xpText}>+{session.earnedXp} XP</Text>
                        </View>

                        <Text style={styles.sessionDetails}>
                            Focused for {formatFocusedTime(session.actualSeconds ?? session.plannedMinutes * 60)}
                            {" · "}
                            {getOutcomeLabel(session.outcome)}
                        </Text>

                        <Text style={styles.plannedTimeText}>Planned duration: {session.plannedMinutes} minutes</Text>

                        <Text style={styles.dateText}>{new Date(session.completedAt).toLocaleString()}</Text>

                        <Text style={styles.sectionLabel}>Accomplished</Text>

                        <Text style={styles.bodyText}>{session.accomplishment}</Text>

                        {session.nextAction && (
                            <>
                                <Text style={styles.sectionLabel}>Next action</Text>

                                <Text style={styles.bodyText}>{session.nextAction}</Text>
                            </>
                        )}
                    </View>
                )}
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
    sessionList: {
        paddingTop: 24,
        paddingBottom: 48,
        gap: 16,
    },
    emptyText: {
        marginTop: 24,
        fontSize: 16,
        color: "#666666",
        textAlign: "center",
    },
    sessionCard: {
        padding: 18,
        borderRadius: 12,
        backgroundColor: "#ffffff",
    },
    sessionHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
    },
    questTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: "700",
    },
    xpText: {
        fontSize: 16,
        fontWeight: "700",
    },
    sessionDetails: {
        marginTop: 8,
        fontSize: 14,
        color: "#555555",
    },
    dateText: {
        marginTop: 4,
        fontSize: 13,
        color: "#777777",
    },
    sectionLabel: {
        marginTop: 16,
        fontSize: 13,
        fontWeight: "700",
        color: "#555555",
    },
    bodyText: {
        marginTop: 4,
        fontSize: 15,
        lineHeight: 22,
    },
    plannedTimeText: {
        marginTop: 4,
        fontSize: 13,
        color: "#777777",
    },
});
