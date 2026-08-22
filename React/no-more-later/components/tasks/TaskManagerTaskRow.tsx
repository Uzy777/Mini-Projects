import { useMemo, type ReactNode } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { MoreHorizontal, Play } from "lucide-react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { QuestFocusProgressSummary } from "@/components/focus/QuestFocusProgressSummary";
import { WorkAssetIcon } from "@/components/work/WorkAssetIcon";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import type { WorkQuest } from "@/types/work";

type Props = {
    task: WorkQuest;
    projectName?: string;
    onFocus: () => void;
    onMore: () => void;
    dragHandle?: ReactNode;
    isDragging?: boolean;
};

export function TaskManagerTaskRow({ task, projectName, onFocus, onMore, dragHandle, isDragging = false }: Props) {
    const { colours } = useAppearance();
    const { width } = useWindowDimensions();
    const compact = width < 520;
    const styles = useMemo(() => createStyles(colours, compact), [colours, compact]);
    const completed = task.status === "completed";
    const path = projectName ?? "Standalone Task";

    return (
        <Animated.View layout={LinearTransition.duration(150)} style={[styles.row, styles.mobileRow, !task.focusSummary && styles.mobileRowWithoutProgress, isDragging && styles.draggingRow]}>
            <View style={styles.mobileMainRow}>
                {dragHandle}
                <View style={styles.icon}><WorkAssetIcon assetId={task.assetId} size={19} color={completed ? colours.textMuted : colours.primaryStrong} /></View>
                <View style={styles.copy}>
                    <Text numberOfLines={2} style={[styles.title, completed && styles.completedTitle]}>{task.title}</Text>
                    <Text numberOfLines={1} style={styles.path}>{path}</Text>
                </View>
                {!completed ? (
                    <AnimatedPressable accessibilityLabel={`Focus on ${task.title}`} onPress={onFocus} style={styles.focusButton} haptic="light">
                        <Play size={14} color={colours.primaryStrong} fill={colours.primaryStrong} />
                        {!compact ? <Text style={styles.focusText}>Focus</Text> : null}
                    </AnimatedPressable>
                ) : null}
                <AnimatedPressable accessibilityLabel={`${task.title} options`} onPress={onMore} style={styles.moreButton}><MoreHorizontal size={19} color={colours.textMuted} /></AnimatedPressable>
            </View>
            {task.focusSummary ? <QuestFocusProgressSummary summary={task.focusSummary} compact /> : null}
        </Animated.View>
    );
}

function createStyles(colours: AppColours, compact: boolean) {
    return StyleSheet.create({
        row: { minHeight: 120, flexDirection: "row", alignItems: "center", gap: compact ? spacing.sm : spacing.md, paddingHorizontal: compact ? spacing.sm : spacing.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colours.border, backgroundColor: colours.surface },
        mobileRow: { flexDirection: "column", alignItems: "stretch", justifyContent: "flex-start", gap: spacing.sm },
        mobileRowWithoutProgress: { justifyContent: "center" },
        mobileMainRow: { minWidth: 0, flexDirection: "row", alignItems: "center", gap: spacing.sm },
        draggingRow: { borderColor: colours.primaryBorder, backgroundColor: colours.primarySubtle },
        icon: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: radius.md, backgroundColor: colours.primarySubtle },
        copy: { minWidth: 0, flex: 1 },
        title: { fontSize: 14, lineHeight: 19, fontWeight: "800", color: colours.text },
        completedTitle: { color: colours.textMuted, textDecorationLine: "line-through" },
        path: { marginTop: 2, fontSize: 11, color: colours.textMuted },
        focusButton: { minHeight: 38, minWidth: compact ? 38 : 82, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: compact ? 8 : 12, borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.md, backgroundColor: colours.primarySubtle },
        focusText: { fontSize: 12, fontWeight: "800", color: colours.primaryStrong },
        moreButton: { width: 34, height: 38, alignItems: "center", justifyContent: "center" },
    });
}
