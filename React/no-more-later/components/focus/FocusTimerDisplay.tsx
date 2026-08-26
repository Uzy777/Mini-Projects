import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, { cancelAnimation, Easing, Extrapolation, interpolate, useAnimatedProps, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming, type SharedValue } from "react-native-reanimated";

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
const PULSE_BAR_HEIGHTS = [14, 22, 32, 46, 60, 42, 28, 50, 64, 48, 34, 24, 16];

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
            : withTiming(safeProgress, { duration: 900, easing: Easing.linear });
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
        animatedProgress,
        reduceMotion,
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
    animatedProgress: SharedValue<number>;
    reduceMotion: boolean;
};

function renderTimerVisual({ timerStyle, formattedTime, timerState, size, ringRadius, circumference, safeProgress, tone, colours, styles, animatedCircleProps, animatedBarStyle, animatedProgress, reduceMotion }: TimerVisualProps) {
    const timerCopy = (
        <View style={styles.timerCopy}>
            <Text style={styles.timerText}>{formattedTime}</Text>
            <Text style={[styles.timerState, { color: tone.strong }]}>{timerState}</Text>
        </View>
    );

    if (timerStyle === "minimal") {
        return (
            <View style={styles.minimalContainer}>
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
            <View style={[styles.flipClockContainer, { borderColor: tone.track, backgroundColor: tone.soft }]}>
                <View style={styles.flipClockHeader}>
                    <Text style={[styles.flipClockEyebrow, { color: tone.strong }]}>FLIP CLOCK</Text>
                    <Text style={styles.flipClockState}>{timerState}</Text>
                </View>
                <FlipClock time={formattedTime} reduceMotion={reduceMotion} colours={colours} tone={tone} styles={styles} />
                <View style={[styles.flipClockRail, { backgroundColor: tone.track }]}>
                    <Animated.View style={[styles.flipClockRailFill, { backgroundColor: tone.active }, animatedBarStyle]} />
                </View>
            </View>
        );
    }

    if (timerStyle === "blocks") {
        const [minutes, seconds] = formattedTime.split(":");

        return (
            <View style={[styles.blocksContainer, { borderColor: tone.track, backgroundColor: tone.soft }]}>
                <View style={styles.blocksHeader}>
                    <Text style={[styles.blocksEyebrow, { color: tone.strong }]}>DIGITAL FOCUS</Text>
                    <Text style={styles.blocksState}>{timerState}</Text>
                </View>
                <View style={styles.digitalTimeRow}>
                    <View style={[styles.digitalTile, { borderColor: tone.track, backgroundColor: colours.surface }]}>
                        <Text style={styles.digitalValue}>{minutes}</Text>
                        <Text style={styles.digitalUnit}>MIN</Text>
                    </View>
                    <Text style={[styles.digitalSeparator, { color: tone.active }]}>:</Text>
                    <View style={[styles.digitalTile, { borderColor: tone.track, backgroundColor: colours.surface }]}>
                        <Text style={styles.digitalValue}>{seconds}</Text>
                        <Text style={styles.digitalUnit}>SEC</Text>
                    </View>
                </View>
                <View style={styles.blocksRow}>
                    {Array.from({ length: BLOCK_COUNT }, (_, index) => (
                        <ProgressBlock key={index} index={index} progress={animatedProgress} trackColor={tone.track} activeColor={tone.active} styles={styles} />
                    ))}
                </View>
                <View style={styles.blocksMeta}>
                    <Text style={styles.blocksMetaText}>SESSION</Text>
                    <Text style={styles.blocksMetaText}>{Math.round(safeProgress * 100)}% LEFT</Text>
                </View>
            </View>
        );
    }

    const isSegmented = timerStyle === "segmented";
    const isConcentric = timerStyle === "concentric";

    if (isSegmented) {
        return (
            <View style={[styles.pulseContainer, { borderColor: tone.track, backgroundColor: tone.soft }]}>
                <View style={styles.pulseHeader}>
                    <Text style={[styles.pulseEyebrow, { color: tone.strong }]}>FOCUS PULSE</Text>
                    <Text style={[styles.pulsePercent, { color: tone.strong }]}>{Math.round(safeProgress * 100)}%</Text>
                </View>
                <Text style={styles.pulseTime}>{formattedTime}</Text>
                <Text style={styles.pulseState}>{timerState}</Text>
                <View style={styles.pulseWave}>
                    {PULSE_BAR_HEIGHTS.map((height, index) => (
                        <PulseBar
                            key={index}
                            index={index}
                            height={height}
                            progress={animatedProgress}
                            trackColor={tone.track}
                            activeColor={tone.active}
                            styles={styles}
                        />
                    ))}
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.timerContainer, isConcentric && { backgroundColor: tone.soft }, { width: size, height: size }]}>
            <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={ringRadius}
                    fill="none"
                    stroke={tone.track}
                    strokeWidth={isConcentric ? 6 : 10}
                    strokeLinecap="round"
                />
                <AnimatedCircle
                    animatedProps={animatedCircleProps}
                    cx={size / 2}
                    cy={size / 2}
                    r={ringRadius}
                    fill="none"
                    stroke={tone.active}
                    strokeWidth={isConcentric ? 6 : 10}
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

function FlipClock({
    time,
    reduceMotion,
    colours,
    tone,
    styles,
}: {
    time: string;
    reduceMotion: boolean;
    colours: AppColours;
    tone: ReturnType<typeof getTimerTone>;
    styles: ReturnType<typeof createStyles>;
}) {
    const [minutes, seconds] = time.split(":");
    const compact = minutes.length > 2;

    return (
        <View style={styles.flipClockRow} accessible accessibilityLabel={time}>
            {minutes.split("").map((digit, index) => (
                <FlipDigit key={`minute-${minutes.length - index}`} digit={digit} compact={compact} reduceMotion={reduceMotion} colours={colours} tone={tone} styles={styles} />
            ))}
            <View style={styles.flipClockColon}>
                <View style={[styles.flipClockColonDot, { backgroundColor: tone.active }]} />
                <View style={[styles.flipClockColonDot, { backgroundColor: tone.active }]} />
            </View>
            {seconds.split("").map((digit, index) => (
                <FlipDigit key={`second-${index}`} digit={digit} compact={compact} reduceMotion={reduceMotion} colours={colours} tone={tone} styles={styles} />
            ))}
        </View>
    );
}

function FlipDigit({
    digit,
    compact,
    reduceMotion,
    colours,
    tone,
    styles,
}: {
    digit: string;
    compact: boolean;
    reduceMotion: boolean;
    colours: AppColours;
    tone: ReturnType<typeof getTimerTone>;
    styles: ReturnType<typeof createStyles>;
}) {
    const lastDigit = useRef(digit);
    const [previousDigit, setPreviousDigit] = useState(digit);
    const [currentDigit, setCurrentDigit] = useState(digit);
    const flipProgress = useSharedValue(1);

    useEffect(() => {
        if (lastDigit.current === digit) return;

        cancelAnimation(flipProgress);
        flipProgress.value = 0;
        setPreviousDigit(lastDigit.current);
        setCurrentDigit(digit);
        lastDigit.current = digit;
    }, [digit, flipProgress]);

    useEffect(() => {
        if (currentDigit === previousDigit) return;

        flipProgress.value = reduceMotion
            ? 1
            : withTiming(1, { duration: 720, easing: Easing.bezier(0.22, 0.72, 0.28, 1) });
    }, [currentDigit, flipProgress, previousDigit, reduceMotion]);

    const outgoingStyle = useAnimatedStyle(() => ({
        opacity: interpolate(flipProgress.value, [0.48, 0.54], [1, 0], Extrapolation.CLAMP),
        transform: [
            { perspective: 900 },
            { rotateX: `${interpolate(flipProgress.value, [0, 0.52], [0, -90], Extrapolation.CLAMP)}deg` },
        ],
    }));

    const incomingStyle = useAnimatedStyle(() => ({
        opacity: interpolate(flipProgress.value, [0.44, 0.52], [0, 1], Extrapolation.CLAMP),
        transform: [
            { perspective: 900 },
            { rotateX: `${interpolate(flipProgress.value, [0.46, 1], [90, 0], Extrapolation.CLAMP)}deg` },
        ],
    }));

    return (
        <View style={[styles.flipDigit, compact && styles.flipDigitCompact, { borderColor: tone.track, backgroundColor: colours.surface }]} accessible={false}>
            <Animated.View style={[styles.flipDigitFace, { backgroundColor: colours.surface }, outgoingStyle]}>
                <Text style={[styles.flipDigitText, compact && styles.flipDigitTextCompact]}>{previousDigit}</Text>
            </Animated.View>
            <Animated.View style={[styles.flipDigitFace, { backgroundColor: colours.surface }, incomingStyle]}>
                <Text style={[styles.flipDigitText, compact && styles.flipDigitTextCompact]}>{currentDigit}</Text>
            </Animated.View>
        </View>
    );
}

function PulseBar({
    index,
    height,
    progress,
    trackColor,
    activeColor,
    styles,
}: {
    index: number;
    height: number;
    progress: SharedValue<number>;
    trackColor: string;
    activeColor: string;
    styles: ReturnType<typeof createStyles>;
}) {
    const animatedFillStyle = useAnimatedStyle<{ height: `${number}%` }>(() => {
        const barProgress = Math.min(1, Math.max(0, progress.value * PULSE_BAR_HEIGHTS.length - index));

        return { height: `${barProgress * 100}%` as `${number}%` };
    });

    return (
        <View style={[styles.pulseBarTrack, { height, backgroundColor: trackColor }]}>
            <Animated.View style={[styles.pulseBarFill, { backgroundColor: activeColor }, animatedFillStyle]} />
        </View>
    );
}

function ProgressBlock({
    index,
    progress,
    trackColor,
    activeColor,
    styles,
}: {
    index: number;
    progress: SharedValue<number>;
    trackColor: string;
    activeColor: string;
    styles: ReturnType<typeof createStyles>;
}) {
    const animatedFillStyle = useAnimatedStyle<{ width: `${number}%` }>(() => {
        const blockProgress = Math.min(1, Math.max(0, progress.value * BLOCK_COUNT - index));

        return { width: `${blockProgress * 100}%` as `${number}%` };
    });

    return (
        <View style={[styles.blockTrack, { backgroundColor: trackColor }]}>
            <Animated.View style={[styles.blockFill, { backgroundColor: activeColor }, animatedFillStyle]} />
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
        flipClockContainer: {
            width: "100%",
            maxWidth: 342,
            minHeight: 220,
            marginTop: spacing.md,
            padding: spacing.lg,
            borderWidth: 1,
            borderRadius: radius.xl,
            shadowColor: colours.primaryStrong,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.09,
            shadowRadius: 20,
            elevation: 2,
        },
        flipClockHeader: {
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.sm,
        },
        flipClockEyebrow: {
            fontSize: 9,
            fontWeight: "900",
            letterSpacing: 1.3,
        },
        flipClockState: {
            flexShrink: 1,
            fontSize: 10,
            fontWeight: "700",
            textAlign: "right",
            color: colours.textMuted,
        },
        flipClockRow: {
            width: "100%",
            marginTop: spacing.lg,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
        },
        flipDigit: {
            width: 54,
            height: 82,
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderRadius: radius.md,
        },
        flipDigitCompact: {
            width: 44,
        },
        flipDigitFace: {
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 2,
            alignItems: "center",
            justifyContent: "center",
            backfaceVisibility: "hidden",
        },
        flipDigitText: {
            textAlign: "center",
            fontSize: 55,
            lineHeight: 82,
            fontWeight: "900",
            fontVariant: ["tabular-nums"],
            letterSpacing: -2,
            color: colours.text,
        },
        flipDigitTextCompact: {
            fontSize: 48,
            letterSpacing: -1.5,
        },
        flipClockColon: {
            width: 10,
            height: 34,
            alignItems: "center",
            justifyContent: "space-between",
            marginHorizontal: 1,
        },
        flipClockColonDot: {
            width: 6,
            height: 6,
            borderRadius: radius.pill,
        },
        flipClockRail: {
            width: "100%",
            height: 4,
            marginTop: spacing.lg,
            overflow: "hidden",
            borderRadius: radius.pill,
        },
        flipClockRailFill: {
            height: "100%",
            borderRadius: radius.pill,
        },
        pulseContainer: {
            width: "100%",
            maxWidth: 342,
            minHeight: 232,
            marginTop: spacing.md,
            padding: spacing.lg,
            borderWidth: 1,
            borderRadius: radius.xl,
        },
        pulseHeader: {
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        pulseEyebrow: {
            fontSize: 9,
            fontWeight: "900",
            letterSpacing: 1.3,
        },
        pulsePercent: {
            fontSize: 11,
            fontWeight: "900",
            fontVariant: ["tabular-nums"],
        },
        pulseTime: {
            marginTop: spacing.md,
            fontSize: 50,
            lineHeight: 57,
            fontWeight: "900",
            fontVariant: ["tabular-nums"],
            letterSpacing: -1.8,
            color: colours.text,
        },
        pulseState: {
            marginTop: 1,
            fontSize: 10,
            lineHeight: 14,
            fontWeight: "700",
            color: colours.textMuted,
        },
        pulseWave: {
            width: "100%",
            height: 66,
            marginTop: spacing.md,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 6,
        },
        pulseBarTrack: {
            flex: 1,
            maxWidth: 12,
            overflow: "hidden",
            justifyContent: "flex-end",
            borderRadius: radius.pill,
        },
        pulseBarFill: {
            width: "100%",
            borderRadius: radius.pill,
        },
        blocksContainer: {
            width: "100%",
            maxWidth: 342,
            minHeight: 236,
            marginTop: spacing.md,
            padding: spacing.lg,
            borderWidth: 1,
            borderRadius: radius.xl,
        },
        blocksHeader: {
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.sm,
        },
        blocksEyebrow: {
            fontSize: 9,
            fontWeight: "900",
            letterSpacing: 1.2,
        },
        blocksState: {
            flexShrink: 1,
            fontSize: 10,
            fontWeight: "700",
            textAlign: "right",
            color: colours.textMuted,
        },
        digitalTimeRow: {
            width: "100%",
            marginTop: spacing.md,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
        },
        digitalTile: {
            flex: 1,
            minHeight: 92,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderRadius: radius.lg,
        },
        digitalValue: {
            fontSize: 42,
            lineHeight: 46,
            fontWeight: "900",
            fontVariant: ["tabular-nums"],
            letterSpacing: 0.5,
            color: colours.text,
        },
        digitalUnit: {
            marginTop: 2,
            fontSize: 8,
            fontWeight: "900",
            letterSpacing: 1.3,
            color: colours.textMuted,
        },
        digitalSeparator: {
            fontSize: 28,
            lineHeight: 34,
            fontWeight: "900",
        },
        blocksRow: {
            width: "100%",
            flexDirection: "row",
            gap: 5,
            marginTop: spacing.md,
        },
        blockTrack: {
            flex: 1,
            height: 8,
            overflow: "hidden",
            borderRadius: radius.sm,
        },
        blockFill: {
            height: "100%",
            borderRadius: radius.sm,
        },
        blocksMeta: {
            width: "100%",
            marginTop: spacing.sm,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        blocksMetaText: {
            fontSize: 8,
            fontWeight: "800",
            letterSpacing: 0.8,
            color: colours.textMuted,
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
