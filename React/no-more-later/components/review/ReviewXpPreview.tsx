import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ChevronDown, ChevronUp, Clock3, Info, Sparkles, Zap } from "lucide-react-native";

import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import type { AppColours } from "@/constants/appearanceColours";
import { DAILY_CREDITED_FOCUS_SECONDS } from "@/constants/xp";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import type { SessionOutcome } from "@/types/models";
import { calculateFocusXpPreview } from "@/utils/xp";

type ReviewXpPreviewProps = {
    actualFocusedSeconds: number;
    selectedOutcome: SessionOutcome | null;
    dailyCreditedSeconds: number;
    serverTracked: boolean;
};

export function ReviewXpPreview({ actualFocusedSeconds, selectedOutcome, dailyCreditedSeconds, serverTracked }: ReviewXpPreviewProps) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const [showExplanation, setShowExplanation] = useState(false);
    const breakdown = calculateFocusXpPreview({ actualFocusedSeconds, outcome: selectedOutcome, dailyCreditedSeconds });
    const dailyMinutes = Math.floor(dailyCreditedSeconds / 60);
    const dailyLimitMinutes = DAILY_CREDITED_FOCUS_SECONDS / 60;

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.headerIcon}><Zap size={18} color={colours.primaryStrong} /></View>
                <View style={styles.headerCopy}>
                    <Text style={styles.eyebrow}>XP PREVIEW</Text>
                    <Text style={styles.title}>This Review can earn {serverTracked ? breakdown.totalXp : 0} XP</Text>
                </View>
            </View>

            {!serverTracked ? (
                <Text style={styles.statusText}>This session was not verified by the server, so it can be saved to personal History but cannot award XP or leaderboard time.</Text>
            ) : breakdown.creditStatus === "under_minimum" ? (
                <Text style={styles.statusText}>Focus for at least five complete minutes to earn XP. This session can still be saved to History.</Text>
            ) : breakdown.creditStatus === "daily_limit" ? (
                <Text style={styles.statusText}>Today&apos;s six-hour XP and leaderboard limit has been reached. Your full time will still appear in personal Progress.</Text>
            ) : (
                <View style={styles.breakdown}>
                    <BreakdownRow icon={<Clock3 size={15} color={colours.textMuted} />} label={`${breakdown.creditedFocusMinutes} focused ${breakdown.creditedFocusMinutes === 1 ? "minute" : "minutes"}`} value={`+${breakdown.baseXp} XP`} />
                    <BreakdownRow icon={<Sparkles size={15} color={colours.textMuted} />} label="Completed-work bonus" value={selectedOutcome === "completed" ? `+${breakdown.bonusXp} XP` : "Not applied"} muted={selectedOutcome !== "completed"} />
                    <View style={styles.divider} />
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Estimated total</Text>
                        <Text style={styles.totalValue}>+{breakdown.totalXp} XP</Text>
                    </View>
                    {breakdown.creditedFocusSeconds < actualFocusedSeconds ? (
                        <Text style={styles.capNotice}>The daily limit reduces the credited portion of this session. Personal Progress still records the full time.</Text>
                    ) : null}
                </View>
            )}

            <AnimatedPressable style={styles.explainerButton} haptic="selection" onPress={() => setShowExplanation((current) => !current)}>
                <Info size={15} color={colours.primaryStrong} />
                <Text style={styles.explainerButtonText}>How XP works</Text>
                {showExplanation ? <ChevronUp size={15} color={colours.textMuted} /> : <ChevronDown size={15} color={colours.textMuted} />}
            </AnimatedPressable>

            {showExplanation ? (
                <View style={styles.explanation}>
                    <Text style={styles.explanationText}>• Earn 3 XP for every complete focused minute after five minutes.</Text>
                    <Text style={styles.explanationText}>• Completing the work adds 20%. Progressed, blocked, and stopped outcomes keep their full time XP.</Text>
                    <Text style={styles.explanationText}>• Up to 360 focused minutes per day count toward XP and leaderboards. Breaks never award XP.</Text>
                    <Text style={styles.dailyText}>Today: {Math.min(dailyMinutes, dailyLimitMinutes)} / {dailyLimitMinutes} credited minutes before this Review</Text>
                </View>
            ) : null}
        </View>
    );
}

function BreakdownRow({ icon, label, value, muted = false }: { icon: React.ReactNode; label: string; value: string; muted?: boolean }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    return (
        <View style={styles.row}>
            {icon}
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={[styles.rowValue, muted && styles.mutedValue]}>{value}</Text>
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        card: { padding: spacing.md, gap: spacing.md, borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.lg, backgroundColor: colours.primarySubtle },
        header: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
        headerIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.primarySoft },
        headerCopy: { minWidth: 0, flex: 1 },
        eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 0.8, color: colours.primaryStrong },
        title: { marginTop: 2, fontSize: 16, fontWeight: "800", color: colours.text },
        statusText: { fontSize: 13, lineHeight: 19, color: colours.textMuted },
        breakdown: { gap: spacing.sm },
        row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
        rowLabel: { minWidth: 0, flex: 1, fontSize: 13, color: colours.textMuted },
        rowValue: { flexShrink: 0, fontSize: 13, fontWeight: "800", color: colours.text },
        mutedValue: { fontWeight: "600", color: colours.textMuted },
        divider: { height: 1, backgroundColor: colours.primaryBorder },
        totalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
        totalLabel: { fontSize: 14, fontWeight: "800", color: colours.text },
        totalValue: { fontSize: 18, fontWeight: "900", color: colours.primaryStrong },
        capNotice: { fontSize: 12, lineHeight: 18, color: colours.warning },
        explainerButton: { minHeight: 40, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.sm, borderRadius: radius.md, backgroundColor: colours.surface },
        explainerButtonText: { minWidth: 0, flex: 1, fontSize: 13, fontWeight: "700", color: colours.primaryStrong },
        explanation: { gap: spacing.xs, paddingHorizontal: spacing.xs },
        explanationText: { fontSize: 12, lineHeight: 18, color: colours.textMuted },
        dailyText: { marginTop: spacing.xs, fontSize: 12, fontWeight: "700", color: colours.text },
    });
}
