import { Pressable, StyleSheet, Text, View } from "react-native";

import { colours, radius, spacing } from "@/constants/design";

type FocusTimerControlsProps = {
    hasStarted: boolean;
    hasFinished: boolean;
    isRunning: boolean;
    onStart: () => void;
    onToggleTimer: () => void;
    onEndEarly: () => void;
    onReview: () => void;
};

export function FocusTimerControls({ hasStarted, hasFinished, isRunning, onStart, onToggleTimer, onEndEarly, onReview }: FocusTimerControlsProps) {
    if (!hasStarted) {
        return (
            <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]} onPress={onStart}>
                <Text style={styles.primaryButtonText}>Start Focus Session</Text>
            </Pressable>
        );
    }

    if (hasFinished) {
        return (
            <View style={styles.completedContainer}>
                <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>COMPLETE</Text>
                </View>

                <Text style={styles.completedTitle}>Focus session complete</Text>

                <Text style={styles.completedMessage}>Take a moment to record what you accomplished.</Text>

                <Pressable style={({ pressed }) => [styles.primaryButton, styles.reviewButton, pressed && styles.primaryButtonPressed]} onPress={onReview}>
                    <Text style={styles.primaryButtonText}>Review Session</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.controlsContainer}>
            <Pressable
                style={({ pressed }) => [
                    isRunning ? styles.secondaryButton : styles.primaryButton,

                    pressed && (isRunning ? styles.secondaryButtonPressed : styles.primaryButtonPressed),
                ]}
                onPress={onToggleTimer}
            >
                <Text style={isRunning ? styles.secondaryButtonText : styles.primaryButtonText}>{isRunning ? "Pause Session" : "Resume Session"}</Text>
            </Pressable>

            <Pressable style={({ pressed }) => [styles.endEarlyButton, pressed && styles.endEarlyButtonPressed]} onPress={onEndEarly}>
                <Text style={styles.endEarlyButtonText}>End Session Early</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    controlsContainer: {
        width: "100%",
        marginTop: spacing.lg,
    },

    primaryButton: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colours.primary,
    },

    primaryButtonPressed: {
        backgroundColor: colours.primaryPressed,
    },

    primaryButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: colours.surface,
    },

    secondaryButton: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colours.border,
        borderRadius: radius.md,
        backgroundColor: colours.surface,
    },

    secondaryButtonPressed: {
        backgroundColor: colours.background,
    },

    secondaryButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: colours.text,
    },

    endEarlyButton: {
        alignSelf: "center",
        marginTop: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: 10,
        borderRadius: radius.sm,
    },

    endEarlyButtonPressed: {
        backgroundColor: colours.dangerSoft,
    },

    endEarlyButtonText: {
        fontSize: 14,
        fontWeight: "700",
        color: colours.danger,
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
