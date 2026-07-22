import { StyleSheet, Text, View } from "react-native";

type LevelProgressCardProps = {
    level: number;
    xpIntoLevel: number;
    xpRequired: number;
};

export function LevelProgressCard({ level, xpIntoLevel, xpRequired }: LevelProgressCardProps) {
    const progressPercentage = Math.min((xpIntoLevel / xpRequired) * 100, 100);

    const xpUntilNextLevel = Math.max(xpRequired - xpIntoLevel, 0);

    return (
        <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
                <Text style={styles.levelText}>Level {level}</Text>

                <Text style={styles.xpText}>
                    {xpIntoLevel} / {xpRequired} XP
                </Text>
            </View>

            <View style={styles.progressTrack}>
                <View
                    style={[
                        styles.progressFill,
                        {
                            width: `${progressPercentage}%` as `${number}%`,
                        },
                    ]}
                />
            </View>

            <Text style={styles.remainingXpText}>
                {xpUntilNextLevel} XP until Level {level + 1}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    progressCard: {
        width: "100%",
        padding: 18,
        borderRadius: 12,
        backgroundColor: "#ffffff",
    },
    progressHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    levelText: {
        fontSize: 20,
        fontWeight: "700",
    },
    xpText: {
        fontSize: 14,
        color: "#666666",
    },
    progressTrack: {
        width: "100%",
        height: 10,
        marginTop: 14,
        borderRadius: 5,
        backgroundColor: "#dddddd",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 5,
        backgroundColor: "#222222",
    },
    remainingXpText: {
        marginTop: 8,
        fontSize: 13,
        color: "#666666",
    },
});
