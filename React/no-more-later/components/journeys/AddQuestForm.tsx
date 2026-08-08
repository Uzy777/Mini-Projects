import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colours, radius, spacing } from "@/constants/design";

type AddQuestFormProps = {
    questTitle: string;
    onChangeQuestTitle: (title: string) => void;
    onAddQuest: () => void;
};

export function AddQuestForm({ questTitle, onChangeQuestTitle, onAddQuest }: AddQuestFormProps) {
    const titleIsEmpty = !questTitle.trim();

    return (
        <View style={styles.formCard}>
            <Text style={styles.formLabel}>NEW QUEST</Text>

            <Text style={styles.formDescription}>Break this Journey into one clear, achievable step.</Text>

            <TextInput
                style={styles.input}
                value={questTitle}
                onChangeText={onChangeQuestTitle}
                placeholder="What needs to be done next?"
                placeholderTextColor={colours.textMuted}
                selectionColor={colours.primary}
                returnKeyType="done"
                onSubmitEditing={titleIsEmpty ? undefined : onAddQuest}
            />

            <Pressable
                style={({ pressed }) => [styles.addButton, titleIsEmpty && styles.disabledButton, pressed && !titleIsEmpty && styles.addButtonPressed]}
                onPress={onAddQuest}
                disabled={titleIsEmpty}
            >
                {" "}
                <Text style={[styles.addButtonText, titleIsEmpty && styles.disabledButtonText]}>Add Quest</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
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
