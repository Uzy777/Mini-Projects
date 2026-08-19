import { useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Check, Circle, MoreHorizontal, Play } from "lucide-react-native";

import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { WorkAssetIcon } from "@/components/work/WorkAssetIcon";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import type { WorkQuest } from "@/types/work";

type Props = {
    task: WorkQuest;
    projectName?: string;
    folderName?: string;
    onToggle: () => void;
    onFocus: () => void;
    onMore: () => void;
};

export function TaskManagerTaskRow({ task, projectName, folderName, onToggle, onFocus, onMore }: Props) {
    const { colours } = useAppearance();
    const { width } = useWindowDimensions();
    const compact = width < 520;
    const styles = useMemo(() => createStyles(colours, compact), [colours, compact]);
    const completed = task.status === "completed";
    const path = [folderName, projectName].filter(Boolean).join(" / ") || "No Project";

    return (
        <View style={styles.row}>
            <AnimatedPressable accessibilityLabel={completed ? `Reopen ${task.title}` : `Complete ${task.title}`} onPress={onToggle} style={[styles.checkbox, completed && styles.checked]} haptic="selection">
                {completed ? <Check size={15} color={colours.onPrimary} strokeWidth={3} /> : <Circle size={18} color={colours.textMuted} />}
            </AnimatedPressable>
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
    );
}

function createStyles(colours: AppColours, compact: boolean) {
    return StyleSheet.create({
        row: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: compact ? spacing.sm : spacing.md, paddingHorizontal: compact ? spacing.sm : spacing.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colours.border, backgroundColor: colours.surface },
        checkbox: { width: 30, height: 30, alignItems: "center", justifyContent: "center", borderRadius: radius.pill },
        checked: { backgroundColor: colours.primary },
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
