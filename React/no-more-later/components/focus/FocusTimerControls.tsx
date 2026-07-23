import { Pressable, StyleSheet, Text, View } from "react-native";

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
            <Pressable style={styles.startButton} onPress={onStart}>
                <Text style={styles.startButtonText}>Start Focus Session</Text>
            </Pressable>
        );
    }

    if (hasFinished) {
        return (
            <View style={styles.completedContainer}>
                <Text style={styles.completedTitle}>Focus session complete!</Text>

                <Text style={styles.completedMessage}>Take a moment to record what you accomplished.</Text>

                <Pressable style={styles.reviewButton} onPress={onReview}>
                    <Text style={styles.reviewButtonText}>Review Session</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.controlsContainer}>
            <Pressable style={styles.pauseButton} onPress={onToggleTimer}>
                <Text style={styles.pauseButtonText}>{isRunning ? "Pause" : "Resume"}</Text>
            </Pressable>

            <Pressable style={styles.endEarlyButton} onPress={onEndEarly}>
                <Text style={styles.endEarlyButtonText}>End Session Early</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    controlsContainer: {
        width: "100%",
        alignItems: "center",
    },
    startButton: {
        marginTop: 24,
        paddingVertical: 16,
        borderRadius: 8,
        backgroundColor: "#222222",
        alignItems: "center",
    },
    startButtonText: {
        color: "#ffffff",
        fontSize: 17,
        fontWeight: "600",
    },
    pauseButton: {
        marginTop: 20,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "#222222",
        borderRadius: 8,
    },
    pauseButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#222222",
    },
    endEarlyButton: {
        marginTop: 12,
        paddingVertical: 12,
        alignItems: "center",
    },
    endEarlyButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#b42318",
    },
    completedContainer: {
        marginTop: 24,
        alignItems: "center",
    },
    completedTitle: {
        fontSize: 22,
        fontWeight: "700",
    },
    completedMessage: {
        marginTop: 8,
        fontSize: 16,
        textAlign: "center",
        color: "#666666",
    },
    reviewButton: {
        marginTop: 20,
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: "#222222",
    },
    reviewButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
    },
});
