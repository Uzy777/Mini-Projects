import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Journey } from "../../types/models";
import { colours, radius, spacing } from "@/constants/design";

type JourneyCardProps = {
    journey: Journey;
    onOpen: () => void;
    onDelete: () => void;
};

export function JourneyCard({ journey, onOpen, onDelete }: JourneyCardProps) {
    const isCompleted = journey.status === "completed";

    return (
        <View style={styles.card}>
            <Pressable style={({ pressed }) => [styles.openArea, pressed && styles.openAreaPressed]} onPress={onOpen}>
                <View style={styles.topRow}>
                    <View style={[styles.statusBadge, isCompleted ? styles.completedBadge : styles.activeBadge]}>
                        <Text style={[styles.statusText, isCompleted ? styles.completedStatusText : styles.activeStatusText]}>
                            {isCompleted ? "COMPLETED" : "ACTIVE"}
                        </Text>
                    </View>

                    <Text style={styles.openText}>Open →</Text>
                </View>

                <Text style={styles.title}>{journey.title}</Text>

                <Text style={styles.description}>{isCompleted ? "This Journey has been completed." : "Keep moving this Journey forward."}</Text>
            </Pressable>

            <View style={styles.divider} />

            <View style={styles.footer}>
                <Pressable style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]} onPress={onDelete} hitSlop={8}>
                    <Text style={styles.deleteText}>Delete Journey</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "100%",
        borderWidth: 1,
        borderColor: colours.border,
        borderRadius: radius.lg,
        backgroundColor: colours.surface,
        overflow: "hidden",
    },

    openArea: {
        padding: spacing.lg,
    },

    openAreaPressed: {
        backgroundColor: colours.primarySoft,
    },

    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.md,
    },

    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: radius.pill,
    },

    activeBadge: {
        backgroundColor: colours.primarySoft,
    },

    completedBadge: {
        backgroundColor: colours.successSoft,
    },

    statusText: {
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 0.6,
    },

    activeStatusText: {
        color: colours.primary,
    },

    completedStatusText: {
        color: colours.success,
    },

    openText: {
        fontSize: 14,
        fontWeight: "700",
        color: colours.primary,
    },

    title: {
        marginTop: spacing.md,
        fontSize: 20,
        lineHeight: 26,
        fontWeight: "800",
        color: colours.text,
    },

    description: {
        marginTop: spacing.sm,
        fontSize: 14,
        lineHeight: 20,
        color: colours.textMuted,
    },

    divider: {
        height: 1,
        backgroundColor: colours.border,
    },

    footer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingHorizontal: spacing.lg,
        paddingVertical: 12,
    },

    deleteButton: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: radius.sm,
    },

    deleteButtonPressed: {
        backgroundColor: colours.dangerSoft,
    },

    deleteText: {
        fontSize: 13,
        fontWeight: "700",
        color: colours.danger,
    },
});
