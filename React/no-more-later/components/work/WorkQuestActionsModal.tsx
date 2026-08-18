import { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { CheckCircle2, RotateCcw, X, Trash2 } from "lucide-react-native";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import type { WorkJourney, WorkQuest } from "@/types/work";

type WorkQuestActionsModalProps = {
    quest: WorkQuest | null;
    journeys: WorkJourney[];
    onClose: () => void;
    onAssignJourney: (journeyId?: string) => void;
    onToggleComplete: () => void;
    onDelete: () => void;
};

export function WorkQuestActionsModal({ quest, journeys, onClose, onAssignJourney, onToggleComplete, onDelete }: WorkQuestActionsModalProps) {
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    const isCompleted = quest?.status === "completed";

    return (
        <Modal visible={quest !== null} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

                <View style={styles.card}>
                    <View style={styles.header}>
                        <View style={styles.headerText}>
                            <Text style={styles.eyebrow}>QUEST OPTIONS</Text>

                            <Text style={styles.title} numberOfLines={2}>
                                {quest?.title}
                            </Text>
                        </View>

                        <Pressable style={styles.closeButton} onPress={onClose}>
                            <X size={19} color={colours.textMuted} />
                        </Pressable>
                    </View>

                    <View style={styles.journeySection}>
                        <Text style={styles.sectionTitle}>MOVE TO JOURNEY</Text>

                        <Text style={styles.sectionDescription}>Keep this Quest standalone or organise it inside a Journey.</Text>

                        <View style={styles.journeyOptions}>
                            <Pressable
                                style={[styles.journeyOption, !quest?.journeyId && styles.journeyOptionSelected]}
                                onPress={() => onAssignJourney(undefined)}
                            >
                                <Text style={[styles.journeyOptionText, !quest?.journeyId && styles.journeyOptionTextSelected]}>No Journey</Text>
                            </Pressable>

                            {journeys
                                .filter((journey) => journey.status === "active")
                                .map((journey) => {
                                    const isSelected = quest?.journeyId === journey.id;

                                    return (
                                        <Pressable
                                            key={journey.id}
                                            style={[styles.journeyOption, isSelected && styles.journeyOptionSelected]}
                                            onPress={() => onAssignJourney(journey.id)}
                                        >
                                            <Text style={[styles.journeyOptionText, isSelected && styles.journeyOptionTextSelected]} numberOfLines={1}>
                                                {journey.title}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <Pressable style={({ pressed }) => [styles.action, pressed && styles.pressed]} onPress={onToggleComplete}>
                        {isCompleted ? <RotateCcw size={20} color={colours.primary} /> : <CheckCircle2 size={20} color={colours.success} />}

                        <View style={styles.actionTextContainer}>
                            <Text style={styles.actionTitle}>{isCompleted ? "Reopen Quest" : "Mark Quest complete"}</Text>

                            <Text style={styles.actionDescription}>
                                {isCompleted ? "Move this Quest back to your active work." : "Move this Quest to your completed work."}
                            </Text>
                        </View>
                    </Pressable>

                    <Pressable style={({ pressed }) => [styles.action, pressed && styles.pressed]} onPress={onDelete}>
                        <Trash2 size={20} color={colours.danger} />

                        <View style={styles.actionTextContainer}>
                            <Text style={[styles.actionTitle, styles.deleteTitle]}>Delete Quest</Text>

                            <Text style={styles.actionDescription}>Permanently remove this Quest.</Text>
                        </View>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        overlay: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",

            padding: spacing.lg,

            backgroundColor: "rgba(8, 8, 20, 0.55)",
        },

        card: {
            width: "100%",
            maxWidth: 480,

            gap: spacing.md,
            padding: spacing.lg,

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,

            backgroundColor: colours.surface,
        },

        header: {
            flexDirection: "row",
            alignItems: "flex-start",

            gap: spacing.md,
        },

        headerText: {
            flex: 1,
            gap: spacing.xs,
        },

        eyebrow: {
            fontSize: 11,
            fontWeight: "900",
            letterSpacing: 1,

            color: colours.primary,
        },

        title: {
            fontSize: 20,
            fontWeight: "800",

            color: colours.text,
        },

        closeButton: {
            width: 36,
            height: 36,

            alignItems: "center",
            justifyContent: "center",

            borderRadius: radius.pill,

            backgroundColor: colours.background,
        },

        divider: {
            height: 1,

            backgroundColor: colours.border,
        },

        action: {
            minHeight: 64,

            flexDirection: "row",
            alignItems: "center",

            gap: spacing.md,
            padding: spacing.sm,

            borderRadius: radius.md,
        },

        actionTextContainer: {
            flex: 1,
            gap: 3,
        },

        actionTitle: {
            fontSize: 14,
            fontWeight: "800",

            color: colours.text,
        },

        actionDescription: {
            fontSize: 12,
            lineHeight: 18,

            color: colours.textMuted,
        },

        pressed: {
            opacity: 0.65,
        },

        journeySection: {
            gap: spacing.sm,
        },

        sectionTitle: {
            fontSize: 11,
            fontWeight: "900",
            letterSpacing: 1,

            color: colours.textMuted,
        },

        sectionDescription: {
            fontSize: 13,
            lineHeight: 18,

            color: colours.textMuted,
        },

        journeyOptions: {
            flexDirection: "row",
            flexWrap: "wrap",

            gap: spacing.sm,
        },

        journeyOption: {
            maxWidth: "100%",

            paddingHorizontal: spacing.md,
            paddingVertical: 10,

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.pill,

            backgroundColor: colours.background,
        },

        journeyOptionSelected: {
            borderColor: colours.primaryBorder,
            backgroundColor: colours.primarySoft,
        },

        journeyOptionText: {
            fontSize: 13,
            fontWeight: "700",

            color: colours.textMuted,
        },

        journeyOptionTextSelected: {
            color: colours.primary,
        },
        deleteTitle: {
            color: colours.danger,
        },
    });
}
