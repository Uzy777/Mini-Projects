import { useMemo } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Award, CheckCircle2, Clock3, EyeOff, Flame, Sparkles, Target, Trophy, UsersRound, X, Zap } from "lucide-react-native";
import Animated, { FadeIn, FadeInUp, useReducedMotion } from "react-native-reanimated";

import { BadgeArtwork, getTierTone } from "@/components/badges/BadgeArtwork";
import { RankBadge } from "@/components/ranks/RankBadge";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { BADGE_DEFINITION_BY_ID } from "@/constants/badges";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import type { LeaderboardEntry, LeaderboardPeriod, LeaderboardProfile } from "@/services/leaderboard/leaderboardService";
import { formatProgressDuration } from "@/utils/dashboardStats";
import { calculateLevel } from "@/utils/level";
import { getFocusRank } from "@/utils/rank";

type LeaderboardProfileModalProps = {
    visible: boolean;
    entry: LeaderboardEntry | null;
    profile: LeaderboardProfile | null;
    period: LeaderboardPeriod;
    isLoading: boolean;
    errorMessage: string | null;
    onClose: () => void;
};

export function LeaderboardProfileModal({
    visible,
    entry,
    profile,
    period,
    isLoading,
    errorMessage,
    onClose,
}: LeaderboardProfileModalProps) {
    const { colours } = useAppearance();
    const { width, height } = useWindowDimensions();
    const reduceMotion = useReducedMotion();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const isCompact = width < 660;
    const totalXp = profile?.total_xp ?? entry?.total_xp ?? 0;
    const level = calculateLevel(totalXp);
    const rank = getFocusRank(level);
    const displayName = profile?.display_name ?? entry?.display_name ?? "Focuser";
    const isAnonymous = profile?.is_anonymous ?? entry?.is_anonymous ?? false;

    return (
        <Modal transparent visible={visible} animationType={reduceMotion ? "none" : "fade"} statusBarTranslucent onRequestClose={onClose}>
            <View style={[styles.backdrop, isCompact && styles.backdropCompact]}>
                <Pressable accessibilityRole="button" accessibilityLabel="Close leaderboard profile" onPress={onClose} style={styles.backdropDismiss} />
                <Animated.View
                    entering={reduceMotion ? undefined : FadeInUp.duration(220)}
                    style={[styles.sheet, isCompact && styles.sheetCompact, { maxHeight: Math.max(360, height - (isCompact ? 20 : 80)) }]}
                >
                    <View style={styles.header}>
                        <RankBadge level={level} />
                        <View style={styles.headerCopy}>
                            <View style={styles.nameRow}>
                                <Text numberOfLines={1} style={styles.name}>{displayName}</Text>
                                {isAnonymous ? <View style={styles.identityPill}><EyeOff size={11} color={colours.textMuted} /><Text style={styles.identityPillText}>PRIVATE</Text></View> : null}
                                {profile?.is_buddy ? <View style={styles.buddyPill}><UsersRound size={11} color={colours.primaryStrong} /><Text style={styles.buddyPillText}>BUDDY</Text></View> : null}
                            </View>
                            <Text style={styles.rankText}>Level {level} · {rank?.name ?? "Focused"}</Text>
                        </View>
                        <AnimatedPressable accessibilityLabel="Close leaderboard profile" haptic="none" onPress={onClose} style={styles.closeButton}>
                            <X size={19} color={colours.textMuted} />
                        </AnimatedPressable>
                    </View>

                    {isLoading ? (
                        <View style={styles.loadingState}>
                            <ActivityIndicator color={colours.primary} />
                            <Text style={styles.loadingText}>Loading focus profile…</Text>
                        </View>
                    ) : errorMessage ? (
                        <View style={styles.loadingState}>
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        </View>
                    ) : profile ? (
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                            <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(180)}>
                                {isAnonymous ? (
                                    <View style={styles.privacyNotice}>
                                        <EyeOff size={16} color={colours.textMuted} />
                                        <Text style={styles.privacyNoticeText}>This focuser has hidden their public display name. Their achievement stats remain visible.</Text>
                                    </View>
                                ) : null}

                                <View style={[styles.metricGrid, isCompact && styles.metricGridCompact]}>
                                    <Metric icon={Clock3} label={period === "30_days" ? "30-DAY FOCUS" : "ALL-TIME FOCUS"} value={formatProgressDuration(profile.focused_seconds, true)} compact={isCompact} />
                                    <Metric icon={Target} label="SESSIONS" value={profile.qualifying_sessions.toLocaleString()} compact={isCompact} />
                                    <Metric icon={CheckCircle2} label="TASKS FINISHED" value={profile.completed_tasks.toLocaleString()} compact={isCompact} />
                                    <Metric icon={Flame} label="BEST STREAK" value={`${profile.best_streak.toLocaleString()}d`} compact={isCompact} />
                                    <Metric icon={Trophy} label="LIFETIME FOCUS" value={formatProgressDuration(profile.all_time_focused_seconds, true)} compact={isCompact} />
                                    <Metric icon={Zap} label="TOTAL XP" value={profile.total_xp.toLocaleString()} compact={isCompact} />
                                </View>

                                <View style={styles.badgeHeader}>
                                    <View>
                                        <Text style={styles.sectionEyebrow}>ACHIEVEMENTS</Text>
                                        <Text style={styles.sectionTitle}>Badge showcase</Text>
                                    </View>
                                    <View style={styles.badgeCount}><Award size={13} color={colours.primaryStrong} /><Text style={styles.badgeCountText}>{profile.badges.length}/7</Text></View>
                                </View>

                                {profile.badges.length > 0 ? (
                                    <View style={styles.badgeGrid}>
                                        {profile.badges.map((badge) => {
                                            const definition = BADGE_DEFINITION_BY_ID[badge.badge_id];
                                            const tone = getTierTone(badge.tier, colours);

                                            return (
                                                <View key={badge.badge_id} style={[styles.badgeCard, isCompact && styles.badgeCardCompact]}>
                                                    <BadgeArtwork badgeId={badge.badge_id} tier={badge.tier} size={isCompact ? 54 : 64} />
                                                    <View style={[styles.badgeCopy, isCompact && styles.badgeCopyCompact]}>
                                                        <Text numberOfLines={isCompact ? 2 : 1} style={[styles.badgeName, isCompact && styles.badgeNameCompact]}>{definition.name}</Text>
                                                        <View style={[styles.tierPill, { backgroundColor: tone.soft }]}> 
                                                            <Text style={[styles.tierText, { color: tone.strong }]}>{badge.tier.toUpperCase()}{isCompact ? "" : ` · ${badge.tier_count}/5`}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                ) : (
                                    <View style={styles.emptyBadges}>
                                        <Sparkles size={21} color={colours.textMuted} />
                                        <Text style={styles.emptyBadgeText}>No badge tiers unlocked yet.</Text>
                                    </View>
                                )}
                            </Animated.View>
                        </ScrollView>
                    ) : null}
                </Animated.View>
            </View>
        </Modal>
    );
}

function Metric({ icon: Icon, label, value, compact }: { icon: typeof Clock3; label: string; value: string; compact: boolean }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <View style={[styles.metric, compact && styles.metricCompact]}>
            <View style={styles.metricIcon}><Icon size={16} color={colours.primaryStrong} /></View>
            <Text style={styles.metricValue}>{value}</Text>
            <Text style={styles.metricLabel}>{label}</Text>
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        backdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, backgroundColor: "rgba(4, 6, 14, 0.7)" },
        backdropCompact: { padding: spacing.sm },
        backdropDismiss: { ...StyleSheet.absoluteFillObject },
        sheet: { width: "100%", maxWidth: 820, overflow: "hidden", borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.xl, backgroundColor: colours.surface, shadowColor: "#000", shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.28, shadowRadius: 34, elevation: 24 },
        sheetCompact: { borderRadius: radius.lg },
        header: { padding: spacing.lg, flexDirection: "row", alignItems: "center", gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colours.border, backgroundColor: colours.primarySubtle },
        headerCopy: { minWidth: 0, flex: 1 },
        nameRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
        name: { minWidth: 0, flexShrink: 1, fontSize: 22, lineHeight: 28, fontWeight: "900", color: colours.text },
        rankText: { marginTop: 3, fontSize: 11, color: colours.textMuted },
        identityPill: { paddingHorizontal: 7, paddingVertical: 4, flexDirection: "row", alignItems: "center", gap: 4, borderRadius: radius.pill, backgroundColor: colours.background },
        identityPillText: { fontSize: 7, fontWeight: "900", letterSpacing: 0.5, color: colours.textMuted },
        buddyPill: { paddingHorizontal: 7, paddingVertical: 4, flexDirection: "row", alignItems: "center", gap: 4, borderRadius: radius.pill, backgroundColor: colours.primarySoft },
        buddyPillText: { fontSize: 7, fontWeight: "900", letterSpacing: 0.5, color: colours.primaryStrong },
        closeButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colours.border, borderRadius: radius.pill, backgroundColor: colours.surface },
        content: { padding: spacing.lg },
        loadingState: { minHeight: 320, padding: spacing.xl, alignItems: "center", justifyContent: "center", gap: spacing.sm },
        loadingText: { fontSize: 13, color: colours.textMuted },
        errorText: { maxWidth: 360, fontSize: 13, lineHeight: 19, textAlign: "center", color: colours.danger },
        privacyNotice: { marginBottom: spacing.md, padding: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm, borderRadius: radius.md, backgroundColor: colours.background },
        privacyNoticeText: { minWidth: 0, flex: 1, fontSize: 10, lineHeight: 16, color: colours.textMuted },
        metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
        metricGridCompact: { gap: 7 },
        metric: { width: "32.4%", minHeight: 108, flexGrow: 1, padding: spacing.md, justifyContent: "center", borderWidth: 1, borderColor: colours.border, borderRadius: radius.md, backgroundColor: colours.background },
        metricCompact: { width: "48%", minHeight: 98, padding: spacing.sm },
        metricIcon: { width: 30, height: 30, alignItems: "center", justifyContent: "center", borderRadius: radius.sm, backgroundColor: colours.primarySoft },
        metricValue: { marginTop: spacing.sm, fontSize: 17, fontWeight: "900", color: colours.text },
        metricLabel: { marginTop: 3, fontSize: 7, fontWeight: "900", letterSpacing: 0.65, color: colours.textMuted },
        badgeHeader: { marginTop: spacing.xl, marginBottom: spacing.md, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: spacing.md },
        sectionEyebrow: { fontSize: 8, fontWeight: "900", letterSpacing: 0.8, color: colours.primaryStrong },
        sectionTitle: { marginTop: 3, fontSize: 18, fontWeight: "900", color: colours.text },
        badgeCount: { paddingHorizontal: 9, paddingVertical: 6, flexDirection: "row", alignItems: "center", gap: 5, borderRadius: radius.pill, backgroundColor: colours.primarySoft },
        badgeCountText: { fontSize: 10, fontWeight: "900", color: colours.primaryStrong },
        badgeGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: spacing.sm },
        badgeCard: { width: "31%", minWidth: 0, padding: spacing.sm, flexDirection: "row", alignItems: "center", gap: spacing.sm, borderWidth: 1, borderColor: colours.border, borderRadius: radius.md, backgroundColor: colours.background },
        badgeCardCompact: { width: "30%", minHeight: 126, paddingHorizontal: 5, flexDirection: "column", justifyContent: "center", gap: 5 },
        badgeCopy: { minWidth: 0, flex: 1, alignItems: "flex-start" },
        badgeCopyCompact: { width: "100%", flex: 0, alignItems: "center" },
        badgeName: { maxWidth: "100%", fontSize: 11, fontWeight: "800", color: colours.text },
        badgeNameCompact: { minHeight: 28, fontSize: 9, lineHeight: 13, textAlign: "center" },
        tierPill: { marginTop: 5, paddingHorizontal: 7, paddingVertical: 4, borderRadius: radius.pill },
        tierText: { fontSize: 7, fontWeight: "900", letterSpacing: 0.45 },
        emptyBadges: { minHeight: 110, alignItems: "center", justifyContent: "center", gap: spacing.sm, borderWidth: 1, borderStyle: "dashed", borderColor: colours.border, borderRadius: radius.md, backgroundColor: colours.background },
        emptyBadgeText: { fontSize: 11, color: colours.textMuted },
    });
}
