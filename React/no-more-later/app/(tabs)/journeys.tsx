import { StyleSheet, Text, View } from "react-native";

export default function JourneyScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Journeys</Text>

            <Text style={styles.description}>Your larger goals and projects will appear here.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        marginTop: 48,
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
    },
});
