import { useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { Folder, MoreVertical, Play } from "lucide-react-native";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { WorkAssetIcon } from "@/components/work/WorkAssetIcon";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import type { WorkAssetId } from "@/types/work";

type WorkQuestCardProps = {
    title: string;
    journeyName?: string;
    assetId: WorkAssetId;
    onFocus: () => void;
    onMore: () => void;
};

export function WorkQuestCard({ title, journeyName, assetId, onFocus, onMore }: WorkQuestCardProps) {
    const { width } = useWindowDimensions();
    const { colours } = useAppearance();

    const isCompact = width < 430;

    const styles = useMemo(() => createStyles(colours, isCompact), [colours, isCompact]);

    return (
        <View style={styles.card}>
            <View style={styles.iconContainer}>
                <WorkAssetIcon assetId={assetId} size={22} color={colours.primaryStrong} />
            </View>

            <View style={styles.details}>
                <Text style={styles.title} numberOfLines={2}>
                    {title}
                </Text>

                <View style={styles.metaRow}>
                    <Folder size={14} color={journeyName ? colours.primary : colours.textMuted} />

                    <Text style={[styles.journeyName, !journeyName && styles.unassignedJourney]} numberOfLines={1}>
                        {journeyName ?? "No Journey"}
                    </Text>
                </View>

                {/* <View style={styles.metaRow}>
                    <Clock3 size={14} color={colours.textMuted} />

                    <Text style={styles.metaText}>No time set</Text>
                </View> */}
            </View>

            <AnimatedPressable style={styles.focusButton} haptic="light" onPress={onFocus}>
                <Play size={16} color={colours.primaryStrong} fill={colours.primaryStrong} />

                {!isCompact && <Text style={styles.focusText}>Focus</Text>}
            </AnimatedPressable>

            <AnimatedPressable style={styles.moreButton} onPress={onMore}>
                <MoreVertical size={20} color={colours.textMuted} />
            </AnimatedPressable>
        </View>
    );
}

function createStyles(colours: AppColours, isCompact: boolean) {
    return StyleSheet.create({
        card: {
            minHeight: 86,

            flexDirection: "row",
            alignItems: "center",

            gap: isCompact ? spacing.sm : spacing.md,
            paddingHorizontal: spacing.md,
            paddingVertical: 12,

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,

            backgroundColor: colours.surface,
        },

        iconContainer: {
            width: isCompact ? 42 : 46,
            height: isCompact ? 42 : 46,

            alignItems: "center",
            justifyContent: "center",

            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.md,

            backgroundColor: colours.primarySubtle,
        },

        details: {
            flex: 1,
            minWidth: 0,

            gap: 5,
        },

        title: {
            fontSize: isCompact ? 14 : 16,
            fontWeight: "800",

            color: colours.text,
        },

        metaRow: {
            flexDirection: "row",
            alignItems: "center",

            gap: 6,
        },

        journeyName: {
            flexShrink: 1,

            fontSize: 13,
            fontWeight: "600",

            color: colours.primaryStrong,
        },

        unassignedJourney: {
            color: colours.textMuted,
        },

        metaText: {
            fontSize: 12,

            color: colours.textMuted,
        },

        focusButton: {
            minHeight: 42,

            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",

            gap: 7,

            paddingHorizontal: isCompact ? spacing.sm : spacing.md,

            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.md,

            backgroundColor: colours.primarySubtle,
        },

        focusText: {
            fontSize: 13,
            fontWeight: "800",

            color: colours.primaryStrong,
        },

        moreButton: {
            width: 32,
            height: 42,

            alignItems: "center",
            justifyContent: "center",
        },

    });
}
