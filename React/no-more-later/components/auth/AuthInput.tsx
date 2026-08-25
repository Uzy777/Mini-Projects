import { useMemo, useState } from "react";
import { StyleSheet, Text, View, type KeyboardTypeOptions } from "react-native";
import { Eye, EyeOff, type LucideIcon } from "lucide-react-native";

import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { AppTextInput, getInputFocusStyle } from "@/components/ui/AppTextInput";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";

type AuthInputProps = {
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    placeholder: string;

    colours: AppColours;

    icon: LucideIcon;

    required?: boolean;
    secureTextEntry?: boolean;
    keyboardType?: KeyboardTypeOptions;
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    autoCorrect?: boolean;
    maxLength?: number;
};

export function AuthInput({
    label,
    value,
    onChangeText,
    placeholder,
    colours,
    icon: Icon,
    required = false,
    secureTextEntry = false,
    keyboardType,
    autoCapitalize,
    autoCorrect,
    maxLength,
}: AuthInputProps) {
    const styles = useMemo(() => createStyles(colours), [colours]);

    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const shouldHidePassword = secureTextEntry && !isPasswordVisible;

    return (
        <View style={styles.field}>
            <Text style={styles.label}>
                {label}

                {required ? <Text style={styles.required}> *</Text> : null}
            </Text>

            <View style={[styles.inputShell, isFocused && styles.inputShellFocused]}>
                <Icon size={18} strokeWidth={2} color={isFocused ? colours.primary : colours.textMuted} />

                <AppTextInput
                    variant="bare"
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colours.textMuted}
                    secureTextEntry={shouldHidePassword}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={autoCorrect}
                    maxLength={maxLength}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />

                {secureTextEntry ? (
                    <AnimatedPressable
                        accessibilityRole="button"
                        accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
                        haptic="none"
                        pressedScale={0.92}
                        onPress={() => setIsPasswordVisible((current) => !current)}
                        style={styles.visibilityButton}
                    >
                        {isPasswordVisible ? <EyeOff size={18} color={colours.textMuted} /> : <Eye size={18} color={colours.textMuted} />}
                    </AnimatedPressable>
                ) : null}
            </View>
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        field: {
            gap: spacing.sm,
        },

        label: {
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 0.8,
            color: colours.textMuted,
        },

        required: {
            color: colours.danger,
        },

        inputShell: {
            minHeight: 52,

            flexDirection: "row",
            alignItems: "center",

            gap: spacing.sm,

            paddingHorizontal: spacing.md,

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,

            backgroundColor: colours.background,
        },

        inputShellFocused: getInputFocusStyle(colours),

        input: {
            minWidth: 0,
            flex: 1,

            paddingVertical: 13,

            fontSize: 15,
            color: colours.text,
        },

        visibilityButton: {
            width: 34,
            height: 34,

            alignItems: "center",
            justifyContent: "center",

            borderRadius: radius.pill,
        },
    });
}
