import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ChevronRight } from "lucide-react-native";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { WorkAssetIcon } from "@/components/work/WorkAssetIcon";
import type { WorkAssetId } from "@/types/work";

type WorkJourneyCardProps = {
    title: string;
    assetId: WorkAssetId;
    completedQuestCount: number;
    totalQuestCount: number;
    onPress: () => void;
};

export function WorkJourneyCard({ title, assetId, completedQuestCount, totalQuestCount, onPress }: WorkJourneyCardProps) {
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    const progress = totalQuestCount === 0 ? 0 : Math.round((completedQuestCount / totalQuestCount) * 100);

    return (
        <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <WorkAssetIcon assetId={assetId} size={24} color={colours.primary} />
                </View>

                <Text style={styles.title} numberOfLines={2}>
                    {title}
                </Text>
            </View>

            <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Progress</Text>

                    <Text style={styles.progressPercentage}>{progress}%</Text>
                </View>

                <View style={styles.progressTrack}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${progress}%`,
                            },
                        ]}
                    />
                </View>

                <Text style={styles.progressText}>
                    {completedQuestCount} of {totalQuestCount} Quests completed
                </Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.openText}>Open Journey</Text>

                <ChevronRight size={20} color={colours.textMuted} />
            </View>
        </Pressable>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        card: {
            flexGrow: 1,
            flexBasis: 280,

            minHeight: 210,

            gap: spacing.lg,
            padding: spacing.lg,

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,

            backgroundColor: colours.surface,
        },

        header: {
            flexDirection: "row",
            alignItems: "center",

            gap: spacing.md,
        },

        iconContainer: {
            width: 50,
            height: 50,

            alignItems: "center",
            justifyContent: "center",

            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.pill,

            backgroundColor: colours.primarySoft,
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

            color: colours.primary,
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

            color: colours.text,
        },

        pressed: {
            opacity: 0.7,
        },
    });
}
