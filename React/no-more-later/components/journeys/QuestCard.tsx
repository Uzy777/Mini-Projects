import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Quest } from "../../types/models";

type QuestCardProps = {
    quest: Quest;
    onStartSession: () => void;
    onReopenQuest: () => void;
    onDeleteQuest: () => void;
};

export function QuestCard({ quest, onStartSession, onReopenQuest, onDeleteQuest }: QuestCardProps) {
    const isCompleted = quest.status === "completed";

    return (
        <View style={styles.questCard}>
            <View style={styles.questHeader}>
                <View style={styles.questContent}>
                    <Text style={styles.questTitle}>{quest.title}</Text>

                    <Text style={[styles.statusText, isCompleted && styles.completedStatusText]}>{isCompleted ? "Completed" : "Active"}</Text>
                </View>

                <Pressable onPress={onDeleteQuest}>
                    <Text style={styles.deleteText}>Delete Quest</Text>
                </Pressable>
            </View>

            {quest.lastAccomplishment && (
                <View style={styles.questDetails}>
                    <Text style={styles.detailLabel}>Last accomplishment</Text>

                    <Text style={styles.detailText}>{quest.lastAccomplishment}</Text>
                </View>
            )}

            {!isCompleted && quest.nextAction && (
                <View style={styles.questDetails}>
                    <Text style={styles.detailLabel}>Next action</Text>

                    <Text style={styles.detailText}>{quest.nextAction}</Text>
                </View>
            )}

            {isCompleted ? (
                <Pressable style={styles.secondaryButton} onPress={onReopenQuest}>
                    <Text style={styles.secondaryButtonText}>Reopen Quest</Text>
                </Pressable>
            ) : (
                <Pressable style={styles.primaryButton} onPress={onStartSession}>
                    <Text style={styles.primaryButtonText}>Start Session</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    questCard: {
        width: "100%",
        marginTop: 16,
        padding: 18,
        borderRadius: 12,
        backgroundColor: "#ffffff",
    },
    questHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
    },
    questContent: {
        flex: 1,
    },
    questTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    statusText: {
        marginTop: 5,
        fontSize: 13,
        fontWeight: "600",
        color: "#666666",
    },
    completedStatusText: {
        color: "#2f7d32",
    },
    deleteText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#b42318",
    },
    questDetails: {
        marginTop: 14,
        padding: 12,
        borderRadius: 8,
        backgroundColor: "#f2f2f2",
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#666666",
    },
    detailText: {
        marginTop: 4,
        fontSize: 14,
        lineHeight: 20,
    },
    primaryButton: {
        marginTop: 16,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#222222",
        alignItems: "center",
    },
    primaryButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#ffffff",
    },
    secondaryButton: {
        marginTop: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "#222222",
        borderRadius: 8,
        alignItems: "center",
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#222222",
    },
});
