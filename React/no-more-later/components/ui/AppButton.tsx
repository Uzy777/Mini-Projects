import { useMemo, type ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

type AppButtonProps = {
    label: string;
    onPress: () => void;
    icon?: ReactNode;
    trailingIcon?: ReactNode;
    variant?: "primary" | "secondary" | "soft" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    style?: StyleProp<ViewStyle>;
};

export function AppButton({
    label,
    onPress,
    icon,
    trailingIcon,
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    fullWidth = false,
    style,
}: AppButtonProps) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const isDisabled = disabled || loading;

    return (
        <AnimatedPressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled }}
            disabled={isDisabled}
            haptic={variant === "primary" ? "light" : "selection"}
            onPress={onPress}
            style={[
                styles.button,
                styles[`${variant}Button`],
                styles[`${size}Button`],
                fullWidth && styles.fullWidth,
                isDisabled && styles.disabled,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator size="small" color={variant === "primary" ? colours.onPrimary : colours.primary} />
            ) : (
                <View style={styles.content}>
                    {icon}
                    <Text style={[styles.label, styles[`${variant}Label`], styles[`${size}Label`]]}>{label}</Text>
                    {trailingIcon}
                </View>
            )}
        </AnimatedPressable>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        button: {
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderRadius: radius.md,
        },
        content: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
        },
        fullWidth: { width: "100%" },
        disabled: { opacity: 0.5 },
        smButton: { minHeight: 36, paddingHorizontal: 12 },
        mdButton: { minHeight: 44, paddingHorizontal: spacing.md },
        lgButton: { minHeight: 50, paddingHorizontal: spacing.lg },
        primaryButton: { borderColor: colours.primary, backgroundColor: colours.primary },
        secondaryButton: { borderColor: colours.border, backgroundColor: colours.surface },
        softButton: { borderColor: colours.primaryBorder, backgroundColor: colours.primarySoft },
        ghostButton: { borderColor: "transparent", backgroundColor: "transparent" },
        dangerButton: { borderColor: colours.danger, backgroundColor: colours.danger },
        label: { fontWeight: "800", textAlign: "center" },
        smLabel: { fontSize: 12 },
        mdLabel: { fontSize: 14 },
        lgLabel: { fontSize: 15 },
        primaryLabel: { color: colours.onPrimary },
        secondaryLabel: { color: colours.text },
        softLabel: { color: colours.primaryStrong },
        ghostLabel: { color: colours.primary },
        dangerLabel: { color: "#ffffff" },
    });
}
