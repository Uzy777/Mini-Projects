import { Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";

const TOTAL_XP_STORAGE_KEY = "no-more-later-total-xp";

const STARTING_LEVEL_XP = 100;
const XP_INCREASE_PER_LEVEL = 25;

function getXpRequiredForLevel(level: number) {
    return STARTING_LEVEL_XP + (level - 1) * XP_INCREASE_PER_LEVEL;
}

function calculateLevelProgress(totalXp: number) {
    let level = 1;
    let xpIntoLevel = totalXp;
    let xpRequired = getXpRequiredForLevel(level);

    while (xpIntoLevel >= xpRequired) {
        xpIntoLevel -= xpRequired;
        level += 1;
        xpRequired = getXpRequiredForLevel(level);
    }

    return {
        level,
        xpIntoLevel,
        xpRequired,
    };
}

export default function HomeScreen() {
    const router = useRouter();

    const [totalXp, setTotalXp] = useState(0);

    useFocusEffect(
        useCallback(() => {
            async function loadTotalXp() {
                try {
                    const storedTotalXp = await AsyncStorage.getItem(TOTAL_XP_STORAGE_KEY);

                    const parsedTotalXp = storedTotalXp ? Number(storedTotalXp) : 0;

                    setTotalXp(parsedTotalXp);
                } catch (error) {
                    console.error("Failed to load total XP:", error);
                }
            }

            loadTotalXp();
        }, []),
    );

    const { level, xpIntoLevel, xpRequired } = calculateLevelProgress(totalXp);

    const levelProgressPercentage = (xpIntoLevel / xpRequired) * 100;

    const xpUntilNextLevel = xpRequired - xpIntoLevel;

    function handleStartSession() {
        router.navigate("/journeys");
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>No More Later</Text>

            <Text style={styles.tagline}>Turn later into progress.</Text>

            <View style={styles.progressCard}>
                <Text style={styles.levelText}>Level {level}</Text>

                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${levelProgressPercentage}%` }]}></View>
                </View>

                <Text style={styles.xpText}>
                    {xpIntoLevel} / {xpRequired} XP
                </Text>

                <Text style={styles.nextLevelText}>
                    {xpUntilNextLevel} XP until Level {level + 1}
                </Text>

                <Text style={styles.totalXpText}>Total XP: {totalXp}</Text>
            </View>

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
    progressCard: {
        width: "100%",
        maxWidth: 400,
        marginBottom: 24,
        padding: 20,
        borderRadius: 12,
        backgroundColor: "#ffffff",
        alignItems: "center",
    },
    levelText: {
        fontSize: 24,
        fontWeight: "700",
    },
    xpText: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: "600",
    },
    totalXpText: {
        marginTop: 4,
        fontSize: 14,
        color: "#666666",
    },
    progressTrack: {
        width: "100%",
        height: 12,
        marginTop: 16,
        borderRadius: 6,
        backgroundColor: "#dddddd",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 6,
        backgroundColor: "#222222",
    },
    nextLevelText: {
        marginTop: 6,
        fontSize: 14,
        color: "#666666",
    },
});
