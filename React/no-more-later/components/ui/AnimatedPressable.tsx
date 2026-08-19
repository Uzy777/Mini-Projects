import { useCallback, useState } from "react";
import { Pressable, type PressableProps } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

const MotionPressable = Animated.createAnimatedComponent(Pressable);

type AnimatedPressableProps = Omit<PressableProps, "style"> & {
    style?: PressableProps["style"];
    pressedScale?: number;
    haptic?: "none" | "selection" | "light";
};

export function AnimatedPressable({
    style,
    pressedScale = 0.975,
    haptic = "selection",
    onPressIn,
    onPressOut,
    onHoverIn,
    onHoverOut,
    onFocus,
    onBlur,
    ...props
}: AnimatedPressableProps) {
    const [interactionState, setInteractionState] = useState({ pressed: false, hovered: false, focused: false });
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    const resolvedStyle = typeof style === "function" ? style(interactionState) : style;

    const handlePressIn = useCallback<NonNullable<PressableProps["onPressIn"]>>(
        (event) => {
            setInteractionState((current) => ({ ...current, pressed: true }));
            scale.value = withTiming(pressedScale, { duration: 90 });

            if (haptic === "selection") {
                void Haptics.selectionAsync();
            } else if (haptic === "light") {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }

            onPressIn?.(event);
        },
        [haptic, onPressIn, pressedScale, scale],
    );

    const handlePressOut = useCallback<NonNullable<PressableProps["onPressOut"]>>(
        (event) => {
            setInteractionState((current) => ({ ...current, pressed: false }));
            scale.value = withSpring(1, { damping: 18, stiffness: 260 });
            onPressOut?.(event);
        },
        [onPressOut, scale],
    );

    const handleHoverIn = useCallback<NonNullable<PressableProps["onHoverIn"]>>(
        (event) => {
            setInteractionState((current) => ({ ...current, hovered: true }));
            onHoverIn?.(event);
        },
        [onHoverIn],
    );

    const handleHoverOut = useCallback<NonNullable<PressableProps["onHoverOut"]>>(
        (event) => {
            setInteractionState((current) => ({ ...current, hovered: false, pressed: false }));
            onHoverOut?.(event);
        },
        [onHoverOut],
    );

    const handleFocus = useCallback<NonNullable<PressableProps["onFocus"]>>(
        (event) => {
            setInteractionState((current) => ({ ...current, focused: true }));
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
            style={[resolvedStyle, animatedStyle]}
        />
    );
}
