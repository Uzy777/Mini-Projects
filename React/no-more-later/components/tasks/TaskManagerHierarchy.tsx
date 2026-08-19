import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ChevronDown, ChevronRight, Folder, FolderKanban, Inbox, MoreHorizontal } from "lucide-react-native";

import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import type { WorkFolder, WorkJourney, WorkQuest, WorkStatus } from "@/types/work";

export type TaskManagerScope =
    | { kind: "all" }
    | { kind: "standalone" }
    | { kind: "folder"; id: string }
    | { kind: "project"; id: string };

type Props = {
    folders: WorkFolder[];
    projects: WorkJourney[];
    tasks: WorkQuest[];
    status: WorkStatus;
    selected: TaskManagerScope;
    onSelect: (scope: TaskManagerScope) => void;
    onFolderMore: (folder: WorkFolder) => void;
    onProjectMore: (project: WorkJourney) => void;
};

export function TaskManagerHierarchy({ folders, projects, tasks, status, selected, onSelect, onFolderMore, onProjectMore }: Props) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const [collapsedFolderIds, setCollapsedFolderIds] = useState<Set<string>>(new Set());
    const statusTasks = tasks.filter((task) => task.status === status);
    const visibleProjects = projects.filter((project) => project.status === status || statusTasks.some((task) => task.journeyId === project.id));
    const unfiledProjects = visibleProjects.filter((project) => !project.folderId);

    function isSelected(scope: TaskManagerScope) {
        return selected.kind === scope.kind && (!("id" in scope) || ("id" in selected && selected.id === scope.id));
    }

    function toggleFolder(folderId: string) {
        setCollapsedFolderIds((current) => {
            const next = new Set(current);
            if (next.has(folderId)) next.delete(folderId);
            else next.add(folderId);
            return next;
        });
    }

    return (
        <View style={styles.container}>
            <View style={styles.headingRow}>
                <Text style={styles.heading}>BROWSE</Text>
                <Text style={styles.headingMeta}>Folder → Project → Task</Text>
            </View>

            <HierarchyRow
                icon={<Inbox size={17} color={isSelected({ kind: "all" }) ? colours.primaryStrong : colours.textMuted} />}
                label="All Tasks"
                count={statusTasks.length}
                selected={isSelected({ kind: "all" })}
                onPress={() => onSelect({ kind: "all" })}
            />
            <HierarchyRow
                icon={<FolderKanban size={17} color={isSelected({ kind: "standalone" }) ? colours.primaryStrong : colours.textMuted} />}
                label="Unsorted"
                count={statusTasks.filter((task) => !task.journeyId && !task.folderId).length}
                selected={isSelected({ kind: "standalone" })}
                onPress={() => onSelect({ kind: "standalone" })}
            />

            {folders.length ? <Text style={styles.groupLabel}>FOLDERS</Text> : null}
            {folders.map((folder) => {
                const folderProjects = visibleProjects.filter((project) => project.folderId === folder.id);
                const folderProjectIds = new Set(folderProjects.map((project) => project.id));
                const folderTaskCount = statusTasks.filter((task) => task.folderId === folder.id || (task.journeyId && folderProjectIds.has(task.journeyId))).length;
                const collapsed = collapsedFolderIds.has(folder.id);
                const folderSelected = isSelected({ kind: "folder", id: folder.id });

                return (
                    <View key={folder.id}>
                        <View style={[styles.folderRow, folderSelected && styles.selectedRow]}>
                            <AnimatedPressable accessibilityLabel={collapsed ? `Expand ${folder.title}` : `Collapse ${folder.title}`} onPress={() => toggleFolder(folder.id)} style={styles.disclosure}>
                                {collapsed ? <ChevronRight size={16} color={colours.textMuted} /> : <ChevronDown size={16} color={colours.textMuted} />}
                            </AnimatedPressable>
                            <AnimatedPressable onPress={() => onSelect({ kind: "folder", id: folder.id })} style={styles.rowMain}>
                                <Folder size={17} color={folderSelected ? colours.primaryStrong : colours.textMuted} />
                                <Text numberOfLines={1} style={[styles.rowLabel, folderSelected && styles.selectedLabel]}>{folder.title}</Text>
                                <Text style={styles.count}>{folderTaskCount}</Text>
                            </AnimatedPressable>
                            <AnimatedPressable accessibilityLabel={`${folder.title} options`} onPress={() => onFolderMore(folder)} style={styles.moreButton}><MoreHorizontal size={17} color={colours.textMuted} /></AnimatedPressable>
                        </View>

                        {!collapsed ? (
                            <View style={styles.children}>
                                {folderProjects.length ? folderProjects.map((project) => (
                                    <ProjectRow key={project.id} project={project} taskCount={statusTasks.filter((task) => task.journeyId === project.id).length} selected={isSelected({ kind: "project", id: project.id })} onPress={() => onSelect({ kind: "project", id: project.id })} onMore={() => onProjectMore(project)} />
                                )) : <Text style={styles.emptyChild}>No Projects</Text>}
                            </View>
                        ) : null}
                    </View>
                );
            })}

            {unfiledProjects.length ? (
                <View>
                    <Text style={styles.groupLabel}>PROJECTS WITHOUT A FOLDER</Text>
                    {unfiledProjects.map((project) => (
                        <ProjectRow key={project.id} project={project} taskCount={statusTasks.filter((task) => task.journeyId === project.id).length} selected={isSelected({ kind: "project", id: project.id })} onPress={() => onSelect({ kind: "project", id: project.id })} onMore={() => onProjectMore(project)} />
                    ))}
                </View>
            ) : null}
        </View>
    );
}

