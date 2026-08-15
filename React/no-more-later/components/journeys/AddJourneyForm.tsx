import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import { useMemo } from "react";

type AddJourneyFormProps = {
    journeyTitle: string;
    onChangeJourneyTitle: (title: string) => void;
    onAddJourney: () => void;
};

export function AddJourneyForm({ journeyTitle, onChangeJourneyTitle, onAddJourney }: AddJourneyFormProps) {
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    const titleIsEmpty = !journeyTitle.trim();

    return (
        <View style={styles.formCard}>
            <Text style={styles.formLabel}>NEW JOURNEY</Text>

            <Text style={styles.formDescription}>Add a larger goal that you want to make steady progress towards.</Text>

            <TextInput
                style={styles.input}
                value={journeyTitle}
                onChangeText={onChangeJourneyTitle}
                placeholder="What do you want to achieve?"
                placeholderTextColor={colours.textMuted}
                selectionColor={colours.primary}
                returnKeyType="done"
                onSubmitEditing={titleIsEmpty ? undefined : onAddJourney}
            />

            <Pressable
                style={({ pressed }) => [styles.addButton, titleIsEmpty && styles.disabledButton, pressed && !titleIsEmpty && styles.addButtonPressed]}
                onPress={onAddJourney}
                disabled={titleIsEmpty}
            >
                <Text style={[styles.addButtonText, titleIsEmpty && styles.disabledButtonText]}>Add Journey</Text>
            </Pressable>
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        formCard: {
            width: "100%",
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },

        formLabel: {
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 0.7,
            color: colours.primary,
        },

        formDescription: {
            marginTop: spacing.sm,
            fontSize: 14,
            lineHeight: 20,
            color: colours.textMuted,
        },

        input: {
            width: "100%",
            marginTop: spacing.md,
            paddingVertical: 13,
            paddingHorizontal: spacing.md,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,
            fontSize: 16,
            color: colours.text,
            backgroundColor: colours.background,
        },

        addButton: {
            marginTop: spacing.md,
            alignItems: "center",
            paddingVertical: 13,
            borderRadius: radius.md,
            backgroundColor: colours.primary,
        },

        addButtonPressed: {
            backgroundColor: colours.primaryPressed,
        },

        addButtonText: {
            fontSize: 15,
            fontWeight: "700",
            color: colours.surface,
        },

        disabledButton: {
            backgroundColor: colours.primarySoft,
        },

        disabledButtonText: {
            color: colours.textMuted,
        },
    });
}
