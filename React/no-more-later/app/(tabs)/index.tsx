import { Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
    function handleStartSession() {
        console.log("Start session pressed");
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>No More Later</Text>

            <Text style={styles.tagline}>Turn later into progress.</Text>

            <Pressable style={styles.startButton} onPress={handleStartSession}>
                <Text style={styles.startButtonText}>Start a focus session</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        marginBottom: 8,
    },
    tagline: {
        fontSize: 18,
        marginBottom: 32,
    },
    startButton: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: "#222222",
    },
    startButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
    },
});
