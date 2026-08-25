import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { X } from "lucide-react-native";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { WORK_QUEST_ASSETS, WorkAssetIcon } from "@/components/work/WorkAssetIcon";
import { KeyboardAwareView } from "@/components/ui/KeyboardAwareLayout";

import type { WorkAssetId, WorkJourney } from "@/types/work";

type CreateWorkQuestModalProps = {
    visible: boolean;
    journeys: WorkJourney[];
    initialJourneyId?: string;
    onClose: () => void;
    onCreate: (title: string, assetId: WorkAssetId, journeyId?: string) => void;
};

export function CreateWorkQuestModal({ visible, journeys, initialJourneyId, onClose, onCreate }: CreateWorkQuestModalProps) {
    const { colours } = useAppearance();

    const [title, setTitle] = useState("");
    const [selectedAssetId, setSelectedAssetId] = useState<WorkAssetId>("task");
    const [selectedJourneyId, setSelectedJourneyId] = useState<string | undefined>(undefined);

    const styles = useMemo(() => createStyles(colours), [colours]);

    useEffect(() => {
        if (visible) {
            setTitle("");
            setSelectedJourneyId(initialJourneyId);
            setSelectedAssetId("task");
        }
    }, [visible, initialJourneyId]);

    const trimmedTitle = title.trim();
    const canCreate = trimmedTitle.length > 0;

    function handleCreate() {
        if (!canCreate) {
            return;
        }

        onCreate(trimmedTitle, selectedAssetId, selectedJourneyId);
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAwareView style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

                <View style={styles.card}>
                    <ScrollView
                        contentContainerStyle={styles.cardContent}
                        keyboardDismissMode="on-drag"
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
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

                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>ICON</Text>

                        <View style={styles.assetGrid}>
                            {WORK_QUEST_ASSETS.map((asset) => {
                                const isSelected = selectedAssetId === asset.id;

                                return (
                                    <Pressable
                                        key={asset.id}
                                        style={[styles.assetOption, isSelected && styles.assetOptionSelected]}
                                        onPress={() => setSelectedAssetId(asset.id)}
                                    >
                                        <WorkAssetIcon assetId={asset.id} size={20} color={isSelected ? colours.primary : colours.textMuted} />

                                        <Text style={[styles.assetText, isSelected && styles.assetTextSelected]}>{asset.label}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>JOURNEY (OPTIONAL)</Text>

                        <Text style={styles.helperText}>Keep this Quest standalone or add it to a Journey.</Text>

                        <View style={styles.journeyOptions}>
                            <Pressable
                                style={[styles.journeyOption, selectedJourneyId === undefined && styles.journeyOptionSelected]}
                                onPress={() => setSelectedJourneyId(undefined)}
                            >
                                <Text style={[styles.journeyOptionText, selectedJourneyId === undefined && styles.journeyOptionTextSelected]}>No Journey</Text>
                            </Pressable>

                            {journeys
                                .filter((journey) => journey.status === "active")
                                .map((journey) => {
                                    const isSelected = selectedJourneyId === journey.id;

                                    return (
                                        <Pressable
                                            key={journey.id}
                                            style={[styles.journeyOption, isSelected && styles.journeyOptionSelected]}
                                            onPress={() => setSelectedJourneyId(journey.id)}
                                        >
                                            <Text style={[styles.journeyOptionText, isSelected && styles.journeyOptionTextSelected]} numberOfLines={1}>
                                                {journey.title}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                        </View>
                    </View>

                    <View style={styles.actions}>
                        <Pressable style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>

                        <Pressable style={[styles.createButton, !canCreate && styles.disabled]} disabled={!canCreate} onPress={handleCreate}>
                            <Text style={styles.createText}>Create Quest</Text>
                        </Pressable>
                    </View>
                    </ScrollView>
                </View>
            </KeyboardAwareView>
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
            maxHeight: "95%",

            overflow: "hidden",

            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.lg,

            backgroundColor: colours.surface,
        },

        cardContent: {
            gap: spacing.lg,
            padding: spacing.lg,
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

            color: colours.onPrimary,
        },

        disabled: {
            opacity: 0.45,
        },
        field: {
            gap: spacing.sm,
        },

        fieldLabel: {
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 1,

            color: colours.textMuted,
        },

        helperText: {
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

        assetGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.sm,
        },

        assetOption: {
            minWidth: 110,

            flexDirection: "row",
            alignItems: "center",

            gap: spacing.sm,

            paddingHorizontal: spacing.md,
            paddingVertical: 10,

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,

            backgroundColor: colours.background,
        },

        assetOptionSelected: {
            borderColor: colours.primaryBorder,
            backgroundColor: colours.primarySoft,
        },

        assetText: {
            fontSize: 13,
            fontWeight: "700",

            color: colours.textMuted,
        },

        assetTextSelected: {
            color: colours.primary,
        },
    });
}
