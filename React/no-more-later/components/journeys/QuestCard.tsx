import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Quest } from "../../types/models";
import { colours, radius, spacing } from "@/constants/design";

type QuestCardProps = {
    quest: Quest;
    onStartSession: () => void;
    onReopenQuest: () => void;
    onDeleteQuest: () => void;
};

export function QuestCard({ quest, onStartSession, onReopenQuest, onDeleteQuest }: QuestCardProps) {
    const isCompleted = quest.status === "completed";

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={[styles.statusBadge, isCompleted ? styles.completedBadge : styles.activeBadge]}>
                    <Text style={[styles.statusText, isCompleted ? styles.completedStatusText : styles.activeStatusText]}>
                        {isCompleted ? "COMPLETED" : "ACTIVE"}
                    </Text>
                </View>

                <Pressable style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]} onPress={onDeleteQuest} hitSlop={8}>
                    <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
            </View>

            <Text style={styles.title}>{quest.title}</Text>

            {quest.lastAccomplishment && (
                <View style={styles.accomplishmentBox}>
                    <Text style={styles.detailLabel}>Last accomplishment</Text>

                    <Text style={styles.detailText}>{quest.lastAccomplishment}</Text>
                </View>
            )}

            {!isCompleted && quest.nextAction && (
                <View style={styles.nextActionBox}>
                    <Text style={styles.nextActionLabel}>NEXT ACTION</Text>

                    <Text style={styles.nextActionText}>{quest.nextAction}</Text>
                </View>
            )}

            {isCompleted ? (
                <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]} onPress={onReopenQuest}>
                    <Text style={styles.secondaryButtonText}>Reopen Quest</Text>
                </Pressable>
            ) : (
                <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]} onPress={onStartSession}>
                    <Text style={styles.primaryButtonText}>Start Focus Session</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "100%",
        marginTop: spacing.md,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colours.border,
        borderRadius: radius.lg,
        backgroundColor: colours.surface,
    },

    header: {
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

    title: {
        marginTop: spacing.md,
        fontSize: 20,
        lineHeight: 26,
        fontWeight: "800",
        color: colours.text,
    },

    deleteButton: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 5,
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

    accomplishmentBox: {
        marginTop: spacing.md,
        padding: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colours.background,
    },

    detailLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: colours.textMuted,
    },

    detailText: {
        marginTop: spacing.xs,
        fontSize: 14,
        lineHeight: 20,
        color: colours.text,
    },

    nextActionBox: {
        marginTop: spacing.md,
        padding: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colours.primarySoft,
    },

    nextActionLabel: {
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 0.6,
        color: colours.primary,
    },

    nextActionText: {
        marginTop: spacing.xs,
        fontSize: 15,
        lineHeight: 21,
        fontWeight: "600",
        color: colours.text,
    },

    primaryButton: {
        marginTop: spacing.lg,
        alignItems: "center",
        paddingVertical: 13,
        borderRadius: radius.md,
        backgroundColor: colours.primary,
    },

    primaryButtonPressed: {
        backgroundColor: colours.primaryPressed,
    },

    primaryButtonText: {
        fontSize: 15,
        fontWeight: "700",
        color: colours.surface,
    },

    secondaryButton: {
        marginTop: spacing.lg,
        alignItems: "center",
        paddingVertical: 13,
        borderWidth: 1,
        borderColor: colours.border,
        borderRadius: radius.md,
        backgroundColor: colours.surface,
    },

    secondaryButtonPressed: {
        backgroundColor: colours.background,
    },

    secondaryButtonText: {
        fontSize: 15,
        fontWeight: "700",
        color: colours.text,
    },
});
