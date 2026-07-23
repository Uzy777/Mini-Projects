import { StyleSheet, Text, View } from "react-native";

type FocusTimerDisplayProps = {
    seconds: number;
};

function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);

    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function FocusTimerDisplay({ seconds }: FocusTimerDisplayProps) {
    return (
        <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    timerContainer: {
        width: "100%",
        marginTop: 28,
        paddingVertical: 28,
        borderRadius: 12,
        // backgroundColor: "#ffffff",
        alignItems: "center",
    },
    timerText: {
        fontSize: 56,
        fontWeight: "700",
        fontVariant: ["tabular-nums"],
    },
});
