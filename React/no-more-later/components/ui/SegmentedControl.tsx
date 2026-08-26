import { useMemo, type ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

export type SegmentedControlOption<T extends string> = {
    value: T;
    label: string;
    icon?: (selected: boolean) => ReactNode;
    accessibilityLabel?: string;
};

type SegmentedControlProps<T extends string> = {
    value: T;
    options: readonly SegmentedControlOption<T>[];
    onChange: (value: T) => void;
    compact?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
};

export function SegmentedControl<T extends string>({ value, options, onChange, compact = false, disabled = false, style }: SegmentedControlProps<T>) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours, compact), [colours, compact]);

    return (
        <View accessibilityRole="tablist" style={[styles.control, disabled && styles.disabled, style]}>
            {options.map((option) => {
                const selected = option.value === value;

                return (
                    <AnimatedPressable
                        key={option.value}
                        accessibilityLabel={option.accessibilityLabel}
                        accessibilityRole="tab"
                        accessibilityState={{ selected, disabled }}
                        disabled={disabled}
                        haptic="selection"
                        pressedScale={0.985}
                        onPress={() => onChange(option.value)}
                        style={({ hovered, pressed }) => [
                            styles.option,
                            selected && styles.optionSelected,
                            !selected && hovered && styles.optionHovered,
                            pressed && styles.optionPressed,
                        ]}
                    >
                        {option.icon?.(selected)}
                        <Text numberOfLines={1} style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
                    </AnimatedPressable>
                );
            })}
        </View>
    );
}

function createStyles(colours: AppColours, compact: boolean) {
    return StyleSheet.create({
        control: {
            width: "100%",
            padding: 4,
            flexDirection: "row",
            gap: 4,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,
            backgroundColor: colours.surface,
        },
        disabled: { opacity: 0.6 },
        option: {
            minWidth: 0,
            minHeight: compact ? 48 : 40,
            flex: 1,
            flexDirection: compact ? "column" : "row",
            alignItems: "center",
            justifyContent: "center",
            gap: compact ? 2 : 6,
            paddingHorizontal: spacing.sm,
            borderWidth: 1,
            borderColor: "transparent",
            borderRadius: radius.sm,
        },
        optionSelected: {
            borderColor: colours.primaryBorder,
            backgroundColor: colours.primarySoft,
        },
        optionHovered: { backgroundColor: colours.primarySubtle },
        optionPressed: { opacity: 0.78 },
        label: {
            minWidth: 0,
            flexShrink: 1,
            fontSize: compact ? 10 : 12,
            fontWeight: "700",
            textAlign: "center",
            color: colours.textMuted,
        },
        labelSelected: { color: colours.primaryStrong },
    });
}
