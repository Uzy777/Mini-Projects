import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Award, ChevronRight, LockKeyhole, Sparkles, X } from "lucide-react-native";
import Animated, { FadeIn, FadeInUp, useReducedMotion } from "react-native-reanimated";

import { BadgeArtwork, getTierTone } from "@/components/badges/BadgeArtwork";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import {
    BADGE_DEFINITIONS,
    BADGE_TIER_ORDER,
    getBadgeTierDefinition,
    getNextBadgeTierDefinition,
} from "@/constants/badges";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { BadgeDefinition } from "@/constants/badges";
import type { BadgeId, BadgeTier, BadgeUnlock } from "@/types/badges";

type BadgeGalleryProps = {
    unlocks: BadgeUnlock[];
};

type UnlockedBadge = {
    definition: BadgeDefinition;
    tier: BadgeTier;
    unlockedTiers: Set<BadgeTier>;
    totalEarnedXp: number;
};

export function BadgeGallery({ unlocks }: BadgeGalleryProps) {
    const { colours } = useAppearance();
    const { width } = useWindowDimensions();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const unlockedBadges = useMemo(() => getUnlockedBadges(unlocks), [unlocks]);
    const isCompactLauncher = width < 520;
    const [isCollectionVisible, setIsCollectionVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [selectedBadgeId, setSelectedBadgeId] = useState<BadgeId | null>(null);

    function openCollection() {
        setSelectedBadgeId((current) => current ?? unlockedBadges[0]?.definition.id ?? null);
        setIsCollectionVisible(true);
    }

    return (
        <>
            <AnimatedPressable
                accessibilityRole="button"
                accessibilityLabel={`Open badge collection. ${unlockedBadges.length} ${unlockedBadges.length === 1 ? "badge" : "badges"} unlocked.`}
                haptic="selection"
                onHoverIn={() => setIsHovered(true)}
                onHoverOut={() => setIsHovered(false)}
                onPress={openCollection}
                style={[styles.launcher, isHovered && styles.launcherHovered]}
            >
                <View style={styles.launcherAccent} />
                <View style={styles.launcherIconStage}>
                    {unlockedBadges.length > 0 ? (
                        unlockedBadges.slice(0, isCompactLauncher ? 1 : 3).map((badge, index) => (
                            <View key={badge.definition.id} style={[styles.previewBadge, { marginLeft: index === 0 ? 0 : -16, zIndex: 3 - index }]}>
                                <BadgeArtwork badgeId={badge.definition.id} tier={badge.tier} size={50} />
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
                        {unlockedBadges.length > 0 ? `${unlockedBadges.length} ${unlockedBadges.length === 1 ? "milestone" : "milestones"} earned` : "Your collection is waiting"}
                    </Text>
                    <Text style={styles.launcherDescription}>
                        {unlockedBadges.length > 0 ? "Open your collection and explore each achievement." : "Badges remain hidden until you unlock them."}
                    </Text>
                </View>

                <View style={[styles.openAction, isCompactLauncher && styles.openActionCompact, isHovered && styles.openActionHovered]}>
                    {!isCompactLauncher ? <Text style={styles.openActionText}>View</Text> : null}
                    <ChevronRight size={17} color={colours.primaryStrong} />
                </View>
            </AnimatedPressable>

            <BadgeCollectionModal
                visible={isCollectionVisible}
                badges={unlockedBadges}
                selectedBadgeId={selectedBadgeId}
                onSelectBadge={setSelectedBadgeId}
                onClose={() => setIsCollectionVisible(false)}
            />
        </>
    );
}

function BadgeCollectionModal({
    visible,
    badges,
    selectedBadgeId,
    onSelectBadge,
    onClose,
}: {
    visible: boolean;
    badges: UnlockedBadge[];
    selectedBadgeId: BadgeId | null;
    onSelectBadge: (badgeId: BadgeId) => void;
    onClose: () => void;
}) {
    const { colours } = useAppearance();
    const { width, height } = useWindowDimensions();
    const reduceMotion = useReducedMotion();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const isWide = width >= 820;
    const selectedBadge = badges.find((badge) => badge.definition.id === selectedBadgeId) ?? badges[0] ?? null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType={reduceMotion ? "none" : "fade"}
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <Pressable accessibilityRole="button" accessibilityLabel="Close badge collection" onPress={onClose} style={styles.modalBackdrop}>
                <Animated.View
                    entering={reduceMotion ? undefined : FadeInUp.duration(280)}
                    style={[styles.modalShell, { maxHeight: Math.max(320, height - (isWide ? 72 : 24)) }, !isWide && styles.modalShellCompact]}
                >
                    <Pressable onPress={(event) => event.stopPropagation()} style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalHeadingIcon}><Sparkles size={18} color={colours.primaryStrong} /></View>
                            <View style={styles.modalHeadingCopy}>
                                <Text style={styles.modalEyebrow}>YOUR ACHIEVEMENTS</Text>
                                <Text style={styles.modalTitle}>Badge collection</Text>
                                <Text style={styles.modalSubtitle}>Hover over a badge or select it to see what you earned and what comes next.</Text>
                            </View>
                            <View style={styles.modalCount}>
                                <Text style={styles.modalCountValue}>{badges.length}</Text>
                                <Text style={styles.modalCountLabel}>UNLOCKED</Text>
                            </View>
                            <AnimatedPressable accessibilityLabel="Close badge collection" haptic="none" onPress={onClose} style={styles.closeButton}>
                                <X size={19} color={colours.textMuted} />
                            </AnimatedPressable>
                        </View>

                        {badges.length === 0 ? (
                            <View style={styles.modalEmptyState}>
                                <View style={styles.modalEmptyIcon}><LockKeyhole size={28} color={colours.textMuted} /></View>
                                <Text style={styles.modalEmptyTitle}>No badges unlocked yet</Text>
                                <Text style={styles.modalEmptyText}>Complete qualifying Focus Sessions and your achievements will appear here.</Text>
                            </View>
                        ) : (
                            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
                                <View style={[styles.collectionBody, isWide && styles.collectionBodyWide]}>
                                    <View style={styles.badgeListColumn}>
                                        <Text style={styles.collectionLabel}>COLLECTION</Text>
                                        {isWide ? (
                                            <View style={styles.badgeGrid}>
                                                {badges.map((badge, index) => (
                                                    <BadgeTile
                                                        key={badge.definition.id}
                                                        badge={badge}
                                                        selected={badge.definition.id === selectedBadge?.definition.id}
                                                        index={index}
                                                        reduceMotion={reduceMotion}
                                                        onSelect={() => onSelectBadge(badge.definition.id)}
                                                    />
                                                ))}
                                            </View>
                                        ) : (
                                            <ScrollView
                                                horizontal
                                                showsHorizontalScrollIndicator={false}
                                                contentContainerStyle={styles.badgeRail}
                                            >
                                                {badges.map((badge, index) => (
                                                    <BadgeTile
                                                        key={badge.definition.id}
                                                        badge={badge}
                                                        selected={badge.definition.id === selectedBadge?.definition.id}
                                                        index={index}
                                                        reduceMotion={reduceMotion}
                                                        compact
                                                        onSelect={() => onSelectBadge(badge.definition.id)}
                                                    />
                                                ))}
                                            </ScrollView>
                                        )}
                                    </View>

                                    {selectedBadge ? (
                                        <Animated.View
                                            key={`${selectedBadge.definition.id}-${selectedBadge.tier}`}
                                            entering={reduceMotion ? undefined : FadeIn.duration(200)}
                                            style={[styles.detailPanel, isWide && styles.detailPanelWide]}
                                        >
                                            <BadgeDetail badge={selectedBadge} />
                                        </Animated.View>
                                    ) : null}
                                </View>
                            </ScrollView>
                        )}
                    </Pressable>
                </Animated.View>
            </Pressable>
        </Modal>
    );
}

function BadgeTile({
    badge,
    selected,
    index,
    reduceMotion,
    compact = false,
    onSelect,
}: {
    badge: UnlockedBadge;
    selected: boolean;
    index: number;
    reduceMotion: boolean;
    compact?: boolean;
    onSelect: () => void;
}) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const tone = getTierTone(badge.tier, colours);

    return (
        <Animated.View entering={reduceMotion ? undefined : FadeInUp.delay(Math.min(index * 45, 240)).duration(260)}>
            <AnimatedPressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${badge.definition.name}, ${badge.tier} tier`}
                haptic="selection"
                onHoverIn={onSelect}
                onPress={onSelect}
                style={[styles.badgeTile, compact && styles.badgeTileCompact, selected && styles.badgeTileSelected]}
            >
                <BadgeArtwork badgeId={badge.definition.id} tier={badge.tier} size={compact ? 72 : 82} />
                <View style={styles.badgeTileCopy}>
                    <Text numberOfLines={2} style={styles.badgeTileName}>{badge.definition.name}</Text>
                    <View style={[styles.badgeTierPill, { backgroundColor: tone.soft }]}>
                        <Text style={[styles.badgeTierText, { color: tone.strong }]}>{badge.tier.toUpperCase()}</Text>
                    </View>
                </View>
            </AnimatedPressable>
        </Animated.View>
    );
}

function BadgeDetail({ badge }: { badge: UnlockedBadge }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const tone = getTierTone(badge.tier, colours);
    const currentTier = getBadgeTierDefinition(badge.definition.id, badge.tier);
    const nextTier = getNextBadgeTierDefinition(badge.definition.id, badge.tier);
    const currentTierIndex = BADGE_TIER_ORDER[badge.tier];

    return (
        <View style={styles.detailContent}>
            <View style={styles.detailHero}>
                <BadgeArtwork badgeId={badge.definition.id} tier={badge.tier} size={118} />
                <View style={styles.detailHeading}>
                    <View style={[styles.detailTierPill, { backgroundColor: tone.soft }]}>
                        <Text style={[styles.detailTierText, { color: tone.strong }]}>{badge.tier.toUpperCase()} TIER</Text>
                    </View>
                    <Text style={styles.detailName}>{badge.definition.name}</Text>
                    <Text style={styles.detailDescription}>{badge.definition.shortDescription}</Text>
                </View>
            </View>

            <View style={styles.tierProgressBlock}>
                <View style={styles.tierProgressHeader}>
                    <Text style={styles.detailLabel}>TIER PROGRESS</Text>
                    <Text style={styles.tierProgressValue}>{currentTierIndex + 1} / 5</Text>
                </View>
                <View style={styles.tierTrack} accessibilityLabel={`${currentTierIndex + 1} of 5 tiers reached`}>
                    {BADGE_DEFINITIONS[0].tiers.map((tier) => (
                        <View
                            key={tier.tier}
                            style={[
                                styles.tierNode,
                                badge.unlockedTiers.has(tier.tier) && { borderColor: tone.strong, backgroundColor: tone.strong },
                            ]}
                        />
                    ))}
                </View>
                <View style={styles.tierNames}>
                    <Text style={styles.tierName}>Bronze</Text>
                    <Text style={styles.tierName}>Diamond</Text>
                </View>
            </View>

            <View style={styles.earnedBlock}>
                <Text style={styles.detailLabel}>HOW YOU EARNED IT</Text>
                <Text style={styles.earnedRequirement}>
                    {currentTier ? badge.definition.requirement(currentTier.threshold) : badge.definition.shortDescription}
                </Text>
                <View style={styles.xpSummaryRow}>
                    <Text style={styles.xpSummaryLabel}>Badge XP earned</Text>
                    <Text style={styles.xpSummaryValue}>+{badge.totalEarnedXp.toLocaleString()} XP</Text>
                </View>
            </View>

            <View style={[styles.nextBlock, !nextTier && styles.completeBlock]}>
                <Text style={styles.detailLabel}>{nextTier ? "NEXT MILESTONE" : "BADGE COMPLETE"}</Text>
                <Text style={styles.nextRequirement}>
                    {nextTier ? badge.definition.requirement(nextTier.threshold) : "You reached the Diamond tier—the highest form of this badge."}
                </Text>
                {nextTier ? <Text style={styles.nextReward}>+{nextTier.xp} XP when unlocked</Text> : <Sparkles size={18} color={colours.primaryStrong} />}
            </View>
        </View>
    );
}

function getUnlockedBadges(unlocks: BadgeUnlock[]): UnlockedBadge[] {
    const grouped = new Map<BadgeId, BadgeUnlock[]>();

    unlocks.forEach((unlock) => {
        grouped.set(unlock.badgeId, [...(grouped.get(unlock.badgeId) ?? []), unlock]);
    });

    return BADGE_DEFINITIONS.flatMap((definition) => {
        const badgeUnlocks = grouped.get(definition.id);
        if (!badgeUnlocks?.length) return [];

        const highest = badgeUnlocks.reduce((current, candidate) =>
            BADGE_TIER_ORDER[candidate.tier] > BADGE_TIER_ORDER[current.tier] ? candidate : current,
        );

        return [{
            definition,
            tier: highest.tier,
            unlockedTiers: new Set(badgeUnlocks.map((unlock) => unlock.tier)),
            totalEarnedXp: badgeUnlocks.reduce((total, unlock) => total + unlock.xpAwarded, 0),
        }];
    });
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        launcher: {
            minHeight: 112,
            position: "relative",
            overflow: "hidden",
            padding: spacing.md,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },
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
        modalShell: { width: "100%", maxWidth: 1060, overflow: "hidden", borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.xl, backgroundColor: colours.surface, shadowColor: "#000", shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.28, shadowRadius: 38, elevation: 20 },
        modalShellCompact: { borderRadius: radius.lg },
        modalContent: { minHeight: 0, flexShrink: 1 },
        modalHeader: { padding: spacing.lg, flexDirection: "row", alignItems: "center", gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colours.border, backgroundColor: colours.primarySubtle },
        modalHeadingIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: radius.md, backgroundColor: colours.primarySoft },
        modalHeadingCopy: { minWidth: 0, flex: 1 },
        modalEyebrow: { fontSize: 9, fontWeight: "900", letterSpacing: 1, color: colours.primaryStrong },
        modalTitle: { marginTop: 2, fontSize: 23, lineHeight: 29, fontWeight: "900", color: colours.text },
        modalSubtitle: { marginTop: 3, maxWidth: 590, fontSize: 11, lineHeight: 17, color: colours.textMuted },
        modalCount: { alignItems: "center", paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.md, backgroundColor: colours.surface },
        modalCountValue: { fontSize: 18, fontWeight: "900", color: colours.primaryStrong },
        modalCountLabel: { fontSize: 7, fontWeight: "900", letterSpacing: 0.8, color: colours.textMuted },
        closeButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colours.border, borderRadius: radius.pill, backgroundColor: colours.surface },
        modalScroll: { flexShrink: 1 },
        modalScrollContent: { padding: spacing.lg },
        collectionBody: { gap: spacing.lg },
        collectionBodyWide: { flexDirection: "row", alignItems: "flex-start" },
        badgeListColumn: { minWidth: 0, flex: 1, gap: spacing.md },
        collectionLabel: { fontSize: 9, fontWeight: "900", letterSpacing: 0.9, color: colours.textMuted },
        badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
        badgeRail: { gap: spacing.sm, paddingRight: spacing.md },
        badgeTile: { width: 190, minHeight: 182, padding: spacing.md, alignItems: "center", justifyContent: "center", gap: spacing.md, borderWidth: 1, borderColor: colours.border, borderRadius: radius.lg, backgroundColor: colours.background },
        badgeTileCompact: { width: 132, minHeight: 168, paddingHorizontal: spacing.sm },
        badgeTileSelected: { borderColor: colours.primary, backgroundColor: colours.primarySubtle },
        badgeTileCopy: { width: "100%", alignItems: "center", gap: spacing.sm },
        badgeTileName: { minHeight: 34, fontSize: 14, lineHeight: 17, fontWeight: "800", textAlign: "center", color: colours.text },
        badgeTierPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill },
        badgeTierText: { fontSize: 8, fontWeight: "900", letterSpacing: 0.7 },
        detailPanel: { borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.lg, backgroundColor: colours.primarySubtle },
        detailPanelWide: { width: 350 },
        detailContent: { padding: spacing.lg, gap: spacing.lg },
        detailHero: { alignItems: "center", gap: spacing.md },
        detailHeading: { alignItems: "center" },
        detailTierPill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: radius.pill },
        detailTierText: { fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
        detailName: { marginTop: spacing.sm, fontSize: 22, lineHeight: 27, fontWeight: "900", textAlign: "center", color: colours.text },
        detailDescription: { marginTop: 4, fontSize: 11, lineHeight: 17, textAlign: "center", color: colours.textMuted },
        tierProgressBlock: { gap: spacing.sm },
        tierProgressHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
        detailLabel: { fontSize: 8, fontWeight: "900", letterSpacing: 0.8, color: colours.textMuted },
        tierProgressValue: { fontSize: 10, fontWeight: "800", color: colours.primaryStrong },
        tierTrack: { flexDirection: "row", gap: 6 },
        tierNode: { flex: 1, height: 6, borderWidth: 1, borderColor: colours.border, borderRadius: radius.pill, backgroundColor: colours.surface },
        tierNames: { flexDirection: "row", justifyContent: "space-between" },
        tierName: { fontSize: 8, color: colours.textMuted },
        earnedBlock: { padding: spacing.md, gap: spacing.sm, borderWidth: 1, borderColor: colours.border, borderRadius: radius.md, backgroundColor: colours.surface },
        earnedRequirement: { fontSize: 12, lineHeight: 18, fontWeight: "700", color: colours.text },
        xpSummaryRow: { paddingTop: spacing.sm, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm, borderTopWidth: 1, borderTopColor: colours.border },
        xpSummaryLabel: { fontSize: 10, color: colours.textMuted },
        xpSummaryValue: { fontSize: 12, fontWeight: "900", color: colours.primaryStrong },
        nextBlock: { padding: spacing.md, gap: spacing.sm, borderRadius: radius.md, backgroundColor: colours.primarySoft },
        completeBlock: { alignItems: "center" },
        nextRequirement: { fontSize: 11, lineHeight: 17, fontWeight: "700", color: colours.text },
        nextReward: { fontSize: 10, fontWeight: "800", color: colours.primaryStrong },
        modalEmptyState: { minHeight: 320, padding: spacing.xl, alignItems: "center", justifyContent: "center" },
        modalEmptyIcon: { width: 72, height: 72, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.primarySubtle },
        modalEmptyTitle: { marginTop: spacing.md, fontSize: 18, fontWeight: "800", color: colours.text },
        modalEmptyText: { maxWidth: 360, marginTop: spacing.sm, fontSize: 12, lineHeight: 18, textAlign: "center", color: colours.textMuted },
    });
}
