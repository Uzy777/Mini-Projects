import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Journey } from "../../types/models";

type JourneyCardProps = {
    journey: Journey;
    onOpen: () => void;
    onDelete: () => void;
};

export function JourneyCard({ journey, onOpen, onDelete }: JourneyCardProps) {
    const isCompleted = journey.status === "completed";

    return (
        <View style={styles.journeyCard}>
            <Pressable style={styles.journeyContent} onPress={onOpen}>
                <Text style={styles.journeyTitle}>{journey.title}</Text>
            </Pressable>

            <View style={styles.journeyActions}>
                <Text style={[styles.statusText, isCompleted && styles.completedStatusText]}>{isCompleted ? "Completed" : "Active"}</Text>

                <Pressable onPress={onDelete}>
                    <Text style={styles.deleteText}>Delete Journey</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    journeyCard: {
        width: "100%",
        marginTop: 16,
        padding: 18,
        borderRadius: 12,
        backgroundColor: "#ffffff",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    journeyContent: {
        flex: 1,
        paddingRight: 16,
    },
    journeyTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    journeyActions: {
        alignItems: "flex-end",
        gap: 6,
    },
    statusText: {
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
});
