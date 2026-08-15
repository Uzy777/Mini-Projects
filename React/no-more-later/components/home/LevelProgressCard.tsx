import { StyleSheet, Text, View } from "react-native";

import { colours, radius, spacing } from "../../constants/design";
import { RankDisplay } from "@/components/ranks/RankDisplay";
import { Clock3, Flame, Zap } from "lucide-react-native";

type LevelProgressCardProps = {
    level: number;
    xpIntoLevel: number;
    xpRequired: number;
    currentStreak: number;
    totalFocusedSeconds: number;
    totalXp: number;
};

export function LevelProgressCard({ level, xpIntoLevel, xpRequired, currentStreak, totalFocusedSeconds, totalXp }: LevelProgressCardProps) {
    const progressPercentage = xpRequired > 0 ? Math.min(Math.max((xpIntoLevel / xpRequired) * 100, 0), 100) : 0;

    const totalFocusedHours = Math.floor(totalFocusedSeconds / 3600);

    const totalFocusedMinutes = Math.floor((totalFocusedSeconds % 3600) / 60);

    const totalFocusLabel = totalFocusedHours > 0 ? `${totalFocusedHours}h ${totalFocusedMinutes}m` : `${totalFocusedMinutes}m`;

    return (
        <View style={styles.card}>
            <View style={styles.topAccent} />

            <View style={styles.topRow}>
                <View style={styles.rankArea}>
                    <RankDisplay level={level} />
                </View>

                <View style={styles.levelArea}>
                    <View style={styles.levelBadge}>
                        <Text style={styles.levelBadgeText}>Level {level}</Text>
                    </View>

                    <Text style={styles.progressXp}>
                        {xpIntoLevel} / {xpRequired} XP
                    </Text>
                </View>
            </View>

            <View style={styles.progressTrack}>
                <View
                    style={[
                        styles.progressFill,
                        {
                            width: `${progressPercentage}%`,
                        },
                    ]}
                />
            </View>

            <View style={styles.statsSection}>
                <View style={styles.stat}>
                    <View style={styles.statIcon}>
                        <Flame size={17} color={colours.primary} />
                    </View>

                    <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit>
                        WIN STREAK
                    </Text>

                    <Text style={styles.statValue}>
                        {currentStreak} {currentStreak === 1 ? "day" : "days"}
                    </Text>
                </View>

                <View style={styles.stat}>
                    <View style={styles.statIcon}>
                        <Clock3 size={17} color={colours.primary} />
                    </View>

                    <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit>
                        TOTAL FOCUS
                    </Text>

                    <Text style={styles.statValue}>{totalFocusLabel}</Text>
                </View>

                <View style={styles.stat}>
                    <View style={styles.statIcon}>
                        <Zap size={17} color={colours.primary} />
                    </View>

                    <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit>
                        TOTAL XP
                    </Text>

                    <Text style={styles.statValue}>{totalXp.toLocaleString()}</Text>
                </View>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    card: {
        position: "relative",
        overflow: "hidden",

        backgroundColor: colours.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colours.border,

        padding: spacing.lg,
        gap: spacing.md,
    },

    topRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
    },

    rankArea: {
        flex: 1,
        minWidth: 0,
    },

    levelBadge: {
        backgroundColor: colours.primarySoft,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: radius.pill,
        alignSelf: "flex-start",
    },

    levelBadgeText: {
        color: colours.primary,
        fontSize: 13,
        fontWeight: "700",
    },

    progressXp: {
        color: colours.text,
        fontSize: 13,
        fontWeight: "700",
    },

    progressTrack: {
        width: "100%",
        height: 8,
        backgroundColor: colours.primarySoft,
        borderRadius: radius.pill,
        overflow: "hidden",
    },

    progressFill: {
        height: "100%",
        backgroundColor: colours.primary,
        borderRadius: radius.pill,
    },
    levelArea: {
        alignItems: "flex-end",
        gap: spacing.sm,
    },
    topAccent: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,

        height: 3,

        backgroundColor: colours.primary,
    },

    statsSection: {
        flexDirection: "row",
        alignItems: "flex-start",

        paddingTop: spacing.md,

        borderTopWidth: 1,
        borderTopColor: colours.border,
    },

    stat: {
        flex: 1,
        minWidth: 0,

        alignItems: "center",
        justifyContent: "flex-start",
    },

    statIcon: {
        width: 32,
        height: 32,

        alignItems: "center",
        justifyContent: "center",

        marginBottom: spacing.xs,

        borderRadius: radius.pill,
        backgroundColor: colours.primarySoft,
    },

    statLabel: {
        width: "100%",

        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 0.5,

        textAlign: "center",
        color: colours.textMuted,
    },

    statValue: {
        marginTop: 2,

        fontSize: 14,
        fontWeight: "700",

        textAlign: "center",
        color: colours.text,
    },
});
