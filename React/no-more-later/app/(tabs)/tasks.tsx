import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { CheckCircle2, ListChecks, MoreHorizontal, Plus, Search } from "lucide-react-native";

import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";
import { TaskManagerActionsModal, type ManagedItem } from "@/components/tasks/TaskManagerActionsModal";
import { TaskManagerCreateModal, type TaskManagerCreateKind } from "@/components/tasks/TaskManagerCreateModal";
import { TaskManagerDragHandle } from "@/components/tasks/TaskManagerDragHandle";
import { TaskManagerHierarchy, type TaskManagerScope } from "@/components/tasks/TaskManagerHierarchy";
import { TaskManagerTaskRow } from "@/components/tasks/TaskManagerTaskRow";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { AnimatedProgressBar } from "@/components/ui/AnimatedProgressBar";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { AppCard } from "@/components/ui/AppCard";
import { AppTextInput, getInputFocusStyle } from "@/components/ui/AppTextInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { KeyboardAwareScrollView } from "@/components/ui/KeyboardAwareLayout";
import type { AppColours } from "@/constants/appearanceColours";
import { getScreenGutter, layout, radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { useAuth } from "@/contexts/AuthContext";
import { syncJourneyStatusFromQuests } from "@/services/journeyStatusService";
import { deleteRemoteQuest, updateRemoteQuestStatus } from "@/services/quests/questService";
import { getActiveFocusSession } from "@/services/storage/activeFocusSessionStorage";
import {
    createRemoteWorkJourney,
    createRemoteWorkQuest,
    deleteRemoteWorkJourney,
    getRemoteWorkJourneys,
    getRemoteWorkQuests,
    reorderRemoteWorkJourneys,
    reorderRemoteWorkQuests,
    updateRemoteWorkQuestJourney,
} from "@/services/work/workService";
import type { WorkAssetId, WorkJourney, WorkQuest, WorkStatus } from "@/types/work";
import { confirmDelete } from "@/utils/confirmDelete";
import { showMessage } from "@/utils/showMessage";

const PROJECT_ROW_HEIGHT = 45;
const TASK_ROW_HEIGHT = 120;

type OrderedItem = { id: string; sortOrder: number };

type ActiveReorder<T extends OrderedItem> = {
    id: string;
    baseItems: T[];
    latestItems: T[];
    visibleIds: string[];
    startIndex: number;
    currentIndex: number;
};

export default function TasksScreen() {
    const { colours } = useAppearance();
    const { session } = useAuth();
    const { width } = useWindowDimensions();
    const router = useRouter();
    const isDesktop = width >= layout.desktopBreakpoint;
    const styles = useMemo(() => createStyles(colours, isDesktop, width), [colours, isDesktop, width]);

    const [projects, setProjects] = useState<WorkJourney[]>([]);
    const [tasks, setTasks] = useState<WorkQuest[]>([]);
    const [status, setStatus] = useState<WorkStatus>("active");
    const [scope, setScope] = useState<TaskManagerScope>({ kind: "all" });
    const [query, setQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [createKind, setCreateKind] = useState<TaskManagerCreateKind | null>(null);
    const [managedItem, setManagedItem] = useState<ManagedItem | null>(null);
    const [draggingProjectId, setDraggingProjectId] = useState<string | null>(null);
    const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
    const [isSavingProjectOrder, setIsSavingProjectOrder] = useState(false);
    const [isSavingTaskOrder, setIsSavingTaskOrder] = useState(false);
    const projectReorder = useRef<ActiveReorder<WorkJourney> | null>(null);
    const taskReorder = useRef<ActiveReorder<WorkQuest> | null>(null);

    const loadData = useCallback(async () => {
        if (!session) {
            setProjects([]);
            setTasks([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setLoadError("");
        try {
            const [projectResult, taskResult] = await Promise.all([
                getRemoteWorkJourneys(session.user.id),
                getRemoteWorkQuests(session.user.id),
            ]);
            const error = projectResult.error ?? taskResult.error;
            if (error) throw error;
            setProjects(projectResult.data ?? []);
            setTasks(taskResult.data ?? []);
        } catch (error) {
            console.error("Failed to load Tasks workspace:", error);
            setLoadError("Your Tasks could not be loaded. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [session]);

    useFocusEffect(useCallback(() => { void loadData(); }, [loadData]));

    const projectById = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects]);
    const normalizedQuery = query.trim().toLowerCase();
    const scopedTasks = tasks.filter((task) => {
        if (task.status !== status) return false;
        const project = task.journeyId ? projectById.get(task.journeyId) : undefined;
        if (scope.kind === "standalone" && task.journeyId) return false;
        if (scope.kind === "project" && task.journeyId !== scope.id) return false;
        if (normalizedQuery && ![task.title, project?.title].some((value) => value?.toLowerCase().includes(normalizedQuery))) return false;
        return true;
    });

    const scopeCopy = getScopeCopy(scope, projects);
    const selectedProject = scope.kind === "project" ? projects.find((project) => project.id === scope.id) : undefined;
    const selectedProjectTasks = selectedProject ? tasks.filter((task) => task.journeyId === selectedProject.id) : [];
    const completedProjectTaskCount = selectedProjectTasks.filter((task) => task.status === "completed").length;
    const projectProgress = selectedProjectTasks.length > 0 ? completedProjectTaskCount / selectedProjectTasks.length : 0;
    const projectProgressPercentage = Math.round(projectProgress * 100);
    const selectedProjectIsComplete = Boolean(selectedProject && selectedProjectTasks.length > 0 && completedProjectTaskCount === selectedProjectTasks.length);
    const emptyTaskState = getEmptyTaskState(normalizedQuery, status, Boolean(selectedProject), selectedProjectIsComplete, selectedProjectTasks.length);
    const initialProjectId = createKind === "task" && scope.kind === "project" ? scope.id : undefined;

    async function handleCreate(title: string, assetId: WorkAssetId, projectId?: string) {
        if (!session || !createKind) return;
        try {
            if (createKind === "project") {
                const result = await createRemoteWorkJourney(session.user.id, title, assetId);
                if (result.error || !result.data) throw result.error ?? new Error("Project was not created.");
                setProjects((current) => [result.data!, ...current]);
            } else {
                const result = await createRemoteWorkQuest(session.user.id, title, assetId, projectId);
                if (result.error || !result.data) throw result.error ?? new Error("Task was not created.");
                setTasks((current) => [result.data!, ...current]);
            }
            setStatus("active");
            setCreateKind(null);
        } catch (error) {
            console.error(`Failed to create ${createKind}:`, error);
            showMessage("Could not create item", "Please try again.");
        }
    }

    async function updateTaskStatus(task: WorkQuest) {
        const nextStatus: WorkStatus = task.status === "completed" ? "active" : "completed";
        try {
            const result = await updateRemoteQuestStatus(task.id, nextStatus);
            if (result.error) throw result.error;
            const nextTasks = tasks.map((entry) => entry.id === task.id ? { ...entry, status: nextStatus } : entry);
            setTasks(nextTasks);
            if (task.journeyId) await refreshProjectStatus(task.journeyId, nextTasks);
            setManagedItem(null);
        } catch (error) {
            console.error("Failed to update Task:", error);
            showMessage("Task was not updated", "Please try again.");
        }
    }

    function requestTaskStatusChange(task: WorkQuest) {
        if (task.status === "completed") {
            void updateTaskStatus(task);
            return;
        }

        setManagedItem(null);
        confirmTaskCompletion(task.title, () => { void updateTaskStatus(task); });
    }

    async function refreshProjectStatus(projectId: string, nextTasks: WorkQuest[]) {
        const projectTasks = nextTasks.filter((task) => task.journeyId === projectId);
        const nextStatus = await syncJourneyStatusFromQuests(projectId, projectTasks);
        setProjects((current) => current.map((project) => project.id === projectId ? { ...project, status: nextStatus } : project));
    }

    async function moveTask(projectId?: string) {
        if (!managedItem || managedItem.kind !== "task") return;
        const previousProjectId = managedItem.projectId;
        try {
            const result = await updateRemoteWorkQuestJourney(managedItem.id, projectId);
            if (result.error || !result.data) throw result.error ?? new Error("Task was not moved.");
            const nextTasks = tasks.map((task) => task.id === result.data!.id ? { ...result.data!, ...(task.focusSummary ? { focusSummary: task.focusSummary } : {}) } : task);
            setTasks(nextTasks);
            if (previousProjectId) await refreshProjectStatus(previousProjectId, nextTasks);
            if (projectId) await refreshProjectStatus(projectId, nextTasks);
            setManagedItem(null);
        } catch (error) {
            console.error("Failed to move Task:", error);
            showMessage("Task was not moved", "Please try again.");
        }
    }

    function requestDeleteManagedItem() {
        if (!managedItem) return;
        const item = managedItem;
        setManagedItem(null);
        const noun = item.kind === "task" ? "Task" : "Project";
        const consequence = item.kind === "project" ? "Its Tasks will remain as standalone Tasks." : "This cannot be undone.";
        confirmDelete({ title: `Delete ${noun}?`, message: `Delete “${item.title}”? ${consequence}`, onConfirm: () => { void deleteManagedItem(item); } });
    }

    async function deleteManagedItem(item: ManagedItem) {
        try {
            if (item.kind === "task") {
                const activeSession = await getActiveFocusSession();
                if (activeSession?.questId === item.id) {
                    showMessage("Task has an active session", "End or review its Focus Session before deleting this Task.");
                    return;
                }
                const result = await deleteRemoteQuest(item.id);
                if (result.error) throw result.error;
                const nextTasks = tasks.filter((task) => task.id !== item.id);
                setTasks(nextTasks);
                if (item.projectId) await refreshProjectStatus(item.projectId, nextTasks);
            } else {
                const result = await deleteRemoteWorkJourney(item.id);
                if (result.error) throw result.error;
                setProjects((current) => current.filter((project) => project.id !== item.id));
                setTasks((current) => current.map((task) => task.journeyId === item.id ? withoutProject(task) : task));
                if (scope.kind === "project" && scope.id === item.id) setScope({ kind: "all" });
            }
        } catch (error) {
            console.error("Failed to delete item:", error);
            showMessage("Item was not deleted", "Please try again.");
        }
    }

    function focusTask(task: WorkQuest) {
        router.push({ pathname: "/focus/[questId]", params: { questId: task.id, questTitle: task.title, source: "tasks", ...(task.journeyId ? { journeyId: task.journeyId } : {}) } });
    }

    function startProjectReorder(projectId: string) {
        if (isSavingProjectOrder) return;
        projectReorder.current = createActiveReorder(projects, projects.map((project) => project.id), projectId);
        setDraggingProjectId(projectId);
    }

    function moveProjectReorder(distanceY: number) {
        const activeReorder = projectReorder.current;
        if (!activeReorder) return;
        const targetIndex = getTargetIndex(activeReorder, distanceY, PROJECT_ROW_HEIGHT);
        if (targetIndex === activeReorder.currentIndex) return;
        activeReorder.currentIndex = targetIndex;
        activeReorder.latestItems = reorderVisibleItems(activeReorder, targetIndex);
        setProjects(activeReorder.latestItems);
    }

    async function finishProjectReorder() {
        const activeReorder = projectReorder.current;
        projectReorder.current = null;
        setDraggingProjectId(null);
        if (!activeReorder || activeReorder.currentIndex === activeReorder.startIndex) return;

        setIsSavingProjectOrder(true);
        const result = await reorderRemoteWorkJourneys(activeReorder.latestItems.map((project) => project.id));
        setIsSavingProjectOrder(false);
        if (!result.error) return;

        console.error("Failed to reorder Projects:", result.error);
        setProjects(activeReorder.baseItems);
        showMessage("Project order was not saved", "Your previous order has been restored. Try again.");
    }

    function moveProjectByStep(projectId: string, direction: -1 | 1) {
        startProjectReorder(projectId);
        moveProjectReorder(direction * PROJECT_ROW_HEIGHT);
        void finishProjectReorder();
    }

    function startTaskReorder(taskId: string) {
        if (isSavingTaskOrder) return;
        taskReorder.current = createActiveReorder(tasks, scopedTasks.map((task) => task.id), taskId);
        setDraggingTaskId(taskId);
    }

    function moveTaskReorder(distanceY: number) {
        const activeReorder = taskReorder.current;
        if (!activeReorder) return;
        const targetIndex = getTargetIndex(activeReorder, distanceY, TASK_ROW_HEIGHT);
        if (targetIndex === activeReorder.currentIndex) return;
        activeReorder.currentIndex = targetIndex;
        activeReorder.latestItems = reorderVisibleItems(activeReorder, targetIndex);
        setTasks(activeReorder.latestItems);
    }

    async function finishTaskReorder() {
        const activeReorder = taskReorder.current;
        taskReorder.current = null;
        setDraggingTaskId(null);
        if (!activeReorder || activeReorder.currentIndex === activeReorder.startIndex) return;

        setIsSavingTaskOrder(true);
        const result = await reorderRemoteWorkQuests(activeReorder.latestItems.map((task) => task.id));
        setIsSavingTaskOrder(false);
        if (!result.error) return;

        console.error("Failed to reorder Tasks:", result.error);
        setTasks(activeReorder.baseItems);
        showMessage("Task order was not saved", "Your previous order has been restored. Try again.");
    }

    function moveTaskByStep(taskId: string, direction: -1 | 1) {
        startTaskReorder(taskId);
        moveTaskReorder(direction * TASK_ROW_HEIGHT);
        void finishTaskReorder();
    }

    const hierarchy = (
        <TaskManagerHierarchy
            projects={projects}
            tasks={tasks}
            status={status}
            selected={scope}
            compact={!isDesktop}
            draggingProjectId={draggingProjectId}
            onSelect={setScope}
            onNewProject={() => setCreateKind("project")}
            onProjectMore={(project) => setManagedItem({ kind: "project", id: project.id, title: project.title, status: project.status })}
            renderProjectDragHandle={projects.length > 1 ? (project, index) => (
                <TaskManagerDragHandle
                    label={project.title}
                    disabled={isSavingProjectOrder}
                    canMoveUp={index > 0}
                    canMoveDown={index < projects.length - 1}
                    onDragStart={() => startProjectReorder(project.id)}
                    onDragMove={moveProjectReorder}
                    onDragEnd={() => void finishProjectReorder()}
                    onMoveUp={() => moveProjectByStep(project.id, -1)}
                    onMoveDown={() => moveProjectByStep(project.id, 1)}
                />
            ) : undefined}
        />
    );

    return (
        <AppScreenBackground>
            <KeyboardAwareScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <ScreenHeader eyebrow="TASKS" title="Get things done" subtitle="Create Tasks first. Use a Project only when several Tasks belong together." />

                <View style={styles.toolbar}>
                    <SegmentedControl
                        value={status}
                        onChange={setStatus}
                        style={styles.statusControl}
                        options={[
                            { value: "active", label: "Active" },
                            { value: "completed", label: "Completed" },
                        ]}
                    />
                    <View style={[styles.searchBox, isSearchFocused && styles.searchBoxFocused]}>
                        <Search size={17} color={isSearchFocused ? colours.primary : colours.textMuted} />
                        <AppTextInput
                            variant="bare"
                            value={query}
                            onChangeText={setQuery}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            style={styles.searchInput}
                            placeholder="Search Tasks or Projects"
                            placeholderTextColor={colours.textMuted}
                            selectionColor={colours.primary}
                        />
                    </View>
                </View>

                {!isDesktop ? (
                    <AppCard padding="sm" style={styles.mobileHierarchyPanel}>{hierarchy}</AppCard>
                ) : null}

                {loading ? <View style={styles.loading}><ActivityIndicator color={colours.primary} /><Text style={styles.loadingText}>Loading your Tasks…</Text></View> : loadError ? <EmptyState icon={<ListChecks size={22} color={colours.danger} />} title="Tasks unavailable" description={loadError} actionLabel="Try again" onAction={() => void loadData()} /> : (
                    <View style={styles.manager}>
                        {isDesktop ? <AppCard padding="md" style={styles.hierarchyPanel}>{hierarchy}</AppCard> : null}
                        <AppCard padding="sm" style={styles.taskPanel}>
                            <View style={styles.taskHeader}>
                                <View style={styles.taskHeaderTop}>
                                    <View style={styles.taskHeaderCopy}><Text style={styles.taskTitle}>{scopeCopy.title}</Text><Text style={styles.taskDescription}>{scopeCopy.description}</Text></View>
                                    <View style={styles.taskCount}><Text style={styles.taskCountText}>{scopedTasks.length}</Text></View>
                                    {selectedProject ? <AnimatedPressable accessibilityLabel={`${selectedProject.title} options`} onPress={() => setManagedItem({ kind: "project", id: selectedProject.id, title: selectedProject.title, status: selectedProject.status })} style={styles.projectMore}><MoreHorizontal size={19} color={colours.textMuted} /></AnimatedPressable> : null}
                                    <AnimatedPressable accessibilityLabel="Create Task" onPress={() => setCreateKind("task")} style={styles.newTaskButton}>
                                        <Plus size={16} color={colours.onPrimary} />
                                        {width >= 520 ? <Text style={styles.newTaskText}>New Task</Text> : null}
                                    </AnimatedPressable>
                                </View>
                                {selectedProject ? (
                                    <View
                                        accessibilityLabel={`${projectProgressPercentage}% complete. ${completedProjectTaskCount} of ${selectedProjectTasks.length} Tasks completed.`}
                                        accessibilityRole="progressbar"
                                        accessibilityValue={{ min: 0, max: 100, now: projectProgressPercentage }}
                                        style={styles.projectProgress}
                                    >
                                        <View style={styles.projectProgressHeader}>
                                            <Text style={styles.projectProgressLabel}>Progress</Text>
                                            <Text style={styles.projectProgressPercentage}>{projectProgressPercentage}%</Text>
                                        </View>
                                        <AnimatedProgressBar progress={projectProgress} height={7} />
                                        <Text style={styles.projectProgressSummary}>{completedProjectTaskCount} of {selectedProjectTasks.length} {selectedProjectTasks.length === 1 ? "Task" : "Tasks"} completed</Text>
                                    </View>
                                ) : null}
                            </View>
                            <View style={styles.taskList}>
                                {scopedTasks.length ? scopedTasks.map((task, index) => {
                                    const project = task.journeyId ? projectById.get(task.journeyId) : undefined;
                                    return (
                                        <TaskManagerTaskRow
                                            key={task.id}
                                            task={task}
                                            projectName={project?.title}
                                            isDragging={draggingTaskId === task.id}
                                            dragHandle={scopedTasks.length > 1 ? (
                                                <TaskManagerDragHandle
                                                    label={task.title}
                                                    disabled={isSavingTaskOrder}
                                                    canMoveUp={index > 0}
                                                    canMoveDown={index < scopedTasks.length - 1}
                                                    onDragStart={() => startTaskReorder(task.id)}
                                                    onDragMove={moveTaskReorder}
                                                    onDragEnd={() => void finishTaskReorder()}
                                                    onMoveUp={() => moveTaskByStep(task.id, -1)}
                                                    onMoveDown={() => moveTaskByStep(task.id, 1)}
                                                />
                                            ) : undefined}
                                            onFocus={() => focusTask(task)}
                                            onMore={() => setManagedItem({ kind: "task", id: task.id, title: task.title, status: task.status, projectId: task.journeyId })}
                                        />
                                    );
                                }) : (
                                    <EmptyState
                                        icon={selectedProjectIsComplete && status === "active" && !normalizedQuery ? <CheckCircle2 size={22} color={colours.success} /> : <ListChecks size={22} color={colours.primaryStrong} />}
                                        title={emptyTaskState.title}
                                        description={emptyTaskState.description}
                                        actionLabel={emptyTaskState.actionLabel}
                                        onAction={emptyTaskState.action === "viewCompleted" ? () => setStatus("completed") : emptyTaskState.action === "create" ? () => setCreateKind("task") : undefined}
                                    />
                                )}
                            </View>
                        </AppCard>
                    </View>
                )}
            </KeyboardAwareScrollView>

            <TaskManagerCreateModal visible={createKind !== null} kind={createKind ?? "task"} projects={projects} initialProjectId={initialProjectId} onClose={() => setCreateKind(null)} onCreate={(title, assetId, projectId) => void handleCreate(title, assetId, projectId)} />
            <TaskManagerActionsModal item={managedItem} projects={projects} onClose={() => setManagedItem(null)} onMoveTask={managedItem?.kind === "task" ? (projectId) => void moveTask(projectId) : undefined} onToggleComplete={managedItem?.kind === "task" ? () => { const task = tasks.find((entry) => entry.id === managedItem.id); if (task) requestTaskStatusChange(task); } : undefined} onDelete={requestDeleteManagedItem} />
        </AppScreenBackground>
    );
}

function createActiveReorder<T extends OrderedItem>(items: T[], visibleIds: string[], id: string): ActiveReorder<T> {
    const startIndex = visibleIds.indexOf(id);

    return {
        id,
        baseItems: items,
        latestItems: items,
        visibleIds,
        startIndex,
        currentIndex: startIndex,
    };
}

function getTargetIndex<T extends OrderedItem>(activeReorder: ActiveReorder<T>, distanceY: number, rowHeight: number) {
    const requestedIndex = activeReorder.startIndex + Math.round(distanceY / rowHeight);
    return Math.max(0, Math.min(activeReorder.visibleIds.length - 1, requestedIndex));
}

function reorderVisibleItems<T extends OrderedItem>(activeReorder: ActiveReorder<T>, targetIndex: number): T[] {
    const reorderedVisibleIds = [...activeReorder.visibleIds];
    reorderedVisibleIds.splice(activeReorder.startIndex, 1);
    reorderedVisibleIds.splice(targetIndex, 0, activeReorder.id);

    const itemById = new Map(activeReorder.baseItems.map((item) => [item.id, item]));
    const visibleIdSet = new Set(activeReorder.visibleIds);
    let visibleIndex = 0;

    return activeReorder.baseItems.map((item, index) => {
        const nextItem = visibleIdSet.has(item.id) ? itemById.get(reorderedVisibleIds[visibleIndex++])! : item;
        return { ...nextItem, sortOrder: (index + 1) * 1024 };
    });
}

function confirmTaskCompletion(taskTitle: string, onConfirm: () => void) {
    const message = `Mark “${taskTitle}” complete?\n\nThis only updates your Task list. It will not count towards Progress or award XP. Complete a Focus Session and Review to record focused progress.`;
    if (Platform.OS === "web") {
        if (window.confirm(message)) onConfirm();
        return;
    }
    Alert.alert("Mark Task complete?", message, [{ text: "Cancel", style: "cancel" }, { text: "Mark complete", onPress: onConfirm }]);
}

function getScopeCopy(scope: TaskManagerScope, projects: WorkJourney[]) {
    if (scope.kind === "standalone") return { title: "Standalone Tasks", description: "One-off Tasks that do not need a Project." };
    if (scope.kind === "project") return { title: projects.find((project) => project.id === scope.id)?.title ?? "Project", description: "Related Tasks inside this Project." };
    return { title: "All Tasks", description: "Everything across your Projects and standalone work." };
}

function getEmptyTaskState(normalizedQuery: string, status: WorkStatus, hasSelectedProject: boolean, selectedProjectIsComplete: boolean, selectedProjectTaskCount: number) {
    if (normalizedQuery) return { title: "No matching Tasks", description: "Try a different search or Project." };
    if (status === "completed") return { title: "No completed Tasks here", description: "Completed Tasks will appear here." };
    if (selectedProjectIsComplete) {
        return {
            title: "Project complete",
            description: `All ${selectedProjectTaskCount} ${selectedProjectTaskCount === 1 ? "Task is" : "Tasks are"} complete. Review the finished work, or add another Task if this Project continues.`,
            actionLabel: "View completed Tasks",
            action: "viewCompleted" as const,
        };
    }
    return {
        title: "Nothing waiting here",
        description: hasSelectedProject && selectedProjectTaskCount === 0 ? "Create the first clear Task for this Project." : "Create one clear Task and focus on what matters next.",
        actionLabel: "Create Task",
        action: "create" as const,
    };
}

function withoutProject(task: WorkQuest): WorkQuest { const { journeyId: _journeyId, ...rest } = task; return rest; }

function createStyles(colours: AppColours, isDesktop: boolean, width: number) {
    return StyleSheet.create({
        screen: { flex: 1, backgroundColor: "transparent" },
        content: { width: "100%", maxWidth: layout.contentMaxWidth, alignSelf: "center", paddingHorizontal: getScreenGutter(width), paddingTop: spacing.lg, paddingBottom: 100, gap: spacing.md },
        toolbar: { flexDirection: isDesktop ? "row" : "column", alignItems: isDesktop ? "center" : "stretch", gap: spacing.sm },
        statusControl: { width: isDesktop ? 232 : "100%" },
        searchBox: { minHeight: 44, flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colours.border, borderRadius: radius.md, backgroundColor: colours.surface },
        searchBoxFocused: getInputFocusStyle(colours),
        searchInput: { minWidth: 0, flex: 1, paddingVertical: 10, fontSize: 13, color: colours.text },
        mobileHierarchyPanel: { width: "100%" },
        manager: { flexDirection: isDesktop ? "row" : "column", alignItems: "flex-start", gap: spacing.md },
        hierarchyPanel: { width: 290, flexShrink: 0 },
        taskPanel: { minWidth: 0, flex: 1, width: isDesktop ? undefined : "100%", overflow: "hidden" },
        taskHeader: { minHeight: 68, gap: spacing.md, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colours.border, backgroundColor: colours.primarySubtle },
        taskHeaderTop: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
        taskHeaderCopy: { minWidth: 0, flex: 1 },
        taskTitle: { fontSize: 17, fontWeight: "900", color: colours.text },
        taskDescription: { marginTop: 2, fontSize: 11, color: colours.textMuted },
        taskCount: { minWidth: 30, height: 30, alignItems: "center", justifyContent: "center", paddingHorizontal: 8, borderRadius: radius.pill, backgroundColor: colours.primarySoft },
        taskCountText: { fontSize: 12, fontWeight: "900", color: colours.primaryStrong },
        projectMore: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: radius.md, backgroundColor: colours.surface },
        newTaskButton: { minWidth: 38, height: 38, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: width >= 520 ? 12 : 0, borderRadius: radius.md, backgroundColor: colours.primary },
        newTaskText: { fontSize: 12, fontWeight: "800", color: colours.onPrimary },
        projectProgress: { gap: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colours.primaryBorder },
        projectProgressHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
        projectProgressLabel: { fontSize: 12, fontWeight: "800", color: colours.textMuted },
        projectProgressPercentage: { fontSize: 13, fontWeight: "900", color: colours.primaryStrong },
        projectProgressSummary: { fontSize: 12, color: colours.textMuted },
        taskList: { minHeight: 180 },
        loading: { minHeight: 220, alignItems: "center", justifyContent: "center", gap: spacing.sm },
        loadingText: { fontSize: 13, color: colours.textMuted },
    });
}
