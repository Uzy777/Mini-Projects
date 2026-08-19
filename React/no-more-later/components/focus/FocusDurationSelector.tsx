import { StyleSheet, Text, View } from "react-native";

import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import { useMemo } from "react";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";

type FocusDurationSelectorProps = {
    selectedMinutes: number;
    disabled?: boolean;
    onSelectMinutes: (minutes: number) => void;
};

const focusDurations = [15, 25, 50];

export function FocusDurationSelector({ selectedMinutes, disabled = false, onSelectMinutes }: FocusDurationSelectorProps) {
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>SESSION LENGTH</Text>

            <View style={[styles.durationOptions, disabled && styles.durationOptionsDisabled]}>
                {focusDurations.map((minutes) => {
                    const isSelected = selectedMinutes === minutes;

                    return (
                        <AnimatedPressable
                            key={minutes}
                            style={({ pressed }) => [
                                styles.durationButton,

                                isSelected && styles.selectedDurationButton,

                                pressed && !disabled && !isSelected && styles.durationButtonPressed,
                            ]}
                            onPress={() => onSelectMinutes(minutes)}
                            disabled={disabled}
                        >
                            <Text style={[styles.durationButtonText, isSelected && styles.selectedDurationButtonText]}>{minutes} min</Text>
                        </AnimatedPressable>
                    );
                })}
            </View>
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        container: {
            width: "100%",
        },

        label: {
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 0.7,
            color: colours.textMuted,
        },

        durationOptions: {
            width: "100%",
            flexDirection: "row",
            gap: spacing.xs,
            marginTop: spacing.sm,
            padding: spacing.xs,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,
            backgroundColor: colours.primarySubtle,
        },

        durationOptionsDisabled: {
            opacity: 0.6,
        },

        durationButton: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 12,
            paddingHorizontal: spacing.sm,
            borderRadius: radius.sm,
        },

        durationButtonPressed: {
            backgroundColor: colours.background,
        },

        selectedDurationButton: {
            backgroundColor: colours.primary,
        },

        durationButtonText: {
            fontSize: 14,
            fontWeight: "700",
            color: colours.textMuted,
        },

        selectedDurationButtonText: {
            color: colours.onPrimary,
        },
    });
}
