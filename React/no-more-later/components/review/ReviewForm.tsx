import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colours, radius, spacing } from "@/constants/design";

type ReviewFormProps = {
    accomplishment: string;
    nextAction: string;
    showNextAction: boolean;
    errorMessage: string;
    onChangeAccomplishment: (value: string) => void;
    onChangeNextAction: (value: string) => void;
    isSubmitting: boolean;
    onSubmit: () => void;
};

export function ReviewForm({
    accomplishment,
    nextAction,
    showNextAction,
    errorMessage,
    onChangeAccomplishment,
    onChangeNextAction,
    isSubmitting,
    onSubmit,
}: ReviewFormProps) {
    return (
        <View style={styles.formContainer}>
            <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>What did you accomplish?</Text>

                <Text style={styles.helperText}>Briefly describe what you completed or moved forward.</Text>

                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={accomplishment}
                    onChangeText={onChangeAccomplishment}
                    placeholder="What did you get done?"
                    placeholderTextColor={colours.textMuted}
                    selectionColor={colours.primary}
                    multiline
                    textAlignVertical="top"
                />
            </View>
            {showNextAction && (
                <View style={styles.fieldGroup}>
                    <Text style={styles.inputLabel}>What is the next action?</Text>

                    <Text style={styles.helperText}>Make the next step specific and easy to start.</Text>

                    <TextInput
                        style={[styles.input, styles.multilineInput]}
                        value={nextAction}
                        onChangeText={onChangeNextAction}
                        placeholder="e.g. Create the login form component"
                        placeholderTextColor={colours.textMuted}
                        selectionColor={colours.primary}
                        multiline
                        textAlignVertical="top"
                    />
                </View>
            )}

            {errorMessage && (
                <View style={styles.errorBox}>
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                </View>
            )}

            <Pressable
                style={({ pressed }) => [
                    styles.submitButton,
                    isSubmitting && styles.submitButtonDisabled,
                    pressed && !isSubmitting && styles.submitButtonPressed,
                ]}
                onPress={onSubmit}
                disabled={isSubmitting}
            >
                <Text style={styles.submitButtonText}>{isSubmitting ? "Saving..." : "Complete Review"}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    formContainer: {
        width: "100%",
        gap: spacing.lg,
    },

    fieldGroup: {
        width: "100%",
    },

    inputLabel: {
        fontSize: 15,
        fontWeight: "700",
        color: colours.text,
    },

    helperText: {
        marginTop: spacing.xs,
        fontSize: 13,
        lineHeight: 19,
        color: colours.textMuted,
    },

    input: {
        width: "100%",
        marginTop: spacing.sm,
        paddingVertical: 13,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colours.border,
        borderRadius: radius.md,
        fontSize: 16,
        lineHeight: 22,
        color: colours.text,
        backgroundColor: colours.surface,
    },

    multilineInput: {
        minHeight: 110,
    },

    errorBox: {
        padding: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colours.dangerSoft,
    },

    errorMessage: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: "600",
        color: colours.danger,
    },

    submitButton: {
        width: "100%",
        alignItems: "center",
        paddingVertical: 14,
        borderRadius: radius.md,
        backgroundColor: colours.primary,
    },

    submitButtonPressed: {
        backgroundColor: colours.primaryPressed,
    },

    submitButtonDisabled: {
        opacity: 0.55,
    },

    submitButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: colours.surface,
    },
});
