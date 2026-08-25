import { forwardRef, useMemo, useState } from "react";
import {
    Platform,
    TextInput,
    type TextInputProps,
    type TextStyle,
} from "react-native";

import type { AppColours } from "@/constants/appearanceColours";
import { useAppearance } from "@/contexts/AppearanceContext";

type AppTextInputProps = TextInputProps & {
    variant?: "field" | "bare";
};

export const AppTextInput = forwardRef<TextInput, AppTextInputProps>(function AppTextInput(
    { onBlur, onFocus, selectionColor, style, variant = "field", ...props },
    ref,
) {
    const { colours } = useAppearance();
    const [isFocused, setIsFocused] = useState(false);
    const focusStyle = useMemo(() => getInputFocusStyle(colours), [colours]);

    return (
        <TextInput
            ref={ref}
            {...props}
            onBlur={(event) => {
                setIsFocused(false);
                onBlur?.(event);
            }}
            onFocus={(event) => {
                setIsFocused(true);
                onFocus?.(event);
            }}
            selectionColor={selectionColor ?? colours.primary}
            style={[webInputReset, style, variant === "field" && isFocused && focusStyle]}
        />
    );
});

export function getInputFocusStyle(colours: Pick<AppColours, "primary" | "primarySubtle">) {
    return {
        borderColor: colours.primary,
        backgroundColor: colours.primarySubtle,
    };
}

const webInputReset = Platform.OS === "web"
    ? ({
        outlineColor: "transparent",
        outlineStyle: "none",
        outlineWidth: 0,
        boxShadow: "none",
    } as unknown as TextStyle)
    : undefined;