function HierarchyRow({ icon, label, count, selected, onPress }: { icon: React.ReactNode; label: string; count: number; selected: boolean; onPress: () => void }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    return <AnimatedPressable onPress={onPress} style={[styles.basicRow, selected && styles.selectedRow]}>{icon}<Text numberOfLines={1} style={[styles.rowLabel, selected && styles.selectedLabel]}>{label}</Text><Text style={styles.count}>{count}</Text></AnimatedPressable>;
}

function ProjectRow({ project, taskCount, selected, onPress, onMore }: { project: WorkJourney; taskCount: number; selected: boolean; onPress: () => void; onMore: () => void }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    return <View style={[styles.projectRow, selected && styles.selectedRow]}><AnimatedPressable onPress={onPress} style={styles.rowMain}><View style={[styles.projectDot, selected && styles.selectedDot]} /><Text numberOfLines={1} style={[styles.rowLabel, selected && styles.selectedLabel]}>{project.title}</Text><Text style={styles.count}>{taskCount}</Text></AnimatedPressable><AnimatedPressable accessibilityLabel={`${project.title} options`} onPress={onMore} style={styles.moreButton}><MoreHorizontal size={17} color={colours.textMuted} /></AnimatedPressable></View>;
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        container: { gap: 3 },
        headingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm, paddingHorizontal: spacing.sm, paddingBottom: spacing.sm },
        heading: { fontSize: 10, fontWeight: "900", letterSpacing: 0.9, color: colours.textMuted },
        headingMeta: { fontSize: 10, color: colours.textMuted },
        basicRow: { minHeight: 42, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.sm, borderRadius: radius.md },
        folderRow: { minHeight: 42, flexDirection: "row", alignItems: "center", borderRadius: radius.md },
        projectRow: { minHeight: 40, flexDirection: "row", alignItems: "center", borderRadius: radius.md },
        selectedRow: { backgroundColor: colours.primarySoft },
        disclosure: { width: 30, height: 38, alignItems: "center", justifyContent: "center" },
        rowMain: { minWidth: 0, flex: 1, minHeight: 40, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.sm },
        rowLabel: { minWidth: 0, flex: 1, fontSize: 13, fontWeight: "700", color: colours.text },
        selectedLabel: { color: colours.primaryStrong },
        count: { fontSize: 11, fontWeight: "700", color: colours.textMuted },
        moreButton: { width: 36, height: 38, alignItems: "center", justifyContent: "center" },
        groupLabel: { marginTop: spacing.md, marginBottom: spacing.xs, paddingHorizontal: spacing.sm, fontSize: 9, fontWeight: "900", letterSpacing: 0.7, color: colours.textMuted },
        children: { marginLeft: 23, paddingLeft: spacing.sm, borderLeftWidth: 1, borderLeftColor: colours.primaryBorder },
        projectDot: { width: 9, height: 9, borderRadius: radius.pill, backgroundColor: colours.primaryMuted },
        selectedDot: { backgroundColor: colours.primary },
        emptyChild: { paddingHorizontal: spacing.sm, paddingVertical: 10, fontSize: 11, color: colours.textMuted },
    });
}
