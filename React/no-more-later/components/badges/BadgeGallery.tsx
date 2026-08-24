import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Award, CheckCircle2, ChevronRight, LockKeyhole, Sparkles, X } from "lucide-react-native";
import Animated, { FadeIn, FadeInUp, useReducedMotion } from "react-native-reanimated";

import { BadgeArtwork, getTierTone } from "@/components/badges/BadgeArtwork";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { AnimatedProgressBar } from "@/components/ui/AnimatedProgressBar";
import { BADGE_DEFINITIONS, BADGE_TIER_ORDER, getBadgeTierDefinition, getNextBadgeTierDefinition } from "@/constants/badges";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { BadgeDefinition } from "@/constants/badges";
import type { BadgeProgressMetrics, BadgeTier, BadgeUnlock } from "@/types/badges";

type BadgeGalleryProps = {
    unlocks: BadgeUnlock[];
    progress: BadgeProgressMetrics;
};

type BadgePath = {
    definition: BadgeDefinition;
    unlocks: BadgeUnlock[];
    highestTier: BadgeTier | null;
};

export function BadgeGallery({ unlocks, progress }: BadgeGalleryProps) {
    const { colours } = useAppearance();
    const { width } = useWindowDimensions();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const badgePaths = useMemo(() => getBadgePaths(unlocks), [unlocks]);
    const unlockedPaths = useMemo(() => badgePaths.filter((path) => path.highestTier !== null), [badgePaths]);
    const [isCollectionVisible, setIsCollectionVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const isCompactLauncher = width < 520;
    const totalUnlockedTiers = unlocks.length;

    return (
        <>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open badge collection. ${totalUnlockedTiers} ${totalUnlockedTiers === 1 ? "badge" : "badges"} unlocked.`}
                onHoverIn={() => setIsHovered(true)}
                onHoverOut={() => setIsHovered(false)}
                onPress={() => setIsCollectionVisible(true)}
                style={[styles.launcher, isHovered && styles.launcherHovered]}
            >
                <View style={styles.launcherAccent} />
                <View style={styles.launcherIconStage}>
                    {unlockedPaths.length > 0 ? (
                        unlockedPaths.slice(0, isCompactLauncher ? 1 : 3).map((path, index) => (
                            <View key={path.definition.id} style={[styles.previewBadge, { marginLeft: index === 0 ? 0 : -16, zIndex: 3 - index }]}>
                                <BadgeArtwork badgeId={path.definition.id} tier={path.highestTier!} size={50} />
                            </View>
                        ))
                    ) : (
                        <View style={styles.lockedPreview}><LockKeyhole size={21} color={colours.textMuted} /></View>
                    )}
                </View>

                <View style={styles.launcherCopy}>
                    <View style={styles.launcherEyebrowRow}>
                        <Award size={13} color={colours.primaryStrong} />
                        <Text style={styles.launcherEyebrow}>BADGE COLLECTION</Text>
                    </View>
                    <Text style={styles.launcherTitle}>
                        {totalUnlockedTiers} {totalUnlockedTiers === 1 ? "badge" : "badges"} unlocked
                    </Text>
                    <Text style={styles.launcherDescription}>
                        Explore every badge path, earned tiers and upcoming milestones.
                    </Text>
                </View>

                <View style={[styles.openAction, isCompactLauncher && styles.openActionCompact, isHovered && styles.openActionHovered]}>
                    {!isCompactLauncher ? <Text style={styles.openActionText}>View</Text> : null}
                    <ChevronRight size={17} color={colours.primaryStrong} />
                </View>
            </Pressable>

            <BadgeCollectionModal
                visible={isCollectionVisible}
                paths={badgePaths}
                progress={progress}
                totalUnlockedTiers={totalUnlockedTiers}
                onClose={() => setIsCollectionVisible(false)}
            />
        </>
    );
}

function BadgeCollectionModal({
    visible,
    paths,
    progress,
    totalUnlockedTiers,
    onClose,
}: {
    visible: boolean;
    paths: BadgePath[];
    progress: BadgeProgressMetrics;
    totalUnlockedTiers: number;
    onClose: () => void;
}) {
    const { colours } = useAppearance();
    const { width, height } = useWindowDimensions();
    const reduceMotion = useReducedMotion();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const [selectedBadge, setSelectedBadge] = useState<BadgePath | null>(null);
    const isCompact = width < 620;

    function closeCollection() {
        setSelectedBadge(null);
        onClose();
    }

    return (
        <Modal
            transparent
            visible={visible}
            animationType={reduceMotion ? "none" : "fade"}
            statusBarTranslucent
            onRequestClose={selectedBadge ? () => setSelectedBadge(null) : closeCollection}
        >
            <View style={[styles.modalBackdrop, isCompact && styles.modalBackdropCompact]}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close badge collection"
                    onPress={closeCollection}
                    style={styles.modalBackdropDismiss}
                />
                <Animated.View
                    entering={reduceMotion ? undefined : FadeInUp.duration(260)}
                    style={[styles.modalShell, { maxHeight: Math.max(320, height - (isCompact ? 16 : 72)) }, isCompact && styles.modalShellCompact]}
                >
                    <View style={styles.modalContent}>
                        <View style={[styles.modalHeader, isCompact && styles.modalHeaderCompact]}>
                            {!isCompact ? <View style={styles.modalHeadingIcon}><Sparkles size={18} color={colours.primaryStrong} /></View> : null}
                            <View style={styles.modalHeadingCopy}>
                                {!isCompact ? <Text style={styles.modalEyebrow}>YOUR ACHIEVEMENTS</Text> : null}
                                <Text style={[styles.modalTitle, isCompact && styles.modalTitleCompact]}>Badge collection</Text>
                                {!isCompact ? <Text style={styles.modalSubtitle}>Seven badge paths, five permanent tiers each, plus a glimpse at what comes next.</Text> : null}
                            </View>
                            <View style={[styles.modalCount, isCompact && styles.modalCountCompact]}>
                                <Text style={styles.modalCountValue}>{totalUnlockedTiers}</Text>
                                <Text style={styles.modalCountLabel}>EARNED</Text>
                            </View>
                            <AnimatedPressable accessibilityLabel="Close badge collection" haptic="none" onPress={closeCollection} style={styles.closeButton}>
                                <X size={19} color={colours.textMuted} />
                            </AnimatedPressable>
                        </View>

                        <ScrollView
                            style={styles.collectionScroll}
                            scrollEnabled={!selectedBadge}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={[styles.collectionContent, isCompact && styles.collectionContentCompact]}
                        >
                            <Text style={styles.collectionGuide}>Select any badge to view its five tiers and unlock requirements.</Text>
                            <View style={[styles.pathGrid, isCompact && styles.pathGridCompact]}>
                                {paths.map((path) => (
                                    <BadgePathCard
                                        key={path.definition.id}
                                        path={path}
                                        compact={isCompact}
                                        onPress={() => setSelectedBadge(path)}
                                    />
                                ))}
                                {/* Additional badge paths can be added here when their requirements are ready. */}
                            </View>
                        </ScrollView>

                        {selectedBadge ? (
                            <BadgeDetailOverlay
                                selection={selectedBadge}
                                metricValue={progress[selectedBadge.definition.id]}
                                compact={isCompact}
                                reduceMotion={reduceMotion}
                                onClose={() => setSelectedBadge(null)}
                            />
                        ) : null}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

function BadgePathCard({
    path,
    compact,
    onPress,
}: {
    path: BadgePath;
    compact: boolean;
    onPress: () => void;
}) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const progress = path.highestTier ? BADGE_TIER_ORDER[path.highestTier] + 1 : 0;
    const tone = path.highestTier ? getTierTone(path.highestTier, colours) : null;
    const [hovered, setHovered] = useState(false);

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={path.highestTier
                ? `${path.definition.name}, ${path.highestTier} tier. Open tier journey.`
                : `${path.definition.name}, locked. Open unlock requirements.`}
            onHoverIn={() => setHovered(true)}
            onHoverOut={() => setHovered(false)}
            onPress={onPress}
            style={[styles.pathCard, compact ? styles.pathCardCompact : styles.pathCardWide, hovered && styles.pathCardHovered]}
        >
            {path.highestTier ? (
                <BadgeArtwork badgeId={path.definition.id} tier={path.highestTier} size={compact ? 56 : 66} />
            ) : (
                <View style={[styles.lockedPathArtwork, compact && styles.lockedPathArtworkCompact]}>
                    <LockKeyhole size={compact ? 20 : 23} color={colours.textMuted} />
                </View>
            )}
            <View style={styles.pathCardCopy}>
                <Text numberOfLines={1} style={styles.pathName}>{path.definition.name}</Text>
                <View style={[styles.tierPill, { backgroundColor: tone?.soft ?? colours.surface }]}>
                    <Text style={[styles.tierText, { color: tone?.strong ?? colours.textMuted }]}>
                        {path.highestTier?.toUpperCase() ?? "LOCKED"}
                    </Text>
                </View>
                <View style={styles.pathProgressRow}>
                    {path.definition.tiers.map((tierDefinition, index) => (
                        <View
                            key={tierDefinition.tier}
                            style={[
                                styles.pathProgressDot,
                                index < progress && { backgroundColor: tone?.strong },
                                index === progress - 1 && styles.pathProgressDotCurrent,
                            ]}
                        />
                    ))}
                    <Text style={styles.pathProgressText}>{progress}/5</Text>
                </View>
            </View>
            <ChevronRight size={18} color={colours.textMuted} />
        </Pressable>
    );
}

function BadgeDetailOverlay({
    selection,
    metricValue,
    compact,
    reduceMotion,
    onClose,
}: {
    selection: BadgePath;
    metricValue: number;
    compact: boolean;
    reduceMotion: boolean;
    onClose: () => void;
}) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const currentUnlock = selection.unlocks[selection.unlocks.length - 1] ?? null;
    const [inspectedTier, setInspectedTier] = useState<BadgeTier | null>(selection.highestTier);
    const inspectedUnlock = inspectedTier ? selection.unlocks.find((unlock) => unlock.tier === inspectedTier) ?? null : null;
    const inspectedTierDefinition = inspectedTier ? getBadgeTierDefinition(selection.definition.id, inspectedTier) : null;
    const isHistoricalTier = Boolean(inspectedUnlock && inspectedTier !== selection.highestTier);
    const tone = inspectedTier ? getTierTone(inspectedTier, colours) : null;
    const tierDefinition = selection.highestTier ? getBadgeTierDefinition(selection.definition.id, selection.highestTier) : null;
    const tierNumber = inspectedTier ? BADGE_TIER_ORDER[inspectedTier] + 1 : 0;
    const nextTier = selection.highestTier
        ? getNextBadgeTierDefinition(selection.definition.id, selection.highestTier)
        : selection.definition.tiers[0];
    const displayedUnlock = isHistoricalTier ? inspectedUnlock : currentUnlock;
    const unlockedDate = displayedUnlock ? new Date(displayedUnlock.unlockedAt) : null;
    const dateLabel = !unlockedDate || Number.isNaN(unlockedDate.getTime())
        ? "Earned"
        : unlockedDate.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
    const requirementTier = isHistoricalTier ? inspectedTierDefinition : nextTier ?? tierDefinition;
    const safeMetricValue = Math.max(0, metricValue);
    const progressTarget = requirementTier?.threshold ?? 0;
    const progressRatio = progressTarget > 0 ? Math.min(1, safeMetricValue / progressTarget) : 1;
    const progressPercentage = Math.round(progressRatio * 100);
    const remainingValue = Math.max(0, progressTarget - safeMetricValue);

    return (
        <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(160)} style={styles.detailOverlay}>
            <Pressable accessibilityRole="button" accessibilityLabel="Close badge details" onPress={onClose} style={styles.detailScrim} />
            <Animated.View
                entering={reduceMotion ? undefined : FadeIn.duration(150)}
                style={[styles.detailSheet, compact ? styles.detailSheetCompact : styles.detailSheetWide]}
            >
                <AnimatedPressable accessibilityLabel="Close badge details" haptic="none" onPress={onClose} style={styles.detailCloseButton}>
                    <X size={18} color={colours.textMuted} />
                </AnimatedPressable>

                <View style={[styles.detailLayout, !compact && styles.detailLayoutWide]}>
                    <View style={[styles.detailHero, !compact && styles.detailHeroWide]}>
                        {inspectedTier ? (
                            <BadgeArtwork badgeId={selection.definition.id} tier={inspectedTier} size={compact ? 86 : 120} />
                        ) : (
                            <View style={[styles.detailLockedArtwork, !compact && styles.detailLockedArtworkWide]}>
                                <LockKeyhole size={compact ? 30 : 38} color={colours.textMuted} />
                            </View>
                        )}
                        <View style={[styles.detailTierPill, { backgroundColor: tone?.soft ?? colours.primarySubtle }]}>
                            <Text style={[styles.detailTierText, { color: tone?.strong ?? colours.textMuted }]}>
                                {inspectedTier ? `${inspectedTier.toUpperCase()} · TIER ${tierNumber} OF 5` : "LOCKED · 0 OF 5 TIERS"}
                            </Text>
                        </View>
                        <Text style={styles.detailName}>{selection.definition.name}</Text>
                        <Text style={styles.detailStatus}>
                            {isHistoricalTier
                                ? `Previously earned · Current tier ${formatTierName(selection.highestTier)}`
                                : selection.highestTier ? "Your current tier" : "Bronze is waiting"}
                        </Text>

                        <View style={styles.tierJourney}>
                            {selection.definition.tiers.map((tier) => {
                                const unlock = selection.unlocks.find((item) => item.tier === tier.tier);
                                const isInspected = tier.tier === inspectedTier;
                                const tierTone = getTierTone(tier.tier, colours);
                                const tierContent = (
                                    <>
                                        <View style={[styles.tierJourneyArtwork, isInspected && { borderColor: tierTone.strong }]}>
                                            {unlock ? (
                                                <BadgeArtwork badgeId={selection.definition.id} tier={tier.tier} size={compact ? 36 : 42} />
                                            ) : (
                                                <View style={styles.lockedTierArtwork}><LockKeyhole size={compact ? 14 : 16} color={colours.textMuted} /></View>
                                            )}
                                        </View>
                                        <Text numberOfLines={1} style={[styles.tierJourneyLabel, unlock && { color: tierTone.strong }]}>
                                            {tier.tier.slice(0, 1).toUpperCase() + tier.tier.slice(1)}
                                        </Text>
                                    </>
                                );

                                return unlock ? (
                                    <Pressable
                                        key={tier.tier}
                                        accessibilityRole="button"
                                        accessibilityLabel={`View ${selection.definition.name} ${tier.tier} achievement details`}
                                        accessibilityState={{ selected: isInspected }}
                                        onPress={() => setInspectedTier(tier.tier)}
                                        style={({ pressed }) => [styles.tierJourneyStep, pressed && styles.tierJourneyStepPressed]}
                                    >
                                        {tierContent}
                                    </Pressable>
                                ) : (
                                    <View key={tier.tier} style={styles.tierJourneyStep}>{tierContent}</View>
                                );
                            })}
                        </View>
                    </View>

                    {compact ? <View style={styles.detailDivider} /> : null}

                    <View style={[styles.detailInfo, !compact && styles.detailInfoWide]}>
                        <Text style={styles.detailLabel}>
                            {isHistoricalTier
                                ? `${inspectedTier?.toUpperCase()} ACHIEVEMENT`
                                : nextTier ? `PROGRESS TO ${nextTier.tier.toUpperCase()}` : "DIAMOND COMPLETE"}
                        </Text>
                        <Text style={styles.detailRequirement}>
                            {requirementTier ? selection.definition.requirement(requirementTier.threshold) : selection.definition.shortDescription}
                        </Text>

                        {isHistoricalTier ? (
                            <View style={styles.historicalAchievement}>
                                <View style={styles.historicalAchievementIcon}>
                                    <CheckCircle2 size={18} color={tone?.strong ?? colours.success} />
                                </View>
                                <View style={styles.historicalAchievementCopy}>
                                    <Text style={styles.historicalAchievementTitle}>Milestone completed</Text>
                                    <Text style={styles.historicalAchievementText}>This tier remains permanently in your collection.</Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.badgeProgressBlock}>
                                <View style={styles.badgeProgressHeader}>
                                    <Text style={styles.badgeProgressValue}>
                                        {formatBadgeMetric(selection.definition.id, safeMetricValue)} of {formatBadgeMetric(selection.definition.id, progressTarget)}
                                    </Text>
                                    <Text style={styles.badgeProgressPercentage}>{progressPercentage}%</Text>
                                </View>
                                <AnimatedProgressBar progress={progressRatio} height={8} />
                                <View style={styles.badgeProgressFooter}>
                                    <Text style={styles.badgeProgressRemaining}>
                                        {nextTier ? `${formatBadgeMetric(selection.definition.id, remainingValue)} remaining` : "Highest tier reached"}
                                    </Text>
                                    {nextTier ? <Text style={styles.badgeProgressReward}>+{nextTier.xp} XP at unlock</Text> : null}
                                </View>
                            </View>
                        )}

                        {displayedUnlock ? (
                            <View style={styles.detailMetaRow}>
                                <View style={styles.detailMetaItem}>
                                    <Text style={styles.detailMetaLabel}>REWARD</Text>
                                    <Text style={styles.detailMetaValue}>+{displayedUnlock.xpAwarded} XP</Text>
                                </View>
                                <View style={styles.detailMetaDivider} />
                                <View style={styles.detailMetaItem}>
                                    <Text style={styles.detailMetaLabel}>UNLOCKED</Text>
                                    <Text style={styles.detailMetaValue}>{dateLabel}</Text>
                                </View>
                            </View>
                        ) : null}

                        {!isHistoricalTier && !nextTier ? (
                            <View style={styles.completedPath}>
                                <Sparkles size={15} color={colours.primaryStrong} />
                                <Text style={styles.completedPathText}>Diamond complete · Every tier earned</Text>
                            </View>
                        ) : null}

                        <AnimatedPressable accessibilityRole="button" haptic="none" onPress={onClose} style={styles.detailDoneButton}>
                            <Text style={styles.detailDoneText}>Back to collection</Text>
                        </AnimatedPressable>
                    </View>
                </View>
            </Animated.View>
        </Animated.View>
    );
}

function formatBadgeMetric(badgeId: BadgeDefinition["id"], value: number) {
    if (badgeId === "master_of_time") {
        const totalMinutes = Math.max(0, Math.round(value * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours === 0) return `${minutes}m`;
        if (minutes === 0) return `${hours.toLocaleString()}h`;
        return `${hours.toLocaleString()}h ${minutes}m`;
    }

    const roundedValue = Math.max(0, Math.floor(value));
    const unit = badgeId === "streak_champion"
        ? roundedValue === 1 ? "day" : "days"
        : badgeId === "task_master"
            ? roundedValue === 1 ? "Task" : "Tasks"
            : roundedValue === 1 ? "session" : "sessions";

    return `${roundedValue.toLocaleString()} ${unit}`;
}

function formatTierName(tier: BadgeTier | null) {
    if (!tier) return "Locked";
    return tier.slice(0, 1).toUpperCase() + tier.slice(1);
}

function getBadgePaths(unlocks: BadgeUnlock[]): BadgePath[] {
    return BADGE_DEFINITIONS.map((definition) => {
        const pathUnlocks = unlocks
            .filter((unlock) => unlock.badgeId === definition.id)
            .sort((first, second) => BADGE_TIER_ORDER[first.tier] - BADGE_TIER_ORDER[second.tier]);

        return {
            definition,
            unlocks: pathUnlocks,
            highestTier: pathUnlocks[pathUnlocks.length - 1]?.tier ?? null,
        };
    });
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        launcher: { minHeight: 112, position: "relative", overflow: "hidden", padding: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.md, borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.lg, backgroundColor: colours.surface },
        launcherHovered: { borderColor: colours.primary, backgroundColor: colours.primarySubtle },
        launcherAccent: { position: "absolute", top: 0, bottom: 0, left: 0, width: 4, backgroundColor: colours.primaryMuted },
        launcherIconStage: { minWidth: 62, flexDirection: "row", alignItems: "center", paddingLeft: spacing.xs },
        previewBadge: { borderRadius: radius.pill, backgroundColor: colours.surface },
        lockedPreview: { width: 54, height: 54, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.primarySubtle },
        launcherCopy: { minWidth: 0, flex: 1 },
        launcherEyebrowRow: { flexDirection: "row", alignItems: "center", gap: 6 },
        launcherEyebrow: { fontSize: 9, fontWeight: "900", letterSpacing: 0.9, color: colours.primaryStrong },
        launcherTitle: { marginTop: 5, fontSize: 18, lineHeight: 23, fontWeight: "800", color: colours.text },
        launcherDescription: { marginTop: 3, fontSize: 11, lineHeight: 17, color: colours.textMuted },
        openAction: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 10, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colours.primarySoft },
        openActionCompact: { paddingHorizontal: 8 },
        openActionHovered: { backgroundColor: colours.primaryBorder },
        openActionText: { fontSize: 10, fontWeight: "800", color: colours.primaryStrong },
        modalBackdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, backgroundColor: "rgba(4, 6, 14, 0.68)" },
        modalBackdropCompact: { padding: spacing.sm },
        modalBackdropDismiss: { ...StyleSheet.absoluteFillObject },
        modalShell: { width: "100%", maxWidth: 1040, overflow: "hidden", borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.xl, backgroundColor: colours.surface, shadowColor: "#000", shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.28, shadowRadius: 38, elevation: 20 },
        modalShellCompact: { borderRadius: radius.lg },
        modalContent: { minHeight: 0, flexShrink: 1, position: "relative" },
        modalHeader: { padding: spacing.lg, flexDirection: "row", alignItems: "center", gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colours.border, backgroundColor: colours.primarySubtle },
        modalHeaderCompact: { padding: spacing.md, gap: spacing.sm },
        modalHeadingIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: radius.md, backgroundColor: colours.primarySoft },
        modalHeadingCopy: { minWidth: 0, flex: 1 },
        modalEyebrow: { fontSize: 9, fontWeight: "900", letterSpacing: 1, color: colours.primaryStrong },
        modalTitle: { marginTop: 2, fontSize: 23, lineHeight: 29, fontWeight: "900", color: colours.text },
        modalTitleCompact: { marginTop: 0, fontSize: 19, lineHeight: 24 },
        modalSubtitle: { marginTop: 3, maxWidth: 590, fontSize: 11, lineHeight: 17, color: colours.textMuted },
        modalCount: { alignItems: "center", paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.md, backgroundColor: colours.surface },
        modalCountCompact: { paddingHorizontal: 9, paddingVertical: 5 },
        modalCountValue: { fontSize: 18, fontWeight: "900", color: colours.primaryStrong },
        modalCountLabel: { fontSize: 7, fontWeight: "900", letterSpacing: 0.8, color: colours.textMuted },
        closeButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colours.border, borderRadius: radius.pill, backgroundColor: colours.surface },
        collectionScroll: { flexShrink: 1 },
        collectionContent: { padding: spacing.lg, gap: spacing.md },
        collectionContentCompact: { padding: spacing.md, gap: spacing.sm },
        collectionGuide: { fontSize: 11, lineHeight: 17, color: colours.textMuted },
        pathGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
        pathGridCompact: { flexDirection: "row", flexWrap: "wrap" },
        pathCard: { minWidth: 0, flexDirection: "row", alignItems: "center", gap: spacing.md, borderWidth: 1, borderColor: colours.border, borderRadius: radius.md, backgroundColor: colours.background },
        pathCardCompact: { width: "100%", minHeight: 76, paddingHorizontal: spacing.sm, paddingVertical: 7 },
        pathCardWide: { width: "32.4%", minHeight: 96, flexGrow: 1, padding: spacing.md },
        pathCardHovered: { borderColor: colours.primary, backgroundColor: colours.primarySubtle },
        lockedPathArtwork: { width: 66, height: 66, alignItems: "center", justifyContent: "center", borderWidth: 1, borderStyle: "dashed", borderColor: colours.border, borderRadius: radius.pill, backgroundColor: colours.surface },
        lockedPathArtworkCompact: { width: 56, height: 56 },
        pathCardCopy: { minWidth: 0, flex: 1, alignItems: "flex-start" },
        pathName: { maxWidth: "100%", fontSize: 13, lineHeight: 17, fontWeight: "900", color: colours.text },
        pathProgressRow: { marginTop: 6, flexDirection: "row", alignItems: "center", gap: 4 },
        pathProgressDot: { width: 6, height: 6, borderRadius: radius.pill, backgroundColor: colours.border },
        pathProgressDotCurrent: { width: 8, height: 8, borderWidth: 2, borderColor: colours.surface },
        pathProgressText: { marginLeft: 2, fontSize: 8, fontWeight: "800", color: colours.textMuted },
        tierPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill },
        tierText: { fontSize: 8, fontWeight: "900", letterSpacing: 0.7 },
        completedPath: { width: "100%", marginTop: spacing.md, padding: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, borderRadius: radius.md, backgroundColor: colours.primarySoft },
        completedPathText: { fontSize: 11, fontWeight: "800", color: colours.primaryStrong },
        detailOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 20, alignItems: "center", justifyContent: "center", padding: spacing.lg },
        detailScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(4, 6, 14, 0.64)" },
        detailSheet: { width: "100%", maxWidth: 820, position: "relative", alignItems: "center", padding: spacing.lg, borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.xl, backgroundColor: colours.surface, shadowColor: "#000", shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.26, shadowRadius: 28, elevation: 24 },
        detailSheetCompact: { maxWidth: 460, paddingHorizontal: spacing.md, paddingVertical: spacing.lg, borderRadius: radius.lg },
        detailSheetWide: { alignItems: "stretch", padding: spacing.xl },
        detailCloseButton: { position: "absolute", top: 12, right: 12, zIndex: 2, width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.primarySubtle },
        detailLayout: { width: "100%", alignItems: "center" },
        detailLayoutWide: { flexDirection: "row", alignItems: "stretch", gap: spacing.xl },
        detailHero: { width: "100%", alignItems: "center" },
        detailHeroWide: { width: "43%", paddingHorizontal: spacing.sm, justifyContent: "center" },
        detailInfo: { width: "100%" },
        detailInfoWide: { minWidth: 0, flex: 1, width: "auto", paddingLeft: spacing.xl, justifyContent: "center", borderLeftWidth: 1, borderLeftColor: colours.border },
        detailLockedArtwork: { width: 86, height: 86, alignItems: "center", justifyContent: "center", borderWidth: 1, borderStyle: "dashed", borderColor: colours.border, borderRadius: radius.pill, backgroundColor: colours.background },
        detailLockedArtworkWide: { width: 120, height: 120 },
        detailTierPill: { marginTop: spacing.sm, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
        detailTierText: { fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
        detailName: { marginTop: 6, fontSize: 22, lineHeight: 27, fontWeight: "900", textAlign: "center", color: colours.text },
        detailStatus: { marginTop: 3, fontSize: 10, fontWeight: "700", textTransform: "capitalize", color: colours.textMuted },
        tierJourney: { width: "100%", marginTop: spacing.md, paddingVertical: spacing.sm, flexDirection: "row", alignItems: "flex-start", borderRadius: radius.md, backgroundColor: colours.background },
        tierJourneyStep: { minWidth: 0, flex: 1, alignItems: "center", gap: 4 },
        tierJourneyStepPressed: { opacity: 0.68 },
        tierJourneyArtwork: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "transparent", borderRadius: radius.pill },
        lockedTierArtwork: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colours.border, borderRadius: radius.pill, backgroundColor: colours.surface },
        tierJourneyLabel: { maxWidth: "100%", fontSize: 7, fontWeight: "800", color: colours.textMuted },
        detailDivider: { width: "100%", height: 1, marginVertical: spacing.md, backgroundColor: colours.border },
        detailLabel: { alignSelf: "flex-start", fontSize: 8, fontWeight: "900", letterSpacing: 0.8, color: colours.textMuted },
        detailRequirement: { width: "100%", marginTop: spacing.sm, fontSize: 13, lineHeight: 20, fontWeight: "700", textAlign: "left", color: colours.text },
        badgeProgressBlock: { width: "100%", marginTop: spacing.md, padding: spacing.md, gap: spacing.sm, borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.md, backgroundColor: colours.primarySubtle },
        badgeProgressHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
        badgeProgressValue: { minWidth: 0, flex: 1, fontSize: 11, fontWeight: "800", color: colours.text },
        badgeProgressPercentage: { fontSize: 17, fontWeight: "900", color: colours.primaryStrong },
        badgeProgressFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
        badgeProgressRemaining: { minWidth: 0, flex: 1, fontSize: 9, color: colours.textMuted },
        badgeProgressReward: { fontSize: 9, fontWeight: "900", color: colours.primaryStrong },
        historicalAchievement: { width: "100%", marginTop: spacing.md, padding: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm, borderWidth: 1, borderColor: colours.success, borderRadius: radius.md, backgroundColor: colours.successSoft },
        historicalAchievementIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.surface },
        historicalAchievementCopy: { minWidth: 0, flex: 1 },
        historicalAchievementTitle: { fontSize: 11, fontWeight: "900", color: colours.text },
        historicalAchievementText: { marginTop: 3, fontSize: 9, lineHeight: 14, color: colours.textMuted },
        detailMetaRow: { width: "100%", marginTop: spacing.md, flexDirection: "row", alignItems: "stretch", borderRadius: radius.md, backgroundColor: colours.primarySubtle },
        detailMetaItem: { minWidth: 0, flex: 1, padding: spacing.sm, alignItems: "center" },
        detailMetaDivider: { width: 1, marginVertical: spacing.sm, backgroundColor: colours.primaryBorder },
        detailMetaLabel: { fontSize: 7, fontWeight: "900", letterSpacing: 0.7, color: colours.textMuted },
        detailMetaValue: { marginTop: 4, fontSize: 11, fontWeight: "900", textAlign: "center", color: colours.primaryStrong },
        detailDoneButton: { width: "100%", minHeight: 44, marginTop: spacing.md, alignItems: "center", justifyContent: "center", borderRadius: radius.md, backgroundColor: colours.primary },
        detailDoneText: { fontSize: 13, fontWeight: "800", color: colours.onPrimary },
        modalEmptyState: { minHeight: 320, padding: spacing.xl, alignItems: "center", justifyContent: "center" },
        modalEmptyIcon: { width: 72, height: 72, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.primarySubtle },
        modalEmptyTitle: { marginTop: spacing.md, fontSize: 18, fontWeight: "800", color: colours.text },
        modalEmptyText: { maxWidth: 360, marginTop: spacing.sm, fontSize: 12, lineHeight: 18, textAlign: "center", color: colours.textMuted },
    });
}
