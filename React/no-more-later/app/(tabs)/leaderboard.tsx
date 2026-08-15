import { useEffect, useState, useCallback } from "react";
import { ScrollView, StyleSheet, Text, View, RefreshControl } from "react-native";
import { useFocusEffect } from "expo-router";

import { getLeaderboard, LeaderboardEntry } from "@/services/leaderboard/leaderboardService";
import { colours, radius, spacing } from "@/constants/design";
import { calculateLevel } from "@/utils/level";
import { getFocusRank } from "@/utils/rank";
import { RankBadge } from "@/components/ranks/RankBadge";
import { useAuth } from "@/contexts/AuthContext";

export default function LeaderboardScreen() {
    const { session } = useAuth();

    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadLeaderboard = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const leaderboardData = await getLeaderboard();

            setLeaderboard(leaderboardData);
        } catch (error) {
            console.error("Failed to load leaderboard:", error);

            setErrorMessage("Unable to load the leaderboard.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadLeaderboard();
        }, [loadLeaderboard]),
    );

    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={styles.container}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadLeaderboard} tintColor={colours.primary} colors={[colours.primary]} />}
        >
            {" "}
            <View style={styles.header}>
                <Text style={styles.title}>Leaderboard</Text>
                <Text style={styles.subtitle}>Top 25 focused users</Text>
            </View>
            <View style={styles.leaderboardCard}>
                {isLoading ? (
                    <View style={styles.messageContainer}>
                        <Text style={styles.messageText}>Loading leaderboard...</Text>
                    </View>
                ) : errorMessage ? (
                    <View style={styles.messageContainer}>
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                ) : leaderboard.length === 0 ? (
                    <View style={styles.messageContainer}>
                        <Text style={styles.messageText}>No leaderboard entries yet.</Text>
                    </View>
                ) : (
                    leaderboard.map((entry, index) => {
                        const level = calculateLevel(entry.total_xp);
                        const rank = getFocusRank(level);

                        const isCurrentUser = entry.user_id === session?.user.id;

                        return (
                            <View
                                key={entry.user_id}
                                style={[styles.row, index < leaderboard.length - 1 && styles.rowBorder, isCurrentUser && styles.currentUserRow]}
                            >
                                <View style={styles.positionContainer}>
                                    <Text style={styles.position}>{index + 1}</Text>
                                </View>

                                <RankBadge level={level} />

                                <View style={styles.userInfo}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.name}>{entry.display_name}</Text>

                                        {isCurrentUser && (
                                            <View style={styles.youBadge}>
                                                <Text style={styles.youBadgeText}>You</Text>
                                            </View>
                                        )}
                                    </View>

                                    <Text style={styles.details}>
                                        Level {level}
                                        {rank ? ` · ${rank.name}` : ""}
                                    </Text>
                                </View>

                                <Text style={styles.xp}>{entry.total_xp} XP</Text>
                            </View>
                        );
                    })
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colours.background,
    },

    container: {
        padding: spacing.lg,
    },

    header: {
        marginBottom: spacing.lg,
    },

    title: {
        fontSize: 28,
        fontWeight: "700",
        color: colours.text,
    },

    subtitle: {
        marginTop: spacing.xs,
        fontSize: 15,
        color: colours.textMuted,
    },

    leaderboardCard: {
        backgroundColor: colours.surface,
        borderWidth: 1,
        borderColor: colours.border,
        borderRadius: radius.lg,
        overflow: "hidden",
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        gap: spacing.md,
    },

    rowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colours.border,
    },

    positionContainer: {
        width: 36,
        height: 36,
        borderRadius: radius.pill,
        backgroundColor: colours.primarySoft,
        alignItems: "center",
        justifyContent: "center",
    },

    position: {
        fontSize: 15,
        fontWeight: "700",
        color: colours.primary,
    },

    userInfo: {
        flex: 1,
    },

    name: {
        fontSize: 16,
        fontWeight: "600",
        color: colours.text,
    },

    details: {
        marginTop: spacing.xs,
        fontSize: 14,
        color: colours.textMuted,
    },
    xp: {
        fontSize: 14,
        fontWeight: "700",
        color: colours.primary,
    },
    currentUserRow: {
        backgroundColor: colours.primarySoft,
    },

    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },

    youBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colours.primaryBorder,
        backgroundColor: colours.surface,
    },

    youBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: colours.primary,
    },
    messageContainer: {
        padding: spacing.lg,
        alignItems: "center",
    },

    messageText: {
        fontSize: 14,
        color: colours.textMuted,
    },

    errorText: {
        fontSize: 14,
        color: colours.danger,
    },
});
