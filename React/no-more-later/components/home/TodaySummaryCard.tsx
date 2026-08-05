import { StyleSheet, Text, View } from "react-native";

import { colours, radius, spacing } from "../../constants/design";

type TodaySummaryCardProps = {
    sessionCount: number;
    focusedMinutes: number;
};

export function TodaySummaryCard({ sessionCount, focusedMinutes }: TodaySummaryCardProps) {
    return (
        <View style={styles.card}>
            <Text style={styles.label}>TODAY</Text>

            <View style={styles.focusRow}>
                <Text style={styles.focusValue}>{focusedMinutes}</Text>

                <Text style={styles.focusLabel}>{focusedMinutes === 1 ? "focused minute" : "focused minutes"}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.sessionsRow}>
                <Text style={styles.sessionsLabel}>Sessions completed</Text>

                <Text style={styles.sessionsValue}>{sessionCount}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "100%",
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colours.border,
        borderRadius: radius.lg,
        backgroundColor: colours.surface,
    },

    label: {
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 0.7,
        color: colours.textMuted,
    },

    focusRow: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: spacing.sm,
        marginTop: spacing.md,
    },

    focusValue: {
        fontSize: 36,
        lineHeight: 42,
        fontWeight: "800",
        color: colours.text,
    },

    focusLabel: {
        flexShrink: 1,
        fontSize: 15,
        fontWeight: "600",
        color: colours.textMuted,
    },

    divider: {
        height: 1,
        marginVertical: spacing.lg,
        backgroundColor: colours.border,
    },

    sessionsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    sessionsLabel: {
        fontSize: 14,
        color: colours.textMuted,
    },

    sessionsValue: {
        fontSize: 18,
        fontWeight: "700",
        color: colours.primary,
    },
});
