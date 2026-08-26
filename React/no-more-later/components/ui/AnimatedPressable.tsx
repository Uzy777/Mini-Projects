import { useCallback, useRef, useState } from "react";
import { Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

import { useAppearance } from "@/contexts/AppearanceContext";

const MotionPressable = Animated.createAnimatedComponent(Pressable);

export type AnimatedPressableState = {
    pressed: boolean;
    hovered: boolean;
    focused: boolean;
};

type AnimatedPressableProps = Omit<PressableProps, "style"> & {
    style?: StyleProp<ViewStyle> | ((state: AnimatedPressableState) => StyleProp<ViewStyle>);
    pressedScale?: number;
    haptic?: "none" | "selection" | "light";
};

export function AnimatedPressable({
    style,
    pressedScale = 1,
    haptic = "selection",
    onPressIn,
    onPressOut,
    onHoverIn,
    onHoverOut,
    onFocus,
    onBlur,
    ...props
}: AnimatedPressableProps) {
    const { colours } = useAppearance();
    const reduceMotion = useReducedMotion();
    const pointerInteractionRef = useRef(false);
    const [interactionState, setInteractionState] = useState<AnimatedPressableState>({ pressed: false, hovered: false, focused: false });
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    const resolvedStyle = typeof style === "function" ? style(interactionState) : style;
    const webInteractionStyle = Platform.OS === "web"
        ? ({ cursor: props.disabled ? "default" : "pointer" } as unknown as ViewStyle)
        : undefined;
    const webFocusStyle = Platform.OS === "web" && interactionState.focused
        ? ({ outlineColor: colours.primaryBorder, outlineOffset: -2, outlineStyle: "solid", outlineWidth: 1 } as unknown as ViewStyle)
        : undefined;

    const handlePressIn = useCallback<NonNullable<PressableProps["onPressIn"]>>(
        (event) => {
            if (Platform.OS === "web") {
                pointerInteractionRef.current = true;
            }
            setInteractionState((current) => ({ ...current, pressed: true, focused: Platform.OS === "web" ? false : current.focused }));
            if (!reduceMotion) {
                scale.value = withTiming(pressedScale, { duration: 90 });
            }

            if (Platform.OS !== "web" && haptic === "selection") {
                void Haptics.selectionAsync();
            } else if (Platform.OS !== "web" && haptic === "light") {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }

            onPressIn?.(event);
        },
        [haptic, onPressIn, pressedScale, reduceMotion, scale],
    );

    const handlePressOut = useCallback<NonNullable<PressableProps["onPressOut"]>>(
        (event) => {
            setInteractionState((current) => ({ ...current, pressed: false }));
            scale.value = reduceMotion ? 1 : withTiming(interactionState.hovered ? 1.008 : 1, { duration: 100 });
            pointerInteractionRef.current = false;
            onPressOut?.(event);
        },
        [interactionState.hovered, onPressOut, reduceMotion, scale],
    );

    const handleHoverIn = useCallback<NonNullable<PressableProps["onHoverIn"]>>(
        (event) => {
            setInteractionState((current) => ({ ...current, hovered: true }));
            if (!reduceMotion && !interactionState.pressed) {
                scale.value = withTiming(1.008, { duration: 120 });
            }
            onHoverIn?.(event);
        },
        [interactionState.pressed, onHoverIn, reduceMotion, scale],
    );

    const handleHoverOut = useCallback<NonNullable<PressableProps["onHoverOut"]>>(
        (event) => {
            setInteractionState((current) => ({ ...current, hovered: false, pressed: false }));
            scale.value = reduceMotion ? 1 : withTiming(1, { duration: 120 });
            onHoverOut?.(event);
        },
        [onHoverOut, reduceMotion, scale],
    );

    const handleFocus = useCallback<NonNullable<PressableProps["onFocus"]>>(
        (event) => {
            setInteractionState((current) => ({ ...current, focused: !pointerInteractionRef.current }));
            onFocus?.(event);
        },
        [onFocus],
    );

    const handleBlur = useCallback<NonNullable<PressableProps["onBlur"]>>(
        (event) => {
            setInteractionState((current) => ({ ...current, focused: false, pressed: false }));
            onBlur?.(event);
        },
        [onBlur],
    );

    return (
        <MotionPressable
            {...props}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onHoverIn={handleHoverIn}
            onHoverOut={handleHoverOut}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={[webInteractionStyle, webFocusStyle, resolvedStyle, animatedStyle]}
        />
    );
}
