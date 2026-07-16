import { useEffect, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function FocusScreen() {
    const router = useRouter();

    const { questId, questTitle } = useLocalSearchParams<{
        questId: string;
        questTitle?: string;
    }>();

    const [selectedMinutes, setSelectedMinutes] = useState(25);
    const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        if (!isRunning || remainingSeconds === null) {
            return;
        }

        if (remainingSeconds === 0) {
            setIsRunning(false);
            return;
        }

        const intervalId = setInterval(() => {
            setRemainingSeconds((currentSeconds) => {
                if (currentSeconds === null) {
                    return null;
                }

                return currentSeconds - 1;
            });
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [isRunning, remainingSeconds]);

    function handleStartSession() {
        // const totalSeconds = selectedMinutes * 60;
        const totalSeconds = 5;

        setRemainingSeconds(totalSeconds);
        setIsRunning(true);
    }

    function handleToggleTimer() {
        setIsRunning((currentValue) => !currentValue);
    }

    function handleReviewSession() {
        router.push({
            pathname: "/review/[questId]",
            params: {
                questId,
                questTitle,
                plannedMinutes: selectedMinutes.toString(),
            },
        });
    }

    function formatTime(totalSeconds: number) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: "Focus Session",
                }}
            />

            <Text style={styles.label}>Current Quest</Text>

            <Text style={styles.title}>{questTitle ?? "Untitled Quest"}</Text>

            <Text style={styles.sectionTitle}>Choose a session length</Text>

            <View style={styles.durationOptions}>
                <Pressable style={[styles.durationButton, selectedMinutes === 15 && styles.selectedDurationButton]} onPress={() => setSelectedMinutes(15)}>
                    <Text style={[styles.durationText, selectedMinutes === 15 && styles.selectedDurationText]}>15 min</Text>
                </Pressable>

                <Pressable style={[styles.durationButton, selectedMinutes === 25 && styles.selectedDurationButton]} onPress={() => setSelectedMinutes(25)}>
                    <Text style={[styles.durationText, selectedMinutes === 25 && styles.selectedDurationText]}>25 min</Text>
                </Pressable>

                <Pressable style={[styles.durationButton, selectedMinutes === 50 && styles.selectedDurationButton]} onPress={() => setSelectedMinutes(50)}>
                    <Text style={[styles.durationText, selectedMinutes === 50 && styles.selectedDurationText]}>50 min</Text>
                </Pressable>
            </View>
            <Pressable style={styles.startButton} onPress={handleStartSession}>
                <Text style={styles.startButtonText}>Start Focus Session</Text>
            </Pressable>

            {remainingSeconds !== null && (
                <View style={styles.timerContainer}>
                    <Text style={styles.timer}>{formatTime(remainingSeconds)}</Text>

                    {remainingSeconds > 0 && (
                        <Pressable style={styles.pauseButton} onPress={handleToggleTimer}>
                            <Text style={styles.pauseButtonText}>{isRunning ? "Pause" : "Resume"}</Text>
                        </Pressable>
                    )}

                    {remainingSeconds === 0 && (
                        <View style={styles.completedContainer}>
                            <Text style={styles.completedTitle}>Focus session complete!</Text>

                            <Text style={styles.completedMessage}>Take a moment to record what you accomplished.</Text>

                            <Pressable style={styles.reviewButton} onPress={handleReviewSession}>
                                <Text style={styles.reviewButtonText}>Review Session</Text>
                            </Pressable>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: "#f5f5f5",
    },
    label: {
        marginTop: 24,
        marginBottom: 8,
        fontSize: 14,
        fontWeight: "600",
        color: "#666666",
    },
    title: {
        fontSize: 30,
        fontWeight: "700",
    },
    description: {
        marginTop: 16,
        fontSize: 16,
    },
    idText: {
        marginTop: 24,
        fontSize: 12,
        color: "#666666",
    },
    sectionTitle: {
        marginTop: 32,
        marginBottom: 12,
        fontSize: 16,
        fontWeight: "600",
    },
    durationOptions: {
        flexDirection: "row",
        gap: 12,
    },
    durationButton: {
        flex: 1,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: "#cccccc",
        borderRadius: 8,
        backgroundColor: "#ffffff",
        alignItems: "center",
    },
    selectedDurationButton: {
        borderColor: "#222222",
        backgroundColor: "#222222",
    },
    durationText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#222222",
    },
    selectedDurationText: {
        color: "#ffffff",
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
    timer: {
        marginTop: 32,
        fontSize: 56,
        fontWeight: "700",
        textAlign: "center",
    },
    timerContainer: {
        alignItems: "center",
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
