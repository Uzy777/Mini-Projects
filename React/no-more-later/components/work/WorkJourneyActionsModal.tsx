import { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Trash2, X } from "lucide-react-native";

import type { WorkJourney } from "@/types/work";

import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";

import { radius, spacing } from "@/constants/design";

type WorkJourneyActionsModalProps = {
    journey: WorkJourney | null;
    onClose: () => void;
    onDelete: () => void;
};

export function WorkJourneyActionsModal({ journey, onClose, onDelete }: WorkJourneyActionsModalProps) {
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    if (!journey) {
        return null;
    }

    return (
        <Modal visible={journey !== null} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />

                <View style={styles.modal}>
                    <View style={styles.header}>
                        <View style={styles.headerText}>
                            <Text style={styles.label}>JOURNEY OPTIONS</Text>

                            <Text style={styles.title}>{journey.title}</Text>
                        </View>

                        <Pressable onPress={onClose} hitSlop={8} style={styles.closeButton}>
                            <X size={20} color={colours.textMuted} />
                        </Pressable>
                    </View>

                    <View style={styles.divider} />

                    <Pressable style={({ pressed }) => [styles.deleteButton, pressed && styles.actionPressed]} onPress={onDelete}>
                        <View style={styles.deleteIconContainer}>
                            <Trash2 size={19} color={colours.danger} />
                        </View>

                        <View style={styles.actionText}>
                            <Text style={styles.deleteTitle}>Delete Journey</Text>

                            <Text style={styles.deleteDescription}>Quests will be kept and moved to No Journey.</Text>
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
        },

        backdrop: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
        },

        modal: {
            width: "100%",
            maxWidth: 460,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },

        header: {
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: spacing.md,
        },

        headerText: {
            flex: 1,
        },

        label: {
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 0.7,
            color: colours.primary,
        },

        title: {
            marginTop: spacing.xs,
            fontSize: 20,
            lineHeight: 26,
            fontWeight: "800",
            color: colours.text,
        },

        closeButton: {
            width: 36,
            height: 36,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
        },

        divider: {
            height: 1,
            marginVertical: spacing.lg,
            backgroundColor: colours.border,
        },

        deleteButton: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,
        },

        actionPressed: {
            opacity: 0.7,
        },

        deleteIconContainer: {
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.md,
            backgroundColor: colours.dangerSoft,
        },

        actionText: {
            flex: 1,
        },

        deleteTitle: {
            fontSize: 15,
            fontWeight: "700",
            color: colours.danger,
        },

        deleteDescription: {
            marginTop: 3,
            fontSize: 13,
            lineHeight: 18,
            color: colours.textMuted,
        },
    });
}
