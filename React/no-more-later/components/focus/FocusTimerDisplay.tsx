import { useEffect, useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from "react-native-reanimated";

import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
type FocusTimerDisplayProps = {
    seconds: number;
    totalSeconds?: number;
    label?: string;
    hint?: string;
};

function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);

    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function FocusTimerDisplay({ seconds, totalSeconds = seconds, label = "FOCUS TIME", hint = "Stay with this Quest until the timer ends." }: FocusTimerDisplayProps) {
    const { colours } = useAppearance();
    const { width } = useWindowDimensions();

    const styles = useMemo(() => createStyles(colours), [colours]);
    const size = Math.min(238, Math.max(184, width - 112));
    const strokeWidth = 10;
    const ringRadius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * ringRadius;
    const safeProgress = totalSeconds > 0 ? Math.min(1, Math.max(0, seconds / totalSeconds)) : 0;
    const animatedProgress = useSharedValue(safeProgress);

    useEffect(() => {
        animatedProgress.value = withTiming(safeProgress, { duration: 420, easing: Easing.out(Easing.cubic) });
    }, [animatedProgress, safeProgress]);

    const animatedCircleProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - animatedProgress.value),
    }));

    return (
        <View style={styles.timerSection}>
            <Text style={styles.label}>{label}</Text>

            <View style={[styles.timerContainer, { width: size, height: size }]}>
                <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
                    <Circle cx={size / 2} cy={size / 2} r={ringRadius} fill="none" stroke={colours.primarySoft} strokeWidth={strokeWidth} />
                    <AnimatedCircle
                        animatedProps={animatedCircleProps}
                        cx={size / 2}
                        cy={size / 2}
                        r={ringRadius}
                        fill="none"
                        stroke={colours.primary}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={`${circumference} ${circumference}`}
                        rotation="-90"
                        origin={`${size / 2}, ${size / 2}`}
                    />
                </Svg>
                <View style={styles.timerCopy}>
                    <Text style={styles.timerText}>{formatTime(seconds)}</Text>
                    <Text style={styles.timerState}>{seconds === totalSeconds ? "Ready to focus" : seconds === 0 ? "Session complete" : "Time remaining"}</Text>
                </View>
            </View>

            <Text style={styles.hint}>{hint}</Text>
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        timerSection: {
            width: "100%",
            marginTop: spacing.xl,
            alignItems: "center",
        },

        label: {
            alignSelf: "flex-start",
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 0.7,
            color: colours.textMuted,
        },

        timerContainer: {
            marginTop: spacing.md,
            borderRadius: radius.pill,
            alignItems: "center",
            justifyContent: "center",
        },

        timerCopy: {
            alignItems: "center",
            justifyContent: "center",
        },

        timerText: {
            fontSize: 48,
            lineHeight: 56,
            fontWeight: "900",
            fontVariant: ["tabular-nums"],
            letterSpacing: -1,
            color: colours.text,
        },

        timerState: {
            marginTop: 2,
            fontSize: 11,
            fontWeight: "700",
            color: colours.textMuted,
        },

        hint: {
            marginTop: spacing.sm,
            textAlign: "center",
            fontSize: 13,
            lineHeight: 19,
            color: colours.textMuted,
        },
    });
}
