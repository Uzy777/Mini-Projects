import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    cancelAnimation,
    Easing,
    interpolate,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withDelay,
    withTiming,
} from "react-native-reanimated";

import type { CelebrationKind } from "@/components/celebrations/CelebrationShell";

type CelebrationParticlesProps = {
    kind: CelebrationKind;
    colors: readonly string[];
    delay?: number;
};

type ParticleProps = {
    color: string;
    angle: number;
    distance: number;
    delay: number;
    duration: number;
    size: number;
    round: boolean;
};

const PARTICLE_COUNTS: Record<CelebrationKind, number> = {
    level: 8,
    rank: 18,
    badge: 14,
};

export function CelebrationParticles({ kind, colors, delay = 0 }: CelebrationParticlesProps) {
    const reduceMotion = useReducedMotion();

    if (reduceMotion || colors.length === 0) {
        return null;
    }

    const count = PARTICLE_COUNTS[kind];
    const distanceBase = kind === "level" ? 42 : kind === "badge" ? 68 : 82;
    const distanceRange = kind === "level" ? 28 : kind === "badge" ? 46 : 66;

    return (
        <View
            pointerEvents="none"
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.layer}
        >
            {Array.from({ length: count }, (_, index) => {
                const angle = -168 + (336 / Math.max(1, count - 1)) * index;
                const distance = distanceBase + ((index * 23) % distanceRange);

                return (
                    <Particle
                        key={index}
                        angle={angle}
                        color={colors[index % colors.length]}
                        delay={delay + (index % 4) * 36}
                        distance={distance}
                        duration={kind === "level" ? 700 : 900}
                        round={index % 3 === 0}
                        size={(kind === "level" ? 4 : 5) + (index % 3)}
                    />
                );
            })}
        </View>
    );
}

function Particle({ color, angle, distance, delay, duration, size, round }: ParticleProps) {
    const progress = useSharedValue(0);
    const radians = (angle * Math.PI) / 180;
    const x = Math.cos(radians) * distance;
    const y = Math.sin(radians) * distance;

    useEffect(() => {
        progress.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));

        return () => cancelAnimation(progress);
    }, [delay, duration, progress]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 0.12, 0.72, 1], [0, 1, 0.88, 0]),
        transform: [
            { translateX: x * progress.value },
            { translateY: y * progress.value },
            { rotate: `${angle + progress.value * 90}deg` },
            { scale: interpolate(progress.value, [0, 0.15, 1], [0.65, 1, 0.72]) },
        ],
    }));

    return (
        <Animated.View
            style={[
                styles.particle,
                {
                    width: size,
                    height: round ? size : Math.max(2, Math.round(size * 0.55)),
                    marginLeft: -size / 2,
                    marginTop: -size / 2,
                    borderRadius: round ? size : 1,
                    backgroundColor: color,
                },
                animatedStyle,
            ]}
        />
    );
}

const styles = StyleSheet.create({
    layer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 2,
        overflow: "hidden",
    },
    particle: {
        position: "absolute",
        top: "48%",
        left: "50%",
    },
});
