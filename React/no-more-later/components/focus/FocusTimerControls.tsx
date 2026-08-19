import { StyleSheet, Text, View } from "react-native";
import { ClipboardCheck, Pause, Play, Square, TimerReset } from "lucide-react-native";

import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { AppButton } from "@/components/ui/AppButton";

import type { AppColours } from "@/constants/appearanceColours";
import { useMemo } from "react";
import type { TimerMode } from "@/types/models";

type FocusTimerControlsProps = {
    hasStarted: boolean;
    hasFinished: boolean;
    isRunning: boolean;
    onStart: () => void;
    onToggleTimer: () => void;
    onEndEarly: () => void;
    onReview: () => void;
    mode?: TimerMode;
};

export function FocusTimerControls({ hasStarted, hasFinished, isRunning, onStart, onToggleTimer, onEndEarly, onReview, mode = "focus" }: FocusTimerControlsProps) {
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);
    const isBreak = mode !== "focus";
    const sessionLabel = mode === "short-break" ? "Short Break" : mode === "long-break" ? "Long Break" : "Focus Session";

    if (!hasStarted) {
        return (
            <AppButton label={`Start ${sessionLabel}`} icon={<Play size={16} color={colours.onPrimary} fill={colours.onPrimary} />} onPress={onStart} size="lg" fullWidth />
        );
    }

    if (hasFinished) {
        return (
            <View style={styles.completedContainer}>
                <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>COMPLETE</Text>
                </View>

                <Text style={styles.completedTitle}>{isBreak ? "Break complete" : "Focus session complete"}</Text>

                <Text style={styles.completedMessage}>{isBreak ? "You made room to recharge. Return when you feel ready." : "Take a moment to record what you accomplished."}</Text>

                <AppButton
                    label={isBreak ? "Back to Focus" : "Review Session"}
                    icon={isBreak ? <TimerReset size={17} color={colours.onPrimary} /> : <ClipboardCheck size={17} color={colours.onPrimary} />}
                    onPress={onReview}
                    size="lg"
                    fullWidth
                    style={styles.reviewButton}
                />
            </View>
        );
    }

    return (
        <View style={styles.controlsContainer}>
            <AppButton
                label={isRunning ? `Pause ${isBreak ? "Break" : "Session"}` : `Resume ${isBreak ? "Break" : "Session"}`}
                icon={
                    isRunning ? (
                        <Pause size={17} color={colours.text} />
                    ) : (
                        <Play size={17} color={colours.onPrimary} fill={colours.onPrimary} />
                    )
                }
                onPress={onToggleTimer}
                variant={isRunning ? "secondary" : "primary"}
                size="lg"
                fullWidth
            />

            <AppButton label={`End ${isBreak ? "Break" : "Session"} Early`} icon={<Square size={14} color={colours.danger} />} onPress={onEndEarly} variant="ghost" style={styles.endEarlyButton} />
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        controlsContainer: {
            width: "100%",
            marginTop: spacing.lg,
        },

        endEarlyButton: {
            alignSelf: "center",
            marginTop: spacing.sm,
        },

        completedContainer: {
            width: "100%",
            marginTop: spacing.lg,
            padding: spacing.lg,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },

        completedBadge: {
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: radius.pill,
            backgroundColor: colours.successSoft,
        },

        completedBadgeText: {
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 0.6,
            color: colours.success,
        },

        completedTitle: {
            marginTop: spacing.md,
            fontSize: 22,
            lineHeight: 28,
            fontWeight: "800",
            textAlign: "center",
            color: colours.text,
        },

        completedMessage: {
            marginTop: spacing.sm,
            maxWidth: 360,
            fontSize: 15,
            lineHeight: 22,
            textAlign: "center",
            color: colours.textMuted,
        },

        reviewButton: {
            marginTop: spacing.lg,
        },
    });
}
