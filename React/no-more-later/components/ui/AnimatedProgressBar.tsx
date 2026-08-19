import { useEffect, useMemo } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import type { AppColours } from "@/constants/appearanceColours";
import { radius } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

export function AnimatedProgressBar({ progress, height = 7, style }: { progress: number; height?: number; style?: StyleProp<ViewStyle> }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const width = useSharedValue(0);
    const safeProgress = Math.min(1, Math.max(0, progress));

    useEffect(() => {
        width.value = withTiming(safeProgress * 100, { duration: 520, easing: Easing.out(Easing.cubic) });
    }, [safeProgress, width]);

    const animatedStyle = useAnimatedStyle(() => ({ width: `${width.value}%` }));

    return (
        <View style={[styles.track, { height }, style]}>
            <Animated.View style={[styles.fill, animatedStyle]} />
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        track: { width: "100%", overflow: "hidden", borderRadius: radius.pill, backgroundColor: colours.primarySoft },
        fill: { height: "100%", borderRadius: radius.pill, backgroundColor: colours.primary },
    });
}
