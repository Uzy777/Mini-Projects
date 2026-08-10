import { Pressable, StyleSheet, Text, View } from "react-native";

import type { SessionOutcome } from "../../types/models";
import { colours, radius, spacing } from "@/constants/design";

type SessionOutcomeSelectorProps = {
    selectedOutcome: SessionOutcome | null;
    onSelectOutcome: (outcome: SessionOutcome) => void;
};

type OutcomeOption = {
    value: SessionOutcome;
    label: string;
    description: string;
};

const outcomeOptions: OutcomeOption[] = [
    {
        value: "completed",
        label: "Quest completed",
        description: "The Quest is now fully complete.",
    },
    {
        value: "progressed",
        label: "Made progress",
        description: "You moved the Quest forward.",
    },
    {
        value: "blocked",
        label: "Got blocked",
        description: "Something prevented further progress.",
    },
    {
        value: "stopped",
        label: "Stopped early",
        description: "The session ended before the planned time.",
    },
];

export function SessionOutcomeSelector({ selectedOutcome, onSelectOutcome }: SessionOutcomeSelectorProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>HOW DID IT GO?</Text>

            <Text style={styles.helperText}>Choose the outcome that best describes this Focus Session.</Text>

            <View style={styles.options}>
                {outcomeOptions.map((option) => {
                    const isSelected = selectedOutcome === option.value;

                    return (
                        <Pressable
                            key={option.value}
                            style={({ pressed }) => [styles.option, isSelected && styles.selectedOption, pressed && !isSelected && styles.optionPressed]}
                            onPress={() => onSelectOutcome(option.value)}
                        >
                            <View style={styles.optionHeader}>
                                <Text style={[styles.optionLabel, isSelected && styles.selectedOptionLabel]}>{option.label}</Text>

                                <View style={[styles.selectionCircle, isSelected && styles.selectionCircleSelected]}>
                                    {isSelected && <View style={styles.selectionCircleInner} />}
                                </View>
                            </View>

                            <Text style={[styles.optionDescription, isSelected && styles.selectedOptionDescription]}>{option.description}</Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },

    label: {
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 0.7,
        color: colours.textMuted,
    },

    helperText: {
        marginTop: spacing.xs,
        fontSize: 13,
        lineHeight: 19,
        color: colours.textMuted,
    },

    options: {
        marginTop: spacing.md,
        gap: spacing.sm,
    },

    option: {
        width: "100%",
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colours.border,
        borderRadius: radius.md,
        backgroundColor: colours.surface,
    },

    optionPressed: {
        backgroundColor: colours.background,
    },

    selectedOption: {
        borderColor: colours.primary,
        backgroundColor: colours.primarySoft,
    },

    optionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.md,
    },

    optionLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: "700",
        color: colours.text,
    },

    selectedOptionLabel: {
        color: colours.primary,
    },

    optionDescription: {
        marginTop: spacing.xs,
        paddingRight: 32,
        fontSize: 13,
        lineHeight: 18,
        color: colours.textMuted,
    },

    selectedOptionDescription: {
        color: colours.text,
    },

    selectionCircle: {
        width: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: colours.border,
        borderRadius: radius.pill,
    },

    selectionCircleSelected: {
        borderColor: colours.primary,
    },

    selectionCircleInner: {
        width: 10,
        height: 10,
        borderRadius: radius.pill,
        backgroundColor: colours.primary,
    },
});
