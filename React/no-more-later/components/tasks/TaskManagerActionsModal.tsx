import { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { CheckCircle2, FolderInput, RotateCcw, Trash2, X } from "lucide-react-native";

import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import type { WorkJourney } from "@/types/work";

export type ManagedItem = {
    kind: "project" | "task";
    id: string;
    title: string;
    status?: "active" | "completed";
    projectId?: string;
};

type Props = {
    item: ManagedItem | null;
    projects: WorkJourney[];
    onClose: () => void;
    onMoveTask?: (projectId?: string) => void;
    onToggleComplete?: () => void;
    onDelete: () => void;
};

export function TaskManagerActionsModal({ item, projects, onClose, onMoveTask, onToggleComplete, onDelete }: Props) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    if (!item) return null;

    const noun = item.kind === "task" ? "Task" : "Project";

    return (
        <Modal visible transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={styles.card}>
                    <View style={styles.header}>
                        <View style={styles.headerCopy}><Text style={styles.eyebrow}>{noun.toUpperCase()} OPTIONS</Text><Text numberOfLines={2} style={styles.title}>{item.title}</Text></View>
                        <Pressable accessibilityLabel="Close" hitSlop={8} onPress={onClose} style={styles.closeButton}><X size={19} color={colours.textMuted} /></Pressable>
                    </View>

                    {item.kind === "task" && onMoveTask ? (
                        <View style={styles.section}>
                            <View style={styles.sectionHeading}><FolderInput size={16} color={colours.primaryStrong} /><Text style={styles.sectionTitle}>PROJECT</Text></View>
                            <Text style={styles.sectionDescription}>A Task can belong to one Project or remain standalone.</Text>
                            <View style={styles.options}>
                                <Pressable onPress={() => onMoveTask(undefined)} style={[styles.option, !item.projectId && styles.selectedOption]}><Text style={[styles.optionText, !item.projectId && styles.selectedOptionText]}>Standalone</Text></Pressable>
                                {projects.filter((project) => project.status === "active" || project.id === item.projectId).map((project) => {
                                    const selected = item.projectId === project.id;
                                    return <Pressable key={project.id} onPress={() => onMoveTask(project.id)} style={[styles.option, selected && styles.selectedOption]}><Text numberOfLines={1} style={[styles.optionText, selected && styles.selectedOptionText]}>{project.title}</Text></Pressable>;
                                })}
                            </View>
                        </View>
                    ) : null}

                    {item.kind === "task" && onToggleComplete ? (
                        <AnimatedPressable onPress={onToggleComplete} style={styles.actionRow}>
                            <View style={styles.actionIcon}>{item.status === "completed" ? <RotateCcw size={18} color={colours.primaryStrong} /> : <CheckCircle2 size={18} color={colours.success} />}</View>
                            <View style={styles.actionCopy}><Text style={styles.actionTitle}>{item.status === "completed" ? "Reopen Task" : "Mark Task complete"}</Text><Text style={styles.actionDescription}>{item.status === "completed" ? "Return this Task to active work." : "Updates this list only. No Progress credit or XP is awarded."}</Text></View>
                        </AnimatedPressable>
                    ) : null}

                    <AnimatedPressable onPress={onDelete} style={styles.actionRow}>
                        <View style={[styles.actionIcon, styles.deleteIcon]}><Trash2 size={18} color={colours.danger} /></View>
                        <View style={styles.actionCopy}><Text style={[styles.actionTitle, styles.deleteText]}>Delete {noun}</Text><Text style={styles.actionDescription}>{item.kind === "project" ? "Tasks will be kept as standalone Tasks." : "Permanently remove this Task."}</Text></View>
                    </AnimatedPressable>
                </View>
            </View>
        </Modal>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        overlay: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.md, backgroundColor: "rgba(8, 8, 20, 0.58)" },
        card: { width: "100%", maxWidth: 500, padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.xl, backgroundColor: colours.surface },
        header: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
        headerCopy: { minWidth: 0, flex: 1 },
        eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 0.9, color: colours.primaryStrong },
        title: { marginTop: 4, fontSize: 20, fontWeight: "900", color: colours.text },
        closeButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.background },
        section: { gap: spacing.sm, padding: spacing.md, borderWidth: 1, borderColor: colours.border, borderRadius: radius.md, backgroundColor: colours.primarySubtle },
        sectionHeading: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
        sectionTitle: { fontSize: 10, fontWeight: "900", letterSpacing: 0.7, color: colours.text },
        sectionDescription: { fontSize: 12, color: colours.textMuted },
        options: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
        option: { maxWidth: "100%", paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: colours.border, borderRadius: radius.pill, backgroundColor: colours.surface },
        selectedOption: { borderColor: colours.primaryBorder, backgroundColor: colours.primarySoft },
        optionText: { maxWidth: 190, fontSize: 12, fontWeight: "700", color: colours.textMuted },
        selectedOptionText: { color: colours.primaryStrong },
        actionRow: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.sm, borderRadius: radius.md },
        actionIcon: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: radius.md, backgroundColor: colours.primarySubtle },
        deleteIcon: { backgroundColor: colours.dangerSoft },
        actionCopy: { minWidth: 0, flex: 1 },
        actionTitle: { fontSize: 14, fontWeight: "800", color: colours.text },
        actionDescription: { marginTop: 2, fontSize: 12, lineHeight: 17, color: colours.textMuted },
        deleteText: { color: colours.danger },
    });
}
