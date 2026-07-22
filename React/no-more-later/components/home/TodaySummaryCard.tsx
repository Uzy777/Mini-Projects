import { StyleSheet, Text, View } from "react-native";

type TodaySummaryCardProps = {
    sessionCount: number;
    focusedMinutes: number;
};

export function TodaySummaryCard({ sessionCount, focusedMinutes }: TodaySummaryCardProps) {
    return (
        <View style={styles.todayCard}>
            <Text style={styles.todayTitle}>Today</Text>

            <View style={styles.todayStats}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{sessionCount}</Text>

                    <Text style={styles.statLabel}>{sessionCount === 1 ? "session" : "sessions"}</Text>
                </View>

                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{focusedMinutes}</Text>

                    <Text style={styles.statLabel}>focused minutes</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    todayCard: {
        width: "100%",
        marginTop: 20,
        padding: 18,
        borderRadius: 12,
        backgroundColor: "#ffffff",
    },
    todayTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    todayStats: {
        marginTop: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 20,
    },
    statItem: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: "#f2f2f2",
    },
    statValue: {
        fontSize: 24,
        fontWeight: "700",
    },
    statLabel: {
        marginTop: 4,
        fontSize: 13,
        color: "#666666",
    },
});
