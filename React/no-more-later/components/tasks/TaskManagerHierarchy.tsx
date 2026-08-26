import { useMemo, type ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Inbox, ListChecks, MoreHorizontal, Plus } from "lucide-react-native";
import Animated, { LinearTransition, useReducedMotion } from "react-native-reanimated";

import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { WorkAssetIcon } from "@/components/work/WorkAssetIcon";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import type { WorkJourney, WorkQuest, WorkStatus } from "@/types/work";

export type TaskManagerScope = { kind: "all" } | { kind: "standalone" } | { kind: "project"; id: string };

type Props = {
    projects: WorkJourney[];
    tasks: WorkQuest[];
    status: WorkStatus;
    selected: TaskManagerScope;
    compact?: boolean;
    onSelect: (scope: TaskManagerScope) => void;
    onNewProject: () => void;
    onProjectMore: (project: WorkJourney) => void;
    renderProjectDragHandle?: (project: WorkJourney, index: number) => ReactNode;
    draggingProjectId?: string | null;
};

export function TaskManagerHierarchy({ projects, tasks, status, selected, compact = false, onSelect, onNewProject, onProjectMore, renderProjectDragHandle, draggingProjectId }: Props) {
    const { colours } = useAppearance();
    const reduceMotion = useReducedMotion();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const statusTasks = tasks.filter((task) => task.status === status);

    function selectedScope(scope: TaskManagerScope) {
        return selected.kind === scope.kind && (!("id" in scope) || ("id" in selected && selected.id === scope.id));
    }

    return (
        <View style={styles.container}>
            <View style={styles.headingRow}>
                <View><Text style={styles.heading}>PROJECTS</Text><Text style={styles.headingMeta}>Optional organisation</Text></View>
                <AnimatedPressable accessibilityLabel="Create Project" onPress={onNewProject} style={styles.addProjectButton}><Plus size={16} color={colours.primaryStrong} /></AnimatedPressable>
            </View>
            <HierarchyRow icon={<Inbox size={17} color={selectedScope({ kind: "all" }) ? colours.primaryStrong : colours.textMuted} />} label="All Tasks" count={statusTasks.length} selected={selectedScope({ kind: "all" })} onPress={() => onSelect({ kind: "all" })} />
            <HierarchyRow icon={<ListChecks size={17} color={selectedScope({ kind: "standalone" }) ? colours.primaryStrong : colours.textMuted} />} label="Standalone" count={statusTasks.filter((task) => !task.journeyId).length} selected={selectedScope({ kind: "standalone" })} onPress={() => onSelect({ kind: "standalone" })} />

            <View style={styles.divider} />
            <Text style={styles.createdProjectsLabel}>YOUR PROJECTS</Text>
            <ScrollView style={[styles.projectList, compact && styles.projectListCompact]} contentContainerStyle={styles.projectListContent} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                {projects.length ? projects.map((project, index) => {
                    const selectedProject = selectedScope({ kind: "project", id: project.id });
                    return (
                        <Animated.View key={project.id} layout={reduceMotion ? undefined : LinearTransition.duration(150)} style={[styles.projectRow, selectedProject && styles.selectedRow, draggingProjectId === project.id && styles.draggingRow]}>
                            {renderProjectDragHandle?.(project, index)}
                            <AnimatedPressable onPress={() => onSelect({ kind: "project", id: project.id })} style={styles.rowMain}>
                                <View style={[styles.projectIcon, selectedProject && styles.selectedProjectIcon]}><WorkAssetIcon assetId={project.assetId} size={17} color={selectedProject ? colours.primaryStrong : colours.textMuted} /></View>
                                <Text numberOfLines={1} style={[styles.rowLabel, selectedProject && styles.selectedLabel]}>{project.title}</Text>
                                <Text style={styles.count}>{statusTasks.filter((task) => task.journeyId === project.id).length}</Text>
                            </AnimatedPressable>
                            <AnimatedPressable accessibilityLabel={`${project.title} options`} onPress={() => onProjectMore(project)} style={styles.moreButton}><MoreHorizontal size={17} color={colours.textMuted} /></AnimatedPressable>
                        </Animated.View>
                    );
                }) : <Text style={styles.empty}>No Projects yet. Tasks can still remain standalone.</Text>}
            </ScrollView>
        </View>
    );
}

function HierarchyRow({ icon, label, count, selected, onPress }: { icon: React.ReactNode; label: string; count: number; selected: boolean; onPress: () => void }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    return <AnimatedPressable onPress={onPress} style={[styles.basicRow, selected && styles.selectedRow]}>{icon}<Text numberOfLines={1} style={[styles.rowLabel, selected && styles.selectedLabel]}>{label}</Text><Text style={styles.count}>{count}</Text></AnimatedPressable>;
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        container: { gap: 3 },
        headingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm, paddingHorizontal: spacing.sm, paddingBottom: spacing.sm },
        heading: { fontSize: 10, fontWeight: "900", letterSpacing: 0.9, color: colours.textMuted },
        headingMeta: { marginTop: 2, fontSize: 10, color: colours.textMuted },
        addProjectButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.md, backgroundColor: colours.primarySubtle },
        basicRow: { minHeight: 42, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.sm, borderRadius: radius.md },
        projectRow: { minHeight: 42, flexDirection: "row", alignItems: "center", borderRadius: radius.md },
        selectedRow: { backgroundColor: colours.primarySoft },
        draggingRow: { backgroundColor: colours.primarySubtle },
        rowMain: { minWidth: 0, flex: 1, minHeight: 40, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.sm },
        rowLabel: { minWidth: 0, flex: 1, fontSize: 13, fontWeight: "700", color: colours.text },
        selectedLabel: { color: colours.primaryStrong },
        count: { fontSize: 11, fontWeight: "700", color: colours.textMuted },
        moreButton: { width: 36, height: 38, alignItems: "center", justifyContent: "center" },
        divider: { height: 1, marginVertical: spacing.sm, backgroundColor: colours.border },
        createdProjectsLabel: { paddingHorizontal: spacing.sm, paddingBottom: spacing.xs, fontSize: 9, fontWeight: "900", letterSpacing: 0.7, color: colours.textMuted },
        projectList: { maxHeight: 480 },
        projectListCompact: { maxHeight: 248 },
        projectListContent: { gap: 3 },
        projectIcon: { width: 30, height: 30, alignItems: "center", justifyContent: "center", borderRadius: radius.sm, backgroundColor: colours.primarySubtle },
        selectedProjectIcon: { backgroundColor: colours.primarySoft },
        empty: { padding: spacing.sm, fontSize: 11, lineHeight: 17, color: colours.textMuted },
    });
}
