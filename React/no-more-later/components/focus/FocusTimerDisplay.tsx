import { useEffect, useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import type { TimerStyleId } from "@/types/appearance";
import type { TimerMode } from "@/types/models";

type FocusTimerDisplayProps = {
    seconds: number;
    totalSeconds?: number;
    label?: string;
    hint?: string;
    mode?: TimerMode;
    timerStyleOverride?: TimerStyleId;
    sizeOverride?: number;
    preview?: boolean;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const BLOCK_COUNT = 12;

export function FocusTimerDisplay({
    seconds,
    totalSeconds = seconds,
    label = "FOCUS TIME",
    hint = "Stay with this Quest until the timer ends.",
    mode = "focus",
    timerStyleOverride,
    sizeOverride,
    preview = false,
}: FocusTimerDisplayProps) {
    const { colours, timerStyle: selectedTimerStyle } = useAppearance();
    const { width } = useWindowDimensions();
    const reduceMotion = useReducedMotion();

    const styles = useMemo(() => createStyles(colours), [colours]);
    const timerStyle = timerStyleOverride ?? selectedTimerStyle;
    const tone = getTimerTone(mode, colours);
    const responsiveSize = Math.min(238, Math.max(184, width - 112));
    const size = sizeOverride ?? responsiveSize;
    const strokeWidth = 10;
    const ringRadius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * ringRadius;
    const safeProgress = totalSeconds > 0 ? Math.min(1, Math.max(0, seconds / totalSeconds)) : 0;
    const animatedProgress = useSharedValue(safeProgress);
    const timerState = seconds === totalSeconds ? getReadyLabel(mode) : seconds === 0 ? (mode === "focus" ? "Session complete" : "Break complete") : "Time remaining";

    useEffect(() => {
        animatedProgress.value = reduceMotion
            ? safeProgress
            : withTiming(safeProgress, { duration: 420, easing: Easing.out(Easing.cubic) });
    }, [animatedProgress, reduceMotion, safeProgress]);

    const animatedCircleProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - animatedProgress.value),
    }));

    const animatedBarStyle = useAnimatedStyle<{ width: `${number}%` }>(() => ({
        width: `${animatedProgress.value * 100}%` as `${number}%`,
    }));

    const timerVisual = renderTimerVisual({
        timerStyle,
        formattedTime: formatTime(seconds),
        timerState,
        size,
        ringRadius,
        circumference,
        safeProgress,
        tone,
        colours,
        styles,
        animatedCircleProps,
        animatedBarStyle,
    });

    return (
        <View style={[styles.timerSection, preview && styles.timerSectionPreview]}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            {timerVisual}
            {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
    );
}

type TimerVisualProps = {
    timerStyle: TimerStyleId;
    formattedTime: string;
    timerState: string;
    size: number;
    ringRadius: number;
    circumference: number;
    safeProgress: number;
    tone: ReturnType<typeof getTimerTone>;
    colours: AppColours;
    styles: ReturnType<typeof createStyles>;
    animatedCircleProps: ReturnType<typeof useAnimatedProps>;
    animatedBarStyle: { width: `${number}%` };
};

