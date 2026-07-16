import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function ReviewSessionScreen() {
    const { questId, questTitle, plannedMinutes } = useLocalSearchParams<{
        questId: string;
        questTitle?: string;
        plannedMinutes?: string;
    }>();

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: "Session Review",
                }}
            />

            <Text style={styles.label}>Quest</Text>

            <Text style={styles.title}>{questTitle ?? "Untitled Quest"}</Text>

            <Text style={styles.sessionLength}>{plannedMinutes ?? "0"} minute session</Text>

            <Text style={styles.description}>Your session review form will appear here.</Text>

            <Text style={styles.idText}>Quest ID: {questId}</Text>
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
    sessionLength: {
        marginTop: 8,
        fontSize: 16,
        color: "#666666",
    },
    description: {
        marginTop: 32,
        fontSize: 16,
    },
    idText: {
        marginTop: 24,
        fontSize: 12,
        color: "#666666",
    },
});
