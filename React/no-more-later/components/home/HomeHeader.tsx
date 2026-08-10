import { StyleSheet, Text, View } from "react-native";

import { colours, radius, spacing } from "../../constants/design";

type HomeHeaderProps = {
    currentStreak: number;
};

function getGreeting(): string {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
        return "Good morning";
    }

    if (currentHour < 18) {
        return "Good afternoon";
    }

    return "Good evening";
}

export function HomeHeader({ currentStreak }: HomeHeaderProps) {
    const streakLabel = currentStreak === 1 ? "day streak" : "days streak";

    return (
        <View style={styles.header}>
            <View style={styles.topRow}>
                <View style={styles.headingContainer}>
                    <Text style={styles.appName}>NO MORE LATER</Text>

                    <Text style={styles.title}>{getGreeting()}</Text>
                </View>

                {currentStreak > 0 && (
                    <View style={styles.streakBadge}>
                        <Text style={styles.streakNumber}>{currentStreak}</Text>

                        <Text style={styles.streakLabel}>{streakLabel}</Text>
                    </View>
                )}
            </View>

            <Text style={styles.subtitle}>Choose one thing and move it forward.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        width: "100%",
        marginBottom: spacing.xl,
        marginTop: spacing.xl,
    },

    topRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: spacing.md,
    },

    headingContainer: {
        flex: 1,
    },

    appName: {
        marginBottom: spacing.xs,
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1,
        color: colours.primary,
    },

    title: {
        fontSize: 30,
        lineHeight: 36,
        fontWeight: "800",
        color: colours.text,
    },

    subtitle: {
        marginTop: spacing.sm,
        fontSize: 15,
        lineHeight: 22,
        color: colours.textMuted,
    },

    streakBadge: {
        minWidth: 76,
        alignItems: "center",
        paddingHorizontal: spacing.md,
        paddingVertical: 10,
        borderRadius: radius.md,
        backgroundColor: colours.primarySoft,
    },

    streakNumber: {
        fontSize: 19,
        fontWeight: "800",
        color: colours.primary,
    },

    streakLabel: {
        marginTop: 1,
        fontSize: 11,
        fontWeight: "600",
        color: colours.primary,
    },
});
