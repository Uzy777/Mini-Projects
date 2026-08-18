import { useMemo } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { Clock3, Folder, Laptop, MoreVertical, Play } from "lucide-react-native";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { WorkAssetIcon } from "@/components/work/WorkAssetIcon";
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
            <View style={styles.statusDot} />

            <View style={styles.iconContainer}>
                <WorkAssetIcon assetId={assetId} size={24} color={colours.primary} />
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

                <View style={styles.metaRow}>
                    <Clock3 size={14} color={colours.textMuted} />

                    <Text style={styles.metaText}>No time set</Text>
                </View>
            </View>

            <Pressable style={({ pressed }) => [styles.focusButton, pressed && styles.pressed]} onPress={onFocus}>
                <Play size={16} color={colours.primary} fill={colours.primary} />

                {!isCompact && <Text style={styles.focusText}>Focus</Text>}
            </Pressable>

            <Pressable style={({ pressed }) => [styles.moreButton, pressed && styles.pressed]} onPress={onMore}>
                <MoreVertical size={20} color={colours.textMuted} />
            </Pressable>
        </View>
    );
}

function createStyles(colours: AppColours, isCompact: boolean) {
    return StyleSheet.create({
        card: {
            minHeight: 112,

            flexDirection: "row",
            alignItems: "center",

            gap: isCompact ? spacing.sm : spacing.md,
            padding: spacing.md,

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,

            backgroundColor: colours.surface,
        },

        statusDot: {
            width: 8,
            height: 8,

            borderRadius: radius.pill,

            backgroundColor: colours.primary,
        },

        iconContainer: {
            width: isCompact ? 46 : 54,
            height: isCompact ? 46 : 54,

            alignItems: "center",
            justifyContent: "center",

            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.pill,

            backgroundColor: colours.primarySoft,
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

            color: colours.primary,
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

            backgroundColor: colours.primarySoft,
        },

        focusText: {
            fontSize: 13,
            fontWeight: "800",

            color: colours.primary,
        },

        moreButton: {
            width: 32,
            height: 42,

            alignItems: "center",
            justifyContent: "center",
        },

        pressed: {
            opacity: 0.65,
        },
    });
}
