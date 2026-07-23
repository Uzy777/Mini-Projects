import { Pressable, StyleSheet, Text, View } from "react-native";

type FocusDurationSelectorProps = {
    selectedMinutes: number;
    disabled?: boolean;
    onSelectMinutes: (minutes: number) => void;
};

const focusDurations = [15, 25, 50];

export function FocusDurationSelector({ selectedMinutes, disabled = false, onSelectMinutes }: FocusDurationSelectorProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Choose a duration</Text>

            <View style={styles.durationOptions}>
                {focusDurations.map((minutes) => {
                    const isSelected = selectedMinutes === minutes;

                    return (
                        <Pressable
                            key={minutes}
                            style={[styles.durationButton, isSelected && styles.selectedDurationButton, disabled && styles.disabledDurationButton]}
                            onPress={() => onSelectMinutes(minutes)}
                            disabled={disabled}
                        >
                            <Text
                                style={[
                                    styles.durationButtonText,
                                    isSelected && styles.selectedDurationButtonText,
                                    disabled && styles.disabledDurationButtonText,
                                ]}
                            >
                                {minutes} min
                            </Text>
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
        fontSize: 14,
        fontWeight: "600",
        color: "#555555",
    },
    durationOptions: {
        marginTop: 12,
        flexDirection: "row",
        gap: 10,
    },
    durationButton: {
        flex: 1,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "#cccccc",
        borderRadius: 8,
        alignItems: "center",
        backgroundColor: "#ffffff",
    },
    selectedDurationButton: {
        borderColor: "#222222",
        backgroundColor: "#222222",
    },
    durationButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#222222",
    },
    selectedDurationButtonText: {
        color: "#ffffff",
    },
    disabledDurationButton: {
        opacity: 0.5,
    },
    disabledDurationButtonText: {
        opacity: 0.8,
    },
});
