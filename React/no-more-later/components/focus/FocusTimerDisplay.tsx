import { StyleSheet, Text, View } from "react-native";

import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import { useMemo } from "react";

type FocusTimerDisplayProps = {
    seconds: number;
};

function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);

    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function FocusTimerDisplay({ seconds }: FocusTimerDisplayProps) {
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <View style={styles.timerSection}>
            <Text style={styles.label}>FOCUS TIME</Text>

            <View style={styles.timerContainer}>
                <Text style={styles.timerText}>{formatTime(seconds)}</Text>
            </View>

            <Text style={styles.hint}>Stay with this Quest until the timer ends.</Text>
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
            width: "100%",
            marginTop: spacing.sm,
            paddingVertical: spacing.xl,
            paddingHorizontal: spacing.md,
            borderRadius: radius.lg,
            backgroundColor: colours.primarySoft,
            alignItems: "center",
            justifyContent: "center",
        },

        timerText: {
            fontSize: 64,
            lineHeight: 72,
            fontWeight: "800",
            fontVariant: ["tabular-nums"],
            letterSpacing: 1,
            color: colours.primary,
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
