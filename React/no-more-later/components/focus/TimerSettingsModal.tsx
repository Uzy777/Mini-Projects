import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Brain, Coffee, Minus, Plus, X } from "lucide-react-native";

import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { AppButton } from "@/components/ui/AppButton";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { adjustTimerMinutes, TIMER_LIMITS, type TimerPreferences } from "@/services/storage/timerPreferencesStorage";
import type { TimerMode } from "@/types/models";

const SETTINGS_ROWS: { id: TimerMode; label: string; description: string; icon: typeof Brain }[] = [
    { id: "focus", label: "Focus", description: "Deep work and intentional progress", icon: Brain },
    { id: "break", label: "Break", description: "Rest, reset, and recharge between sessions", icon: Coffee },
];

type TimerSettingsModalProps = {
    visible: boolean;
    preferences: TimerPreferences;
    visibleModes?: TimerMode[];
    onClose: () => void;
    onSave: (preferences: TimerPreferences) => Promise<void>;
};

export function TimerSettingsModal({ visible, preferences, visibleModes, onClose, onSave }: TimerSettingsModalProps) {
    const { colours } = useAppearance();
    const { width } = useWindowDimensions();
    const compact = width < 520;
    const focusOnly = visibleModes?.length === 1 && visibleModes[0] === "focus";
    const visibleRows = visibleModes ? SETTINGS_ROWS.filter((row) => visibleModes.includes(row.id)) : SETTINGS_ROWS;
    const styles = useMemo(() => createStyles(colours, compact), [colours, compact]);
    const [draft, setDraft] = useState(preferences);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");

    useEffect(() => {
        if (visible) {
            setDraft(preferences);
            setSaveError("");
        }
    }, [preferences, visible]);

    async function save() {
        setSaving(true);
        setSaveError("");
        try {
            await onSave(draft);
            onClose();
        } catch (error) {
            console.error("Failed to save timer settings:", error);
            setSaveError("Timer settings could not be saved. Try again.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={() => !saving && onClose()}>
            <View style={styles.backdrop}>
                <Pressable style={StyleSheet.absoluteFill} onPress={() => !saving && onClose()} />
                <View style={styles.card}>
                    <View style={styles.header}>
                        <View style={styles.headerCopy}>
                            <Text style={styles.eyebrow}>TIMER SETTINGS</Text>
                            <Text style={styles.title}>{focusOnly ? "Set the focus time" : "Make the timer yours"}</Text>
                            <Text style={styles.description}>{focusOnly ? "Choose the Focus duration for this session. Your Break duration stays unchanged." : "These durations are shared by Quick Focus and Task Focus on this device."}</Text>
                        </View>
                        <AnimatedPressable accessibilityLabel="Close timer settings" onPress={onClose} disabled={saving} style={styles.closeButton}><X size={19} color={colours.textMuted} /></AnimatedPressable>
                    </View>

                    <View style={styles.rows}>
                        {visibleRows.map((row) => {
                            const Icon = row.icon;
                            const limits = TIMER_LIMITS[row.id];
                            return (
                                <View key={row.id} style={styles.row}>
                                    <View style={styles.rowIcon}><Icon size={18} color={colours.primaryStrong} /></View>
                                    <View style={styles.rowCopy}>
                                        <Text style={styles.rowLabel}>{row.label}</Text>
                                        <Text style={styles.rowDescription}>{row.description}</Text>
                                    </View>
                                    <View style={styles.stepper}>
                                        <AnimatedPressable accessibilityLabel={`Reduce ${row.label}`} disabled={draft[row.id] <= limits.min} onPress={() => setDraft((current) => ({ ...current, [row.id]: adjustTimerMinutes(row.id, current[row.id], -1) }))} style={styles.stepButton}><Minus size={15} color={colours.text} /></AnimatedPressable>
                                        <Text style={styles.minutes}>{draft[row.id]} min</Text>
                                        <AnimatedPressable accessibilityLabel={`Increase ${row.label}`} disabled={draft[row.id] >= limits.max} onPress={() => setDraft((current) => ({ ...current, [row.id]: adjustTimerMinutes(row.id, current[row.id], 1) }))} style={styles.stepButton}><Plus size={15} color={colours.text} /></AnimatedPressable>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    <Text style={styles.xpNote}>Focus for at least 5 complete minutes to earn 3 XP per minute. Completing the work adds 20%. Up to 360 focused minutes per day count; breaks remain 0 XP.</Text>
                    {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}
                    <View style={styles.actions}>
                        <AppButton label="Cancel" variant="secondary" disabled={saving} onPress={onClose} style={styles.action} />
                        <AppButton label={focusOnly ? "Save focus time" : "Save timers"} loading={saving} onPress={() => void save()} style={styles.action} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

function createStyles(colours: AppColours, compact: boolean) {
    return StyleSheet.create({
        backdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, backgroundColor: "rgba(8, 8, 20, 0.55)" },
        card: { width: "100%", maxWidth: 560, padding: spacing.lg, borderWidth: 1, borderColor: colours.border, borderRadius: radius.lg, backgroundColor: colours.surface },
        header: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
        headerCopy: { minWidth: 0, flex: 1 },
        eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 0.8, color: colours.primaryStrong },
        title: { marginTop: 4, fontSize: 21, fontWeight: "900", color: colours.text },
        description: { marginTop: 4, fontSize: 12, lineHeight: 18, color: colours.textMuted },
        closeButton: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.background },
        rows: { marginTop: spacing.lg, gap: spacing.sm },
        row: { minHeight: 76, flexDirection: "row", flexWrap: compact ? "wrap" : "nowrap", alignItems: "center", gap: spacing.sm, padding: spacing.sm, borderWidth: 1, borderColor: colours.border, borderRadius: radius.md, backgroundColor: colours.background },
        rowIcon: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: radius.md, backgroundColor: colours.primarySoft },
        rowCopy: { minWidth: 0, flex: 1 },
        rowLabel: { fontSize: 13, fontWeight: "800", color: colours.text },
        rowDescription: { marginTop: 2, fontSize: 10, lineHeight: 15, color: colours.textMuted },
        stepper: { width: compact ? "100%" : undefined, flexDirection: "row", alignItems: "center", justifyContent: compact ? "space-between" : "flex-start", padding: 3, borderRadius: radius.md, backgroundColor: colours.surface },
        stepButton: { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: radius.sm, backgroundColor: colours.primarySubtle },
        minutes: { minWidth: 58, paddingHorizontal: 5, fontSize: 12, fontWeight: "800", textAlign: "center", color: colours.text },
        xpNote: { marginTop: spacing.md, padding: spacing.sm, borderRadius: radius.sm, fontSize: 11, lineHeight: 17, color: colours.textMuted, backgroundColor: colours.primarySubtle },
        saveError: { marginTop: spacing.sm, fontSize: 12, lineHeight: 18, fontWeight: "700", color: colours.danger },
        actions: { marginTop: spacing.lg, flexDirection: "row", gap: spacing.sm },
        action: { flex: 1 },
    });
}
