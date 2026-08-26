import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { ChevronRight, QrCode, Settings2, Sparkles, Trophy, UserPlus, UsersRound } from "lucide-react-native";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";

import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";
import { BuddyInviteModal } from "@/components/leaderboard/BuddyInviteModal";
import { BuddyManagerModal } from "@/components/leaderboard/BuddyManagerModal";
import { LeaderboardProfileModal } from "@/components/leaderboard/LeaderboardProfileModal";
import { RankBadge } from "@/components/ranks/RankBadge";
import { AppCard } from "@/components/ui/AppCard";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { AppButton } from "@/components/ui/AppButton";
import type { AppColours } from "@/constants/appearanceColours";
import { getScreenGutter, layout, radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { useAuth } from "@/contexts/AuthContext";
import {
    getLeaderboard,
    getLeaderboardProfile,
    getMyBuddies,
    getMyLeaderboardPosition,
    normalizeBuddyCode,
    type LeaderboardEntry,
    type LeaderboardPeriod,
    type LeaderboardProfile,
    type LeaderboardScope,
    type MyLeaderboardPosition,
} from "@/services/leaderboard/leaderboardService";
import { calculateLevel } from "@/utils/level";
import { getFocusRank } from "@/utils/rank";
import { formatProgressDuration } from "@/utils/dashboardStats";

export default function LeaderboardScreen() {
    const { colours } = useAppearance();
    const { session } = useAuth();
    const { width } = useWindowDimensions();
    const reduceMotion = useReducedMotion();
    const isNarrow = width < 420;
    const styles = useMemo(() => createStyles(colours, getScreenGutter(width), isNarrow), [colours, isNarrow, width]);
    const isWide = width >= 760;
    const params = useLocalSearchParams<{ buddyCode?: string | string[] }>();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [myPosition, setMyPosition] = useState<MyLeaderboardPosition | null>(null);
    const [period, setPeriod] = useState<LeaderboardPeriod>("30_days");
    const [scope, setScope] = useState<LeaderboardScope>("global");
    const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);
    const [selectedProfile, setSelectedProfile] = useState<LeaderboardProfile | null>(null);
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [buddyCount, setBuddyCount] = useState(0);
    const [isBuddyInviteVisible, setIsBuddyInviteVisible] = useState(false);
    const [isBuddyManagerVisible, setIsBuddyManagerVisible] = useState(false);
    const [incomingBuddyCode, setIncomingBuddyCode] = useState<string | null>(null);

    const loadLeaderboard = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const [leaderboardData, myPositionData, buddies] = await Promise.all([getLeaderboard(period, scope), getMyLeaderboardPosition(period, scope), getMyBuddies()]);
            setLeaderboard(leaderboardData);
            setMyPosition(myPositionData);
            setBuddyCount(buddies.length);
        } catch (error) {
            console.error("Failed to load leaderboard:", error);
            setErrorMessage("Unable to load the leaderboard. Pull down to try again.");
        } finally {
            setIsLoading(false);
        }
    }, [period, scope]);

    useFocusEffect(useCallback(() => { loadLeaderboard(); }, [loadLeaderboard]));

    useEffect(() => {
        const rawCode = Array.isArray(params.buddyCode) ? params.buddyCode[0] : params.buddyCode;
        const normalizedCode = normalizeBuddyCode(rawCode ?? "");
        if (!normalizedCode) return;

        setIncomingBuddyCode(normalizedCode);
        setIsBuddyInviteVisible(true);
    }, [params.buddyCode]);

    const topThree = leaderboard.slice(0, 3);
    const remainingEntries = leaderboard.slice(3);
    const myLevel = myPosition ? calculateLevel(myPosition.total_xp) : null;
    const myRank = myLevel !== null ? getFocusRank(myLevel) : null;

    async function openProfile(entry: LeaderboardEntry) {
        setSelectedEntry(entry);
        setSelectedProfile(null);
        setProfileError(null);
        setIsProfileLoading(true);

        try {
            setSelectedProfile(await getLeaderboardProfile(entry.user_id, period));
        } catch (error) {
            console.error("Failed to load leaderboard profile:", error);
            setProfileError("This focus profile could not be loaded. Try again in a moment.");
        } finally {
            setIsProfileLoading(false);
        }
    }

    function closeProfile() {
        setSelectedEntry(null);
        setSelectedProfile(null);
        setProfileError(null);
        setIsProfileLoading(false);
    }

    function openBuddyInvite() {
        setIncomingBuddyCode(null);
        setIsBuddyInviteVisible(true);
    }

    function closeBuddyInvite() {
        setIsBuddyInviteVisible(false);
        setIncomingBuddyCode(null);
    }

    async function handleBuddyAdded() {
        setScope("buddies");
        const buddies = await getMyBuddies();
        setBuddyCount(buddies.length);
    }

    async function handleBuddiesChanged() {
        const buddies = await getMyBuddies();
        setBuddyCount(buddies.length);
        await loadLeaderboard();
    }

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

                <View style={[styles.filterRow, !isWide && styles.filterRowCompact]}>
                    <View style={[styles.periodFilter, !isWide && styles.controlCompact]}>
                        <SegmentedControl
                            value={period}
                            onChange={setPeriod}
                            options={[
                                { value: "30_days", label: "Last 30 days" },
                                { value: "all_time", label: "All time" },
                            ]}
                        />
                    </View>

                    <View style={[styles.scopeFilter, !isWide && styles.controlCompact]}>
                        <SegmentedControl
                            value={scope}
                            onChange={setScope}
                            options={[
                                { value: "global", label: "Everyone" },
                                { value: "buddies", label: "Buddies" },
                            ]}
                        />
                    </View>
                </View>

                <AppCard padding="md" tone="subtle">
                    <Text style={styles.rulesTitle}>Focused time, not XP</Text>
                    <Text style={styles.rulesText}>Reviewed Focus Sessions of at least five minutes count. Up to six hours per day can contribute; breaks never count.</Text>
                </AppCard>

                {scope === "buddies" ? (
                    <AppCard style={[styles.buddyNotice, !isWide && styles.buddyNoticeCompact]} padding="md" tone="accent">
                        <View style={styles.buddyNoticeIcon}><UsersRound size={18} color={colours.primaryStrong} /></View>
                        <View style={styles.buddyNoticeCopy}>
                            <Text style={styles.rulesTitle}>Your close circle</Text>
                            <Text style={styles.rulesText}>{buddyCount === 0 ? "Invite your first buddy with a secure code, link or QR." : `${buddyCount} ${buddyCount === 1 ? "buddy" : "buddies"} connected. Private members remain visible here.`}</Text>
                        </View>
                        <View style={[styles.buddyActions, !isWide && styles.buddyActionsCompact]}>
                            {buddyCount > 0 ? (
                                <AnimatedPressable accessibilityRole="button" onPress={() => setIsBuddyManagerVisible(true)} style={styles.manageAction}>
                                    <Settings2 size={16} color={colours.primaryStrong} />
                                    <Text style={styles.manageActionText}>Manage</Text>
                                </AnimatedPressable>
                            ) : null}
                            <AnimatedPressable accessibilityRole="button" onPress={openBuddyInvite} style={styles.buddyAction}>
                                <QrCode size={16} color={colours.onPrimary} />
                                <Text style={styles.buddyActionText}>Invite or add</Text>
                            </AnimatedPressable>
                        </View>
                    </AppCard>
                ) : null}

                {isLoading && leaderboard.length === 0 ? (
                    <AppCard accessibilityLiveRegion="polite" style={styles.messageCard} padding="lg">
                        <ActivityIndicator color={colours.primary} />
                        <Text style={styles.messageText}>Loading the latest rankings…</Text>
                    </AppCard>
                ) : errorMessage ? (
                    <AppCard accessibilityRole="alert" style={styles.messageCard} padding="lg">
                        <Text style={styles.errorText}>{errorMessage}</Text>
                        <AppButton label="Try again" variant="soft" size="sm" onPress={() => void loadLeaderboard()} />
                    </AppCard>
                ) : leaderboard.length === 0 ? (
                    <AppCard style={styles.messageCard} padding="lg" tone="subtle">
                        <View style={styles.emptyIcon}>{scope === "buddies" ? <UsersRound size={22} color={colours.primaryStrong} /> : <Sparkles size={22} color={colours.primaryStrong} />}</View>
                        <Text style={styles.emptyTitle}>{scope === "buddies" ? "Your buddy circle is waiting" : "The first spot is waiting"}</Text>
                        <Text style={styles.messageText}>
                            {scope === "buddies"
                                ? "Invite a friend with a code, link or QR. Once connected, their qualifying focus will appear here."
                                : "Complete and review a five-minute Focus Session to join the leaderboard."}
                        </Text>
                        {scope === "buddies" ? (
                            <AnimatedPressable accessibilityRole="button" onPress={openBuddyInvite} style={styles.emptyAction}>
                                <UserPlus size={16} color={colours.onPrimary} />
                                <Text style={styles.buddyActionText}>Add a buddy</Text>
                            </AnimatedPressable>
                        ) : null}
                    </AppCard>
                ) : (
                    <>
                        <View style={styles.sectionHeading}>
                            <Text style={styles.sectionTitle}>Top focusers</Text>
                            <Text style={styles.sectionCaption}>{period === "30_days" ? "Rolling 30-day focus" : "Lifetime focus"}</Text>
                        </View>
                        <View style={[styles.podium, !isWide && styles.podiumCompact]}>
                            {topThree.map((entry, index) => (
                                <PodiumCard key={entry.user_id} entry={entry} position={index + 1} isCurrentUser={entry.user_id === session?.user.id} compact={!isWide} onPress={() => void openProfile(entry)} />
                            ))}
                        </View>

                        {myPosition && myPosition.leaderboard_position > 25 && myLevel !== null && (
                            <View style={styles.myPositionSection}>
                                <Text style={styles.sectionLabel}>YOUR POSITION</Text>
                                <AnimatedPressable onPress={() => void openProfile(myPosition)} haptic="selection">
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
                                        {!isNarrow ? <ChevronRight size={18} color={colours.textMuted} /> : null}
                                    </AppCard>
                                </AnimatedPressable>
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
                                                entering={reduceMotion ? undefined : FadeInDown.delay(Math.min(index * 28, 280)).duration(260)}
                                                key={entry.user_id}
                                            >
                                                <AnimatedPressable
                                                    accessibilityRole="button"
                                                    accessibilityLabel={`View ${entry.display_name}'s focus profile`}
                                                    haptic="selection"
                                                    onPress={() => void openProfile(entry)}
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
                                                    {!isNarrow ? <ChevronRight size={18} color={colours.textMuted} /> : null}
                                                </AnimatedPressable>
                                            </Animated.View>
                                        );
                                    })}
                                </AppCard>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            <LeaderboardProfileModal
                visible={selectedEntry !== null}
                entry={selectedEntry}
                profile={selectedProfile}
                period={period}
                isLoading={isProfileLoading}
                errorMessage={profileError}
                onClose={closeProfile}
            />
            <BuddyInviteModal
                visible={isBuddyInviteVisible}
                incomingCode={incomingBuddyCode}
                onClose={closeBuddyInvite}
                onBuddyAdded={handleBuddyAdded}
            />
            <BuddyManagerModal
                visible={isBuddyManagerVisible}
                onClose={() => setIsBuddyManagerVisible(false)}
                onBuddiesChanged={handleBuddiesChanged}
            />
        </AppScreenBackground>
    );
}