function renderTimerVisual({ timerStyle, formattedTime, timerState, size, ringRadius, circumference, safeProgress, tone, colours, styles, animatedCircleProps, animatedBarStyle }: TimerVisualProps) {
    const timerCopy = (
        <View style={styles.timerCopy}>
            <Text style={styles.timerText}>{formattedTime}</Text>
            <Text style={[styles.timerState, { color: tone.strong }]}>{timerState}</Text>
        </View>
    );

    if (timerStyle === "minimal") {
        return (
            <View style={styles.minimalContainer}>
                <View style={[styles.minimalMarker, { backgroundColor: tone.active }]} />
                <Text style={styles.minimalTime}>{formattedTime}</Text>
                <Text style={[styles.timerState, { color: tone.strong }]}>{timerState}</Text>
                <View style={[styles.linearTrack, { backgroundColor: tone.track }]}>
                    <Animated.View style={[styles.linearFill, { backgroundColor: tone.active }, animatedBarStyle]} />
                </View>
            </View>
        );
    }

    if (timerStyle === "soft") {
        return (
            <View style={[styles.softContainer, { width: size, height: size, borderColor: tone.track, backgroundColor: tone.soft }]}>
                <View style={[styles.softMarker, { backgroundColor: tone.active }]} />
                {timerCopy}
                <View style={[styles.softProgressTrack, { backgroundColor: tone.track }]}>
                    <Animated.View style={[styles.linearFill, { backgroundColor: tone.active }, animatedBarStyle]} />
                </View>
            </View>
        );
    }

    if (timerStyle === "blocks") {
        const activeBlocks = Math.ceil(safeProgress * BLOCK_COUNT);

        return (
            <View style={[styles.blocksContainer, { borderColor: tone.track, backgroundColor: tone.soft }]}>
                <Text style={styles.blocksTime}>{formattedTime}</Text>
                <Text style={[styles.timerState, { color: tone.strong }]}>{timerState}</Text>
                <View style={styles.blocksRow}>
                    {Array.from({ length: BLOCK_COUNT }, (_, index) => (
                        <View key={index} style={[styles.block, { backgroundColor: index < activeBlocks ? tone.active : tone.track }]} />
                    ))}
                </View>
            </View>
        );
    }

    const isSegmented = timerStyle === "segmented";
    const isConcentric = timerStyle === "concentric";

    return (
        <View style={[styles.timerContainer, isConcentric && { backgroundColor: tone.soft }, { width: size, height: size }]}>
            <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={ringRadius}
                    fill="none"
                    stroke={tone.track}
                    strokeWidth={isSegmented ? 8 : isConcentric ? 6 : 10}
                    strokeDasharray={isSegmented ? "3 10" : undefined}
                    strokeLinecap="round"
                />
                <AnimatedCircle
                    animatedProps={animatedCircleProps}
                    cx={size / 2}
                    cy={size / 2}
                    r={ringRadius}
                    fill="none"
                    stroke={tone.active}
                    strokeWidth={isSegmented ? 8 : isConcentric ? 6 : 10}
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
                {isConcentric ? <Circle cx={size / 2} cy={size / 2} r={ringRadius - 18} fill="none" stroke={tone.active} strokeOpacity={0.32} strokeWidth={2} /> : null}
            </Svg>
            {isConcentric ? <View style={[styles.concentricCore, { borderColor: tone.track }]}>{timerCopy}</View> : timerCopy}
        </View>
    );
}

function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getReadyLabel(mode: TimerMode) {
    if (mode === "break") return "Ready to reset and recharge";
    return "Ready to focus";
}

function getTimerTone(mode: TimerMode, colours: AppColours) {
    if (mode === "break") return { track: colours.successSoft, active: colours.success, strong: colours.success, soft: colours.successSoft };
    return { track: colours.primarySoft, active: colours.primary, strong: colours.primaryStrong, soft: colours.primarySubtle };
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        timerSection: {
            width: "100%",
            marginTop: spacing.xl,
            alignItems: "center",
        },
        timerSectionPreview: {
            marginTop: 0,
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
        },
        hint: {
            marginTop: spacing.sm,
            textAlign: "center",
            fontSize: 13,
            lineHeight: 19,
            color: colours.textMuted,
        },
        minimalContainer: {
            width: "100%",
            maxWidth: 310,
            minHeight: 174,
            marginTop: spacing.md,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: spacing.md,
        },
        minimalMarker: {
            width: 8,
            height: 8,
            marginBottom: spacing.sm,
            borderRadius: radius.pill,
        },
        minimalTime: {
            fontSize: 58,
            lineHeight: 66,
            fontWeight: "800",
            fontVariant: ["tabular-nums"],
            letterSpacing: -2,
            color: colours.text,
        },
        linearTrack: {
            width: "100%",
            height: 6,
            marginTop: spacing.lg,
            overflow: "hidden",
            borderRadius: radius.pill,
        },
        linearFill: {
            height: "100%",
            borderRadius: radius.pill,
        },
        softContainer: {
            marginTop: spacing.md,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderRadius: radius.pill,
        },
        softMarker: {
            position: "absolute",
            top: 18,
            width: 9,
            height: 9,
            borderRadius: radius.pill,
        },
        softProgressTrack: {
            position: "absolute",
            bottom: 26,
            width: "46%",
            height: 4,
            overflow: "hidden",
            borderRadius: radius.pill,
        },
        blocksContainer: {
            width: "100%",
            maxWidth: 330,
            minHeight: 188,
            marginTop: spacing.md,
            alignItems: "center",
            justifyContent: "center",
            padding: spacing.lg,
            borderWidth: 1,
            borderRadius: radius.xl,
        },
        blocksTime: {
            fontSize: 52,
            lineHeight: 60,
            fontWeight: "900",
            fontVariant: ["tabular-nums"],
            letterSpacing: 1,
            color: colours.text,
        },
        blocksRow: {
            width: "100%",
            flexDirection: "row",
            gap: 4,
            marginTop: spacing.lg,
        },
        block: {
            flex: 1,
            height: 7,
            borderRadius: radius.pill,
        },
        concentricCore: {
            width: "72%",
            height: "72%",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderRadius: radius.pill,
            backgroundColor: colours.surface,
        },
    });
}
