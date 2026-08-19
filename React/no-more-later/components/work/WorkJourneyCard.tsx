import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ChevronRight, MoreVertical } from "lucide-react-native";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { WorkAssetIcon } from "@/components/work/WorkAssetIcon";
import type { WorkAssetId } from "@/types/work";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { AnimatedProgressBar } from "@/components/ui/AnimatedProgressBar";

type WorkJourneyCardProps = {
    title: string;
    assetId: WorkAssetId;
    completedQuestCount: number;
    totalQuestCount: number;
    onPress: () => void;
    onMore: () => void;
};

export function WorkJourneyCard({ title, assetId, completedQuestCount, totalQuestCount, onPress, onMore }: WorkJourneyCardProps) {
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    const progress = totalQuestCount === 0 ? 0 : Math.round((completedQuestCount / totalQuestCount) * 100);

    return (
        <AnimatedPressable style={styles.card} onPress={onPress}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <WorkAssetIcon assetId={assetId} size={22} color={colours.primaryStrong} />
                </View>

                <Text style={styles.title} numberOfLines={2}>
                    {title}
                </Text>

                <Pressable
                    accessibilityLabel={`Manage ${title}`}
                    onPress={(event) => {
                        event.stopPropagation();
                        onMore();
                    }}
                    hitSlop={8}
                    style={styles.moreButton}
                >
                    <MoreVertical size={20} color={colours.textMuted} />
                </Pressable>
            </View>

            <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Progress</Text>

                    <Text style={styles.progressPercentage}>{progress}%</Text>
                </View>

                <AnimatedProgressBar progress={progress / 100} />

                <Text style={styles.progressText}>
                    {completedQuestCount} of {totalQuestCount} Quests completed
                </Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.openText}>View Journey</Text>

                <ChevronRight size={20} color={colours.textMuted} />
            </View>
        </AnimatedPressable>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        card: {
            flexGrow: 1,
            flexBasis: 300,

            minHeight: 178,

            gap: spacing.md,
            padding: spacing.md,

            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.lg,

            backgroundColor: colours.surface,
        },

        header: {
            flexDirection: "row",
            alignItems: "center",

            gap: spacing.md,
        },

        iconContainer: {
            width: 44,
            height: 44,

            alignItems: "center",
            justifyContent: "center",

            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.md,

            backgroundColor: colours.primarySubtle,
        },

        title: {
            flex: 1,

            fontSize: 17,
            fontWeight: "800",

            color: colours.text,
        },

        progressSection: {
            gap: spacing.sm,
        },

        progressHeader: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },

        progressLabel: {
            fontSize: 12,
            fontWeight: "700",

            color: colours.textMuted,
        },

        progressPercentage: {
            fontSize: 13,
            fontWeight: "800",

            color: colours.primaryStrong,
        },

        progressTrack: {
            height: 7,

            overflow: "hidden",

            borderRadius: radius.pill,

            backgroundColor: colours.border,
        },

        progressFill: {
            height: "100%",

            borderRadius: radius.pill,

            backgroundColor: colours.primary,
        },

        progressText: {
            fontSize: 12,

            color: colours.textMuted,
        },

        footer: {
            marginTop: "auto",

            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",

            paddingTop: spacing.sm,

            borderTopWidth: 1,
            borderTopColor: colours.border,
        },

        openText: {
            fontSize: 13,
            fontWeight: "700",

            color: colours.primaryStrong,
        },

        moreButton: {
            width: 36,
            height: 36,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
        },
    });
}