function PodiumCard({ entry, position, isCurrentUser, compact, onPress }: { entry: LeaderboardEntry; position: number; isCurrentUser: boolean; compact: boolean; onPress: () => void }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const reduceMotion = useReducedMotion();
    const level = calculateLevel(entry.total_xp);
    const rank = getFocusRank(level);

    return (
        <Animated.View entering={reduceMotion ? undefined : FadeInDown.delay(position * 70).duration(320)} style={styles.podiumSlot}>
            <AnimatedPressable accessibilityRole="button" accessibilityLabel={`View ${entry.display_name}'s focus profile`} onPress={onPress} haptic="selection" style={styles.podiumButton}>
                <AppCard style={[styles.podiumCard, compact && styles.podiumCardCompact, position === 1 && styles.winnerCard]} tone={isCurrentUser ? "accent" : "default"} padding={compact ? "md" : "lg"}>
                    <View style={[styles.medal, entry.leaderboard_position === 1 ? styles.gold : entry.leaderboard_position === 2 ? styles.silver : styles.bronze]}><Text style={styles.medalText}>{entry.leaderboard_position}</Text></View>
                    <RankBadge level={level} />
                    <Text numberOfLines={1} style={styles.podiumName}>{entry.display_name}</Text>
                    <Text numberOfLines={1} style={styles.podiumRank}>Level {level} · {rank?.name ?? "Focused"}</Text>
                    <Text style={styles.podiumXp}>{formatProgressDuration(entry.focused_seconds, true)}</Text>
                    {isCurrentUser && <YouBadge />}
                    <Text style={styles.viewProfileText}>View profile</Text>
                </AppCard>
            </AnimatedPressable>
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

function createStyles(colours: AppColours, gutter: number = spacing.lg, isNarrow = false) {
    return StyleSheet.create({
        scrollView: { flex: 1, backgroundColor: "transparent" },
        container: { width: "100%", maxWidth: layout.contentMaxWidth, alignSelf: "center", paddingHorizontal: gutter, paddingTop: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg },
        headerIcon: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: radius.md, borderWidth: 1, borderColor: colours.primaryBorder, backgroundColor: colours.primarySubtle },
        filterRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
        filterRowCompact: { flexDirection: "column", alignItems: "stretch" },
        periodFilter: { minWidth: 0, flex: 1 },
        scopeFilter: { width: 280 },
        controlCompact: { width: "100%", flex: 0 },
        rulesTitle: { fontSize: 13, fontWeight: "800", color: colours.text },
        rulesText: { marginTop: 3, fontSize: 12, lineHeight: 18, color: colours.textMuted },
        buddyNotice: { flexDirection: "row", alignItems: "center", gap: spacing.md },
        buddyNoticeCompact: { flexWrap: "wrap" },
        buddyNoticeIcon: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: radius.md, backgroundColor: colours.primarySoft },
        buddyNoticeCopy: { minWidth: 0, flex: 1 },
        buddyActions: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
        buddyActionsCompact: { width: "100%", justifyContent: "flex-end" },
        buddyAction: { minHeight: 40, paddingHorizontal: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, borderRadius: radius.md, backgroundColor: colours.primary },
        buddyActionText: { fontSize: 12, fontWeight: "900", color: colours.onPrimary },
        manageAction: { minHeight: 40, paddingHorizontal: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.md, backgroundColor: colours.surface },
        manageActionText: { fontSize: 12, fontWeight: "900", color: colours.primaryStrong },
        sectionHeading: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md },
        sectionTitle: { fontSize: 17, fontWeight: "800", color: colours.text },
        sectionCaption: { fontSize: 12, fontWeight: "600", color: colours.textMuted },
        podium: { flexDirection: "row", gap: spacing.md },
        podiumCompact: { flexDirection: "column", gap: spacing.sm },
        podiumSlot: { minWidth: 0, flex: 1 },
        podiumButton: { width: "100%" },
        podiumCard: { minHeight: 218, alignItems: "center", justifyContent: "center", gap: spacing.sm },
        podiumCardCompact: { minHeight: 172 },
        winnerCard: { borderColor: colours.leaderboardGold },
        medal: { position: "absolute", top: spacing.sm, right: spacing.sm, width: 26, height: 26, alignItems: "center", justifyContent: "center", borderRadius: radius.pill },
        gold: { backgroundColor: colours.leaderboardGoldSoft },
        silver: { backgroundColor: colours.leaderboardSilverSoft },
        bronze: { backgroundColor: colours.leaderboardBronzeSoft },
        medalText: { fontSize: 12, fontWeight: "900", color: colours.text },
        podiumName: { width: "100%", fontSize: 15, fontWeight: "800", textAlign: "center", color: colours.text },
        podiumRank: { width: "100%", fontSize: 11, textAlign: "center", color: colours.textMuted },
        podiumXp: { fontSize: 14, fontWeight: "900", color: colours.primaryStrong },
        viewProfileText: { fontSize: 9, fontWeight: "800", color: colours.textMuted },
        rankingSection: { gap: spacing.md },
        leaderboardCard: { overflow: "hidden" },
        row: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.sm, paddingVertical: spacing.md, gap: isNarrow ? spacing.sm : spacing.md, borderRadius: radius.md },
        rowBorder: { borderBottomWidth: 1, borderBottomColor: colours.border },
        currentUserRow: { backgroundColor: colours.primarySubtle },
        positionContainer: { width: isNarrow ? 32 : 36, height: isNarrow ? 32 : 36, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.primarySoft },
        position: { fontSize: 14, fontWeight: "800", color: colours.primaryStrong },
        userInfo: { minWidth: 0, flex: 1 },
        nameRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
        name: { minWidth: 0, flexShrink: 1, fontSize: isNarrow ? 14 : 15, fontWeight: "700", color: colours.text },
        details: { marginTop: 3, fontSize: 12, color: colours.textMuted },
        xp: { flexShrink: 0, fontSize: 13, fontWeight: "800", color: colours.primaryStrong },
        youBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.pill, borderWidth: 1, borderColor: colours.primaryBorder, backgroundColor: colours.primarySubtle },
        youBadgeText: { fontSize: 10, fontWeight: "800", color: colours.primaryStrong },
        myPositionSection: { gap: spacing.sm },
        sectionLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 0.7, color: colours.textMuted },
        myPositionCard: { flexDirection: "row", alignItems: "center", gap: isNarrow ? spacing.sm : spacing.md },
        messageCard: { minHeight: 180, alignItems: "center", justifyContent: "center", gap: spacing.sm },
        emptyIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.primarySoft },
        emptyTitle: { fontSize: 18, fontWeight: "800", color: colours.text },
        messageText: { maxWidth: 360, fontSize: 14, lineHeight: 20, textAlign: "center", color: colours.textMuted },
        emptyAction: { minHeight: 42, marginTop: spacing.sm, paddingHorizontal: spacing.lg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, borderRadius: radius.md, backgroundColor: colours.primary },
        errorText: { fontSize: 14, textAlign: "center", color: colours.danger },
    });
}
