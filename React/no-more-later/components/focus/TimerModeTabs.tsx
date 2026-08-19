import { useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Armchair, Brain, Coffee } from "lucide-react-native";

import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import type { TimerMode } from "@/types/models";

const TIMER_MODES: { id: TimerMode; label: string; icon: typeof Brain }[] = [
    { id: "focus", label: "Focus", icon: Brain },
    { id: "short-break", label: "Short Break", icon: Coffee },
    { id: "long-break", label: "Long Break", icon: Armchair },
];

export function TimerModeTabs({ selectedMode, minutes, disabled = false, onSelectMode }: { selectedMode: TimerMode; minutes: Record<TimerMode, number>; disabled?: boolean; onSelectMode: (mode: TimerMode) => void }) {
    const { colours } = useAppearance();
    const { width } = useWindowDimensions();
    const compact = width < 520;
    const styles = useMemo(() => createStyles(colours, compact), [colours, compact]);

    return (
        <View accessibilityRole="tablist" style={[styles.tabs, disabled && styles.disabled]}>
            {TIMER_MODES.map((mode) => {
                const selected = selectedMode === mode.id;
                const Icon = mode.icon;
                const tone = getModeTone(mode.id, colours);

                return (
                    <AnimatedPressable
                        key={mode.id}
                        accessibilityRole="tab"
                        accessibilityState={{ selected, disabled }}
                        disabled={disabled}
                        onPress={() => onSelectMode(mode.id)}
                        style={[styles.tab, selected && { borderColor: tone.border, backgroundColor: tone.soft }]}
                        haptic="selection"
                    >
                        <Icon size={15} color={selected ? tone.strong : colours.textMuted} />
                        <Text numberOfLines={1} style={[styles.label, selected && { color: tone.strong }]}>{mode.label}</Text>
                        <View style={[styles.durationBadge, selected && { backgroundColor: tone.badge }]}>
                            <Text style={[styles.duration, selected && { color: tone.strong }]}>{minutes[mode.id]}m</Text>
                        </View>
                    </AnimatedPressable>
                );
            })}
        </View>
    );
}

function getModeTone(mode: TimerMode, colours: AppColours) {
    if (mode === "short-break") return { soft: colours.successSoft, border: colours.success, strong: colours.success, badge: colours.surface };
    if (mode === "long-break") return { soft: colours.warningSoft, border: colours.warningBorder, strong: colours.warning, badge: colours.surface };
    return { soft: colours.primarySoft, border: colours.primaryBorder, strong: colours.primaryStrong, badge: colours.surface };
}

function createStyles(colours: AppColours, compact: boolean) {
    return StyleSheet.create({
        tabs: { width: "100%", flexDirection: "row", gap: spacing.xs, padding: spacing.xs, borderWidth: 1, borderColor: colours.border, borderRadius: radius.md, backgroundColor: colours.background },
        disabled: { opacity: 0.65 },
        tab: { minWidth: 0, flex: 1, minHeight: compact ? 62 : 46, flexDirection: compact ? "column" : "row", alignItems: "center", justifyContent: "center", gap: compact ? 2 : 5, paddingHorizontal: compact ? 3 : spacing.sm, borderWidth: 1, borderColor: "transparent", borderRadius: radius.sm },
        label: { minWidth: 0, flexShrink: 1, fontSize: compact ? 9 : 11, fontWeight: "800", textAlign: "center", color: colours.textMuted },
        durationBadge: { minWidth: 28, minHeight: 22, alignItems: "center", justifyContent: "center", paddingHorizontal: 5, borderRadius: radius.pill, backgroundColor: colours.surface },
        duration: { fontSize: 9, fontWeight: "900", color: colours.textMuted },
    });
}
