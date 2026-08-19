import { useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Clock3, Flame, Trophy, Zap } from "lucide-react-native";

import { RankDisplay } from "@/components/ranks/RankDisplay";
import { AnimatedProgressBar } from "@/components/ui/AnimatedProgressBar";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import type { FocusSessionRecord } from "@/types/models";
import { formatProgressDuration } from "@/utils/dashboardStats";
import { calculateCurrentStreak, calculateTotalFocusedSeconds } from "@/utils/focusSessionStats";
import { calculateLevelProgress } from "@/utils/level";

type DashboardRankCardProps = {
    sessions: FocusSessionRecord[];
};

export function DashboardRankCard({ sessions }: DashboardRankCardProps) {
    const { colours } = useAppearance();
    const { width } = useWindowDimensions();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const isWide = width >= 1100;
    const totalXp = sessions.reduce((total, session) => total + session.earnedXp, 0);
    const levelProgress = calculateLevelProgress(totalXp);
    const totalFocusedSeconds = calculateTotalFocusedSeconds(sessions);
    const currentStreak = calculateCurrentStreak(sessions);
    const progressPercentage = Math.min(100, Math.max(0, (levelProgress.xpIntoLevel / levelProgress.xpRequired) * 100));
    const remainingXp = Math.max(0, levelProgress.xpRequired - levelProgress.xpIntoLevel);

    return (
        <View style={styles.card}>
            <View style={styles.topAccent} />

            <View style={styles.header}>
                <View style={styles.headingRow}>
                    <View style={styles.headingIcon}>
                        <Trophy size={17} color={colours.primaryStrong} />
                    </View>
                    <View>
                        <Text style={styles.eyebrow}>RANK &amp; MOMENTUM</Text>
                        <Text style={styles.title}>Lifetime progress</Text>
                    </View>
                </View>
                <View style={styles.levelBadge}>
                    <Text style={styles.levelBadgeText}>Level {levelProgress.level}</Text>
                </View>
            </View>

            <View style={[styles.body, isWide && styles.bodyWide]}>
                <View style={[styles.rankSummary, isWide && styles.rankSummaryWide]}>
                    <RankDisplay level={levelProgress.level} />
                </View>

                <View style={[styles.levelProgressSection, isWide && styles.levelProgressWide]}>
                    <View style={styles.progressLabels}>
                        <Text style={styles.progressLabel}>Progress to Level {levelProgress.level + 1}</Text>
                        <Text style={styles.progressValue}>{levelProgress.xpIntoLevel} / {levelProgress.xpRequired} XP</Text>
                    </View>
                    <AnimatedProgressBar progress={progressPercentage / 100} height={8} />
                    <Text style={styles.remainingText}>{remainingXp > 0 ? `${remainingXp} XP remaining` : "Next level ready"}</Text>
                </View>

                <View style={[styles.statsRow, isWide && styles.statsRowWide]}>
                    <RankStat icon={<Flame size={17} color={colours.primaryStrong} />} label="CURRENT STREAK" value={`${currentStreak} ${currentStreak === 1 ? "day" : "days"}`} />
                    <RankStat icon={<Clock3 size={17} color={colours.primaryStrong} />} label="TOTAL FOCUS" value={formatProgressDuration(totalFocusedSeconds, true)} />
                    <RankStat icon={<Zap size={17} color={colours.primaryStrong} />} label="TOTAL XP" value={totalXp.toLocaleString()} />
                </View>
            </View>
        </View>
    );
}

function RankStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <View style={styles.stat}>
            <View style={styles.statIcon}>{icon}</View>
            <Text numberOfLines={1} adjustsFontSizeToFit style={styles.statLabel}>
                {label}
            </Text>
            <Text numberOfLines={1} adjustsFontSizeToFit style={styles.statValue}>
                {value}
            </Text>
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        card: {
            position: "relative",
            overflow: "hidden",
            padding: spacing.lg,
            gap: spacing.md,
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },
        topAccent: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: colours.primaryMuted,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.sm,
        },
        headingRow: {
            minWidth: 0,
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
        },
        headingIcon: {
            width: 34,
            height: 34,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
            backgroundColor: colours.primarySubtle,
        },
        eyebrow: {
            fontSize: 10,
            fontWeight: "800",
            letterSpacing: 0.7,
            color: colours.primaryStrong,
        },
        title: {
            marginTop: 2,
            fontSize: 16,
            fontWeight: "800",
            color: colours.text,
        },
        levelBadge: {
            paddingHorizontal: 11,
            paddingVertical: 6,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            backgroundColor: colours.primarySubtle,
        },
        levelBadgeText: {
            fontSize: 12,
            fontWeight: "800",
            color: colours.primaryStrong,
        },
        body: { gap: spacing.md },
        bodyWide: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
        rankSummary: { minWidth: 0 },
        rankSummaryWide: { width: 270 },
        levelProgressSection: {
            gap: 7,
        },
        levelProgressWide: { minWidth: 180, flex: 1 },
        progressLabels: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.md,
        },
        progressLabel: {
            fontSize: 11,
            fontWeight: "700",
            color: colours.textMuted,
        },
        progressValue: {
            fontSize: 12,
            fontWeight: "800",
            color: colours.text,
        },
        remainingText: {
            fontSize: 10,
            textAlign: "right",
            color: colours.textMuted,
        },
        statsRow: {
            flexDirection: "row",
            alignItems: "flex-start",
            paddingTop: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colours.border,
        },
        statsRowWide: {
            width: 320,
            paddingTop: 0,
            paddingLeft: spacing.md,
            borderTopWidth: 0,
            borderLeftWidth: 1,
            borderLeftColor: colours.border,
        },
        stat: {
            minWidth: 0,
            flex: 1,
            alignItems: "center",
        },
        statIcon: {
            width: 32,
            height: 32,
            marginBottom: spacing.xs,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
            backgroundColor: colours.primarySubtle,
        },
        statLabel: {
            width: "100%",
            fontSize: 9,
            fontWeight: "800",
            letterSpacing: 0.4,
            textAlign: "center",
            color: colours.textMuted,
        },
        statValue: {
            width: "100%",
            marginTop: 3,
            fontSize: 14,
            fontWeight: "800",
            textAlign: "center",
            color: colours.text,
        },
    });
}
