import { StyleSheet, Text, View } from "react-native";

type HomeHeaderProps = {
    currentStreak: number;
};

export function HomeHeader({ currentStreak }: HomeHeaderProps) {
    return (
        <View style={styles.headerRow}>
            <View style={styles.headerText}>
                <Text style={styles.title}>No More Later</Text>

                <Text style={styles.description}>Turn later into progress.</Text>
            </View>

            <View style={styles.streakBadge}>
                <Text style={styles.streakValue}>{currentStreak}</Text>

                <Text style={styles.streakLabel}>day streak</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerRow: {
        width: "100%",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 48,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
    },
    description: {
        marginTop: 6,
        fontSize: 15,
        color: "#666666",
    },
    streakBadge: {
        minWidth: 82,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: "#ffffff",
        alignItems: "center",
    },
    streakValue: {
        fontSize: 22,
        fontWeight: "700",
    },
    streakLabel: {
        marginTop: 2,
        fontSize: 12,
        fontWeight: "600",
        color: "#666666",
    },
});
