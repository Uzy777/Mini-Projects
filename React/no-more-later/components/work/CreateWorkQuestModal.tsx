import { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { X } from "lucide-react-native";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

type CreateWorkQuestModalProps = {
    visible: boolean;
    onClose: () => void;
    onCreate: (title: string) => void;
};

export function CreateWorkQuestModal({ visible, onClose, onCreate }: CreateWorkQuestModalProps) {
    const { colours } = useAppearance();

    const [title, setTitle] = useState("");

    const styles = useMemo(() => createStyles(colours), [colours]);

    useEffect(() => {
        if (visible) {
            setTitle("");
        }
    }, [visible]);

    const trimmedTitle = title.trim();
    const canCreate = trimmedTitle.length > 0;

    function handleCreate() {
        if (!canCreate) {
            return;
        }

        onCreate(trimmedTitle);
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

                <View style={styles.card}>
                    <View style={styles.header}>
                        <View style={styles.headerText}>
                            <Text style={styles.eyebrow}>NEW QUEST</Text>

                            <Text style={styles.title}>What do you need to do?</Text>

                            <Text style={styles.description}>Give your Quest a simple, clear name.</Text>
                        </View>

                        <Pressable style={styles.closeButton} onPress={onClose}>
                            <X size={19} color={colours.textMuted} />
                        </Pressable>
                    </View>

                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        style={styles.input}
                        placeholder="e.g. Finish login screen"
                        placeholderTextColor={colours.textMuted}
                        selectionColor={colours.primary}
                        autoFocus
                        returnKeyType="done"
                        onSubmitEditing={handleCreate}
                    />

                    <View style={styles.actions}>
                        <Pressable style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>

                        <Pressable style={[styles.createButton, !canCreate && styles.disabled]} disabled={!canCreate} onPress={handleCreate}>
                            <Text style={styles.createText}>Create Quest</Text>
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
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
            maxWidth: 520,

            gap: spacing.lg,
            padding: spacing.lg,

            borderWidth: 1,
            borderColor: colours.primaryBorder,
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
            fontSize: 23,
            fontWeight: "800",

            color: colours.text,
        },

        description: {
            fontSize: 14,
            lineHeight: 20,

            color: colours.textMuted,
        },

        closeButton: {
            width: 38,
            height: 38,

            alignItems: "center",
            justifyContent: "center",

            borderRadius: radius.pill,

            backgroundColor: colours.background,
        },

        input: {
            minHeight: 52,

            paddingHorizontal: spacing.md,
            paddingVertical: 12,

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,

            backgroundColor: colours.background,

            fontSize: 15,
            color: colours.text,
        },

        actions: {
            flexDirection: "row",
            justifyContent: "flex-end",

            gap: spacing.sm,
        },

        cancelButton: {
            minHeight: 46,

            alignItems: "center",
            justifyContent: "center",

            paddingHorizontal: spacing.lg,

            borderRadius: radius.md,
        },

        cancelText: {
            fontSize: 14,
            fontWeight: "700",

            color: colours.textMuted,
        },

        createButton: {
            minHeight: 46,

            alignItems: "center",
            justifyContent: "center",

            paddingHorizontal: spacing.lg,

            borderRadius: radius.md,

            backgroundColor: colours.primary,
        },

        createText: {
            fontSize: 14,
            fontWeight: "800",

            color: colours.surface,
        },

        disabled: {
            opacity: 0.45,
        },
    });
}
