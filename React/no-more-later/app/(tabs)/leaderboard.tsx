import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Sparkles, Trophy } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";
import { RankBadge } from "@/components/ranks/RankBadge";
import { AppCard } from "@/components/ui/AppCard";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import type { AppColours } from "@/constants/appearanceColours";
import { layout, radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { useAuth } from "@/contexts/AuthContext";
import { getLeaderboard, getMyLeaderboardPosition, type LeaderboardEntry, type LeaderboardPeriod, type MyLeaderboardPosition } from "@/services/leaderboard/leaderboardService";
import { calculateLevel } from "@/utils/level";
import { getFocusRank } from "@/utils/rank";
import { formatProgressDuration } from "@/utils/dashboardStats";

export default function LeaderboardScreen() {
    const { colours } = useAppearance();
    const { session } = useAuth();
    const { width } = useWindowDimensions();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const isWide = width >= 760;
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [myPosition, setMyPosition] = useState<MyLeaderboardPosition | null>(null);
    const [period, setPeriod] = useState<LeaderboardPeriod>("30_days");

    const loadLeaderboard = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const [leaderboardData, myPositionData] = await Promise.all([getLeaderboard(period), getMyLeaderboardPosition(period)]);
            setLeaderboard(leaderboardData);
            setMyPosition(myPositionData);
        } catch (error) {
            console.error("Failed to load leaderboard:", error);
            setErrorMessage("Unable to load the leaderboard. Pull down to try again.");
        } finally {
            setIsLoading(false);
        }
    }, [period]);

    useFocusEffect(useCallback(() => { loadLeaderboard(); }, [loadLeaderboard]));

    const topThree = leaderboard.slice(0, 3);
    const remainingEntries = leaderboard.slice(3);
    const myLevel = myPosition ? calculateLevel(myPosition.total_xp) : null;
    const myRank = myLevel !== null ? getFocusRank(myLevel) : null;

    return (
        <AppScreenBackground>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.container}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadLeaderboard} tintColor={colours.primary} colors={[colours.primary]} />}
            >
                <ScreenHeader
                    eyebrow="COMMUNITY"
                    title="Leaderboard"
                    subtitle="Celebrate steady focus and see where your progress places you."
                    action={<View style={styles.headerIcon}><Trophy size={20} color={colours.primaryStrong} /></View>}
                />

                <View accessibilityRole="tablist" style={styles.periodControl}>
                    {([
                        { id: "30_days", label: "Last 30 days" },
                        { id: "all_time", label: "All time" },
                    ] as const).map((option) => {
                        const selected = option.id === period;
                        return (
                            <AnimatedPressable
                                key={option.id}
                                accessibilityRole="tab"
                                accessibilityState={{ selected }}
                                onPress={() => setPeriod(option.id)}
                                haptic="selection"
                                style={[styles.periodOption, selected && styles.periodOptionSelected]}
                            >
                                <Text style={[styles.periodOptionText, selected && styles.periodOptionTextSelected]}>{option.label}</Text>
                            </AnimatedPressable>
                        );
                    })}
                </View>

                <AppCard padding="md" tone="subtle">
                    <Text style={styles.rulesTitle}>Focused time, not XP</Text>
                    <Text style={styles.rulesText}>Reviewed Focus Sessions of at least five minutes count. Up to six hours per day can contribute; breaks never count.</Text>
                </AppCard>

                {isLoading && leaderboard.length === 0 ? (
                    <AppCard style={styles.messageCard} padding="lg">
                        <ActivityIndicator color={colours.primary} />
                        <Text style={styles.messageText}>Loading the latest rankings…</Text>
                    </AppCard>
                ) : errorMessage ? (
                    <AppCard style={styles.messageCard} padding="lg">
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </AppCard>
                ) : leaderboard.length === 0 ? (
                    <AppCard style={styles.messageCard} padding="lg" tone="subtle">
                        <View style={styles.emptyIcon}><Sparkles size={22} color={colours.primaryStrong} /></View>
                        <Text style={styles.emptyTitle}>The first spot is waiting</Text>
                        <Text style={styles.messageText}>Complete and review a five-minute Focus Session to join the leaderboard.</Text>
                    </AppCard>
                ) : (
                    <>
                        <View style={styles.sectionHeading}>
                            <Text style={styles.sectionTitle}>Top focusers</Text>
                            <Text style={styles.sectionCaption}>{period === "30_days" ? "Rolling 30-day focus" : "Lifetime focus"}</Text>
                        </View>
                        <View style={[styles.podium, !isWide && styles.podiumCompact]}>
                            {topThree.map((entry, index) => (
                                <PodiumCard key={entry.user_id} entry={entry} position={index + 1} isCurrentUser={entry.user_id === session?.user.id} compact={!isWide} />
                            ))}
                        </View>

                        {myPosition && myPosition.leaderboard_position > 25 && myLevel !== null && (
                            <View style={styles.myPositionSection}>
                                <Text style={styles.sectionLabel}>YOUR POSITION</Text>
                                <AppCard style={styles.myPositionCard} tone="accent">
                                    <PositionBadge position={myPosition.leaderboard_position} />
                                    <RankBadge level={myLevel} />
                                    <View style={styles.userInfo}>
                                        <View style={styles.nameRow}>
                                            <Text numberOfLines={1} style={styles.name}>{myPosition.display_name}</Text>
                                            <YouBadge />
                                        </View>
                                        <Text style={styles.details}>Level {myLevel}{myRank ? ` · ${myRank.name}` : ""}</Text>
                                    </View>
                                    <Text style={styles.xp}>{formatProgressDuration(myPosition.focused_seconds, true)}</Text>
                                </AppCard>
                            </View>
                        )}

                        {remainingEntries.length > 0 && (
                            <View style={styles.rankingSection}>
                                <View style={styles.sectionHeading}>
                                    <Text style={styles.sectionTitle}>All rankings</Text>
                                    <Text style={styles.sectionCaption}>Top 25</Text>
                                </View>
                                <AppCard style={styles.leaderboardCard} padding="sm">
                                    {remainingEntries.map((entry, index) => {
                                        const level = calculateLevel(entry.total_xp);
                                        const rank = getFocusRank(level);
                                        const isCurrentUser = entry.user_id === session?.user.id;
                                        return (
                                            <Animated.View
                                                entering={FadeInDown.delay(Math.min(index * 28, 280)).duration(260)}
                                                key={entry.user_id}
                                                style={[styles.row, index < remainingEntries.length - 1 && styles.rowBorder, isCurrentUser && styles.currentUserRow]}
                                            >
                                                <PositionBadge position={entry.leaderboard_position} />
                                                <RankBadge level={level} />
                                                <View style={styles.userInfo}>
                                                    <View style={styles.nameRow}>
                                                        <Text numberOfLines={1} style={styles.name}>{entry.display_name}</Text>
                                                        {isCurrentUser && <YouBadge />}
                                                    </View>
                                                    <Text style={styles.details}>Level {level}{rank ? ` · ${rank.name}` : ""}</Text>
                                                </View>
                                                <Text style={styles.xp}>{formatProgressDuration(entry.focused_seconds, true)}</Text>
                                            </Animated.View>
                                        );
                                    })}
                                </AppCard>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </AppScreenBackground>
    );
}

function PodiumCard({ entry, position, isCurrentUser, compact }: { entry: LeaderboardEntry; position: number; isCurrentUser: boolean; compact: boolean }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const level = calculateLevel(entry.total_xp);
    const rank = getFocusRank(level);

    return (
        <Animated.View entering={FadeInDown.delay(position * 70).duration(320)} style={styles.podiumSlot}>
            <AppCard style={[styles.podiumCard, position === 1 && styles.winnerCard]} tone={isCurrentUser ? "accent" : "default"} padding={compact ? "sm" : "lg"}>
                <View style={[styles.medal, entry.leaderboard_position === 1 ? styles.gold : entry.leaderboard_position === 2 ? styles.silver : styles.bronze]}><Text style={styles.medalText}>{entry.leaderboard_position}</Text></View>
                <RankBadge level={level} />
                <Text numberOfLines={1} style={styles.podiumName}>{entry.display_name}</Text>
                <Text numberOfLines={1} style={styles.podiumRank}>Level {level} · {rank?.name ?? "Focused"}</Text>
                <Text style={styles.podiumXp}>{formatProgressDuration(entry.focused_seconds, true)}</Text>
                {isCurrentUser && <YouBadge />}
            </AppCard>
        </Animated.View>
    );
}

function PositionBadge({ position }: { position: number }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    return <View style={styles.positionContainer}><Text style={styles.position}>{position}</Text></View>;
}

function YouBadge() {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    return <View style={styles.youBadge}><Text style={styles.youBadgeText}>You</Text></View>;
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        scrollView: { flex: 1, backgroundColor: "transparent" },
        container: { width: "100%", maxWidth: layout.contentMaxWidth, alignSelf: "center", padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg },
        headerIcon: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: radius.md, borderWidth: 1, borderColor: colours.primaryBorder, backgroundColor: colours.primarySubtle },
        periodControl: { flexDirection: "row", padding: 4, borderWidth: 1, borderColor: colours.border, borderRadius: radius.md, backgroundColor: colours.primarySubtle },
        periodOption: { flex: 1, alignItems: "center", paddingVertical: 10, paddingHorizontal: spacing.sm, borderRadius: radius.sm },
        periodOptionSelected: { backgroundColor: colours.surface },
        periodOptionText: { fontSize: 13, fontWeight: "700", textAlign: "center", color: colours.textMuted },
        periodOptionTextSelected: { color: colours.primaryStrong },
        rulesTitle: { fontSize: 13, fontWeight: "800", color: colours.text },
        rulesText: { marginTop: 3, fontSize: 12, lineHeight: 18, color: colours.textMuted },
        sectionHeading: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md },
        sectionTitle: { fontSize: 17, fontWeight: "800", color: colours.text },
        sectionCaption: { fontSize: 12, fontWeight: "600", color: colours.textMuted },
        podium: { flexDirection: "row", gap: spacing.md },
        podiumCompact: { gap: spacing.sm },
        podiumSlot: { minWidth: 0, flex: 1 },
        podiumCard: { minHeight: 218, alignItems: "center", justifyContent: "center", gap: spacing.sm },
        winnerCard: { borderColor: colours.leaderboardGold },
        medal: { position: "absolute", top: spacing.sm, right: spacing.sm, width: 26, height: 26, alignItems: "center", justifyContent: "center", borderRadius: radius.pill },
        gold: { backgroundColor: colours.leaderboardGoldSoft },
        silver: { backgroundColor: colours.leaderboardSilverSoft },
        bronze: { backgroundColor: colours.leaderboardBronzeSoft },
        medalText: { fontSize: 12, fontWeight: "900", color: colours.text },
        podiumName: { width: "100%", fontSize: 15, fontWeight: "800", textAlign: "center", color: colours.text },
        podiumRank: { width: "100%", fontSize: 11, textAlign: "center", color: colours.textMuted },
        podiumXp: { fontSize: 14, fontWeight: "900", color: colours.primaryStrong },
        rankingSection: { gap: spacing.md },
        leaderboardCard: { overflow: "hidden" },
        row: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.sm, paddingVertical: spacing.md, gap: spacing.md, borderRadius: radius.md },
        rowBorder: { borderBottomWidth: 1, borderBottomColor: colours.border },
        currentUserRow: { backgroundColor: colours.primarySubtle },
        positionContainer: { width: 36, height: 36, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.primarySoft },
        position: { fontSize: 14, fontWeight: "800", color: colours.primaryStrong },
        userInfo: { minWidth: 0, flex: 1 },
        nameRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
        name: { minWidth: 0, flexShrink: 1, fontSize: 15, fontWeight: "700", color: colours.text },
        details: { marginTop: 3, fontSize: 12, color: colours.textMuted },
        xp: { flexShrink: 0, fontSize: 13, fontWeight: "800", color: colours.primaryStrong },
        youBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.pill, borderWidth: 1, borderColor: colours.primaryBorder, backgroundColor: colours.primarySubtle },
        youBadgeText: { fontSize: 10, fontWeight: "800", color: colours.primaryStrong },
        myPositionSection: { gap: spacing.sm },
        sectionLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 0.7, color: colours.textMuted },
        myPositionCard: { flexDirection: "row", alignItems: "center", gap: spacing.md },
        messageCard: { minHeight: 180, alignItems: "center", justifyContent: "center", gap: spacing.sm },
        emptyIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.primarySoft },
        emptyTitle: { fontSize: 18, fontWeight: "800", color: colours.text },
        messageText: { maxWidth: 360, fontSize: 14, lineHeight: 20, textAlign: "center", color: colours.textMuted },
        errorText: { fontSize: 14, textAlign: "center", color: colours.danger },
    });
}
