import { Pressable, StyleSheet, Text, View } from "react-native";

import type { SessionOutcome } from "../../types/models";

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
            <Text style={styles.label}>Session outcome</Text>

            <View style={styles.options}>
                {outcomeOptions.map((option) => {
                    const isSelected = selectedOutcome === option.value;

                    return (
                        <Pressable
                            key={option.value}
                            style={[styles.option, isSelected && styles.selectedOption]}
                            onPress={() => onSelectOutcome(option.value)}
                        >
                            <Text style={[styles.optionLabel, isSelected && styles.selectedOptionLabel]}>{option.label}</Text>

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
        marginTop: 24,
    },
    label: {
        marginBottom: 10,
        fontSize: 14,
        fontWeight: "600",
        color: "#555555",
    },
    options: {
        gap: 10,
    },
    option: {
        width: "100%",
        padding: 14,
        borderWidth: 1,
        borderColor: "#cccccc",
        borderRadius: 10,
        backgroundColor: "#ffffff",
    },
    selectedOption: {
        borderColor: "#222222",
        backgroundColor: "#222222",
    },
    optionLabel: {
        fontSize: 15,
        fontWeight: "700",
        color: "#222222",
    },
    selectedOptionLabel: {
        color: "#ffffff",
    },
    optionDescription: {
        marginTop: 4,
        fontSize: 13,
        lineHeight: 18,
        color: "#666666",
    },
    selectedOptionDescription: {
        color: "#dddddd",
    },
});
