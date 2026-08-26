import { useEffect, useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, Defs, Mask } from "react-native-svg";
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming, type SharedValue } from "react-native-reanimated";

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

    const softArcLength = circumference * 0.76;
    const animatedSoftCircleProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference - softArcLength * animatedProgress.value,
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
        animatedSoftCircleProps,
        animatedBarStyle,
        animatedProgress,
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
    animatedSoftCircleProps: ReturnType<typeof useAnimatedProps>;
    animatedBarStyle: { width: `${number}%` };
    animatedProgress: SharedValue<number>;
};

function renderTimerVisual({ timerStyle, formattedTime, timerState, size, ringRadius, circumference, safeProgress, tone, colours, styles, animatedCircleProps, animatedSoftCircleProps, animatedBarStyle, animatedProgress }: TimerVisualProps) {
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
        const softArcLength = circumference * 0.76;

        return (
            <View style={[styles.softContainer, { width: size, height: size }]}>
                <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
                    <Defs>
                        <Mask id="soft-dial-mask">
                            <Circle
                                cx={size / 2}
                                cy={size / 2}
                                r={ringRadius}
                                fill="none"
                                stroke="#ffffff"
                                strokeWidth={14}
                                strokeDasharray={`${softArcLength} ${circumference}`}
                                strokeLinecap="round"
                                rotation="133"
                                origin={`${size / 2}, ${size / 2}`}
                            />
                        </Mask>
                    </Defs>
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={ringRadius}
                        fill="none"
                        stroke={tone.track}
                        strokeWidth={14}
                        strokeDasharray={`${softArcLength} ${circumference}`}
                        strokeLinecap="round"
                        rotation="133"
                        origin={`${size / 2}, ${size / 2}`}
                    />
                    <AnimatedCircle
                        animatedProps={animatedSoftCircleProps}
                        mask="url(#soft-dial-mask)"
                        cx={size / 2}
                        cy={size / 2}
                        r={ringRadius}
                        fill="none"
                        stroke={tone.active}
                        strokeWidth={14}
                        strokeLinecap="round"
                        strokeDasharray={`${circumference} ${circumference}`}
                        rotation="133"
                        origin={`${size / 2}, ${size / 2}`}
                    />
                </Svg>
                <View
                    style={[
                        styles.softFace,
                        {
                            width: size * 0.7,
                            height: size * 0.7,
                            borderRadius: size,
                            borderColor: tone.track,
                            backgroundColor: tone.soft,
                        },
                    ]}
                >
                    <Text style={styles.softTime}>{formattedTime}</Text>
                    <Text style={[styles.softState, { color: tone.strong }]}>{timerState}</Text>
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
        const segmentStep = circumference / 36;
        const segmentLength = segmentStep * 0.58;
        const segmentGap = segmentStep - segmentLength;

        return (
            <View style={[styles.timerContainer, styles.segmentedContainer, { width: size, height: size }]}>
                <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
                    <Defs>
                        <Mask id="segmented-dial-mask">
                            <Circle
                                cx={size / 2}
                                cy={size / 2}
                                r={ringRadius}
                                fill="none"
                                stroke="#ffffff"
                                strokeWidth={10}
                                strokeDasharray={`${segmentLength} ${segmentGap}`}
                                strokeLinecap="round"
                            />
                        </Mask>
                    </Defs>
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={ringRadius}
                        fill="none"
                        stroke={tone.track}
                        strokeWidth={10}
                        strokeDasharray={`${segmentLength} ${segmentGap}`}
                        strokeLinecap="round"
                    />
                    <AnimatedCircle
                        animatedProps={animatedCircleProps}
                        mask="url(#segmented-dial-mask)"
                        cx={size / 2}
                        cy={size / 2}
                        r={ringRadius}
                        fill="none"
                        stroke={tone.active}
                        strokeWidth={10}
                        strokeLinecap="round"
                        strokeDasharray={`${circumference} ${circumference}`}
                        rotation="-90"
                        origin={`${size / 2}, ${size / 2}`}
                    />
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={ringRadius - 18}
                        fill="none"
                        stroke={tone.track}
                        strokeOpacity={0.72}
                        strokeWidth={1}
                    />
                </Svg>
                <View style={[styles.segmentedCore, { borderColor: tone.track, backgroundColor: colours.surface }]}>
                    <Text style={styles.segmentedTime}>{formattedTime}</Text>
                    <Text style={[styles.segmentedLabel, { color: tone.strong }]}>PRECISION DIAL</Text>
                    <Text style={styles.segmentedState}>{timerState}</Text>
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
        softContainer: {
            marginTop: spacing.md,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
        },
        softFace: {
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            shadowColor: colours.primaryStrong,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.08,
            shadowRadius: 18,
            elevation: 2,
        },
        softTime: {
            fontSize: 44,
            lineHeight: 52,
            fontWeight: "800",
            fontVariant: ["tabular-nums"],
            letterSpacing: -1.2,
            color: colours.text,
        },
        softState: {
            marginTop: 3,
            maxWidth: "76%",
            fontSize: 10,
            lineHeight: 14,
            fontWeight: "700",
            textAlign: "center",
        },
        segmentedContainer: {
            backgroundColor: colours.primarySubtle,
        },
        segmentedCore: {
            width: "68%",
            height: "68%",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderRadius: radius.pill,
            shadowColor: colours.primaryStrong,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.07,
            shadowRadius: 14,
            elevation: 1,
        },
        segmentedTime: {
            fontSize: 42,
            lineHeight: 49,
            fontWeight: "900",
            fontVariant: ["tabular-nums"],
            letterSpacing: -1,
            color: colours.text,
        },
        segmentedLabel: {
            marginTop: 2,
            fontSize: 8,
            fontWeight: "900",
            letterSpacing: 1.2,
        },
        segmentedState: {
            marginTop: 4,
            maxWidth: "82%",
            fontSize: 10,
            lineHeight: 14,
            fontWeight: "600",
            textAlign: "center",
            color: colours.textMuted,
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
