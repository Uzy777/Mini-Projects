import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { ChevronDown, ChevronUp, FolderPlus, FolderKanban, ListChecks, Plus, Search } from "lucide-react-native";

import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";
import { TaskManagerActionsModal, type ManagedItem, type TaskManagerLocationOption } from "@/components/tasks/TaskManagerActionsModal";
import { TaskManagerCreateModal, type TaskManagerCreateKind, type TaskManagerParent } from "@/components/tasks/TaskManagerCreateModal";
import { TaskManagerHierarchy, type TaskManagerScope } from "@/components/tasks/TaskManagerHierarchy";
import { TaskManagerTaskRow } from "@/components/tasks/TaskManagerTaskRow";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import type { AppColours } from "@/constants/appearanceColours";
import { layout, radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { useAuth } from "@/contexts/AuthContext";
import { syncJourneyStatusFromQuests } from "@/services/journeyStatusService";
import { deleteRemoteQuest, updateRemoteQuestStatus } from "@/services/quests/questService";
import { getActiveFocusSession } from "@/services/storage/activeFocusSessionStorage";
import {
    createRemoteWorkFolder,
    createRemoteWorkJourney,
    createRemoteWorkQuest,
    deleteRemoteWorkFolder,
    deleteRemoteWorkJourney,
    getRemoteWorkFolders,
    getRemoteWorkJourneys,
    getRemoteWorkQuests,
    updateRemoteWorkProjectFolder,
    updateRemoteWorkTaskLocation,
} from "@/services/work/workService";
import type { WorkAssetId, WorkFolder, WorkJourney, WorkQuest, WorkStatus } from "@/types/work";
import { confirmDelete } from "@/utils/confirmDelete";
import { showMessage } from "@/utils/showMessage";

export default function TasksScreen() {
    const { colours } = useAppearance();
    const { session } = useAuth();
    const { width } = useWindowDimensions();
    const router = useRouter();
    const isDesktop = width >= layout.desktopBreakpoint;
    const styles = useMemo(() => createStyles(colours, isDesktop), [colours, isDesktop]);

    const [folders, setFolders] = useState<WorkFolder[]>([]);
    const [projects, setProjects] = useState<WorkJourney[]>([]);
    const [tasks, setTasks] = useState<WorkQuest[]>([]);
    const [status, setStatus] = useState<WorkStatus>("active");
    const [scope, setScope] = useState<TaskManagerScope>({ kind: "all" });
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [browseOpen, setBrowseOpen] = useState(false);
    const [createKind, setCreateKind] = useState<TaskManagerCreateKind | null>(null);
    const [managedItem, setManagedItem] = useState<ManagedItem | null>(null);

    const loadData = useCallback(async () => {
        if (!session) {
            setFolders([]);
            setProjects([]);
            setTasks([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setLoadError("");
        try {
            const [folderResult, projectResult, taskResult] = await Promise.all([
                getRemoteWorkFolders(session.user.id),
                getRemoteWorkJourneys(session.user.id),
                getRemoteWorkQuests(session.user.id),
            ]);
            const error = folderResult.error ?? projectResult.error ?? taskResult.error;
            if (error) throw error;
            setFolders(folderResult.data ?? []);
            setProjects(projectResult.data ?? []);
            setTasks(taskResult.data ?? []);
        } catch (error) {
            console.error("Failed to load Tasks workspace:", error);
            setLoadError("Your Tasks workspace could not be loaded. If this is the first run, apply the new work folders migration.");
        } finally {
            setLoading(false);
        }
    }, [session]);

    useFocusEffect(useCallback(() => { void loadData(); }, [loadData]));

    const projectById = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects]);
    const folderById = useMemo(() => new Map(folders.map((folder) => [folder.id, folder])), [folders]);
    const normalizedQuery = query.trim().toLowerCase();
    const scopedTasks = tasks.filter((task) => {
        if (task.status !== status) return false;
        const project = task.journeyId ? projectById.get(task.journeyId) : undefined;
        const folder = task.folderId ? folderById.get(task.folderId) : project?.folderId ? folderById.get(project.folderId) : undefined;

        if (scope.kind === "standalone" && (task.journeyId || task.folderId)) return false;
        if (scope.kind === "project" && task.journeyId !== scope.id) return false;
        if (scope.kind === "folder" && task.folderId !== scope.id && project?.folderId !== scope.id) return false;
        if (normalizedQuery && ![task.title, project?.title, folder?.title].some((value) => value?.toLowerCase().includes(normalizedQuery))) return false;
        return true;
    });

    const scopeCopy = getScopeCopy(scope, folders, projects);
    const initialParent: TaskManagerParent | undefined = createKind === "task" && (scope.kind === "project" || scope.kind === "folder")
        ? { kind: scope.kind, id: scope.id }
        : createKind === "project" && scope.kind === "folder"
          ? { kind: "folder", id: scope.id }
          : undefined;

    async function handleCreate(title: string, assetId: WorkAssetId, parent?: TaskManagerParent) {
        if (!session || !createKind) return;
        try {
            if (createKind === "folder") {
                const result = await createRemoteWorkFolder(session.user.id, title);
                if (result.error || !result.data) throw result.error ?? new Error("Folder was not created.");
                setFolders((current) => [...current, result.data!]);
            } else if (createKind === "project") {
                const result = await createRemoteWorkJourney(session.user.id, title, assetId, parent?.kind === "folder" ? parent.id : undefined);
                if (result.error || !result.data) throw result.error ?? new Error("Project was not created.");
                setProjects((current) => [result.data!, ...current]);
            } else {
                const result = await createRemoteWorkQuest(
                    session.user.id,
                    title,
                    assetId,
                    parent?.kind === "project" ? parent.id : undefined,
                    parent?.kind === "folder" ? parent.id : undefined,
                );
                if (result.error || !result.data) throw result.error ?? new Error("Task was not created.");
                setTasks((current) => [result.data!, ...current]);
            }
            setCreateKind(null);
        } catch (error) {
            console.error(`Failed to create ${createKind}:`, error);
            showMessage("Could not create item", "Please try again.");
        }
    }

    async function toggleTask(task: WorkQuest) {
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

    async function refreshProjectStatus(projectId: string, nextTasks: WorkQuest[]) {
        const projectTasks = nextTasks.filter((task) => task.journeyId === projectId);
        const nextStatus = await syncJourneyStatusFromQuests(projectId, projectTasks);
        setProjects((current) => current.map((project) => project.id === projectId ? { ...project, status: nextStatus } : project));
    }

    async function moveManagedItem(location?: { kind: "folder" | "project"; id: string }) {
        if (!managedItem) return;
        try {
            if (managedItem.kind === "task") {
                const previousProjectId = managedItem.parentKind === "project" ? managedItem.parentId : undefined;
                const result = await updateRemoteWorkTaskLocation(managedItem.id, location);
                if (result.error || !result.data) throw result.error ?? new Error("Task was not moved.");
                const nextTasks = tasks.map((task) => task.id === result.data!.id ? result.data! : task);
                setTasks(nextTasks);
                if (previousProjectId) await refreshProjectStatus(previousProjectId, nextTasks);
                if (location?.kind === "project") await refreshProjectStatus(location.id, nextTasks);
            } else if (managedItem.kind === "project") {
                const result = await updateRemoteWorkProjectFolder(managedItem.id, location?.kind === "folder" ? location.id : undefined);
                if (result.error || !result.data) throw result.error ?? new Error("Project was not moved.");
                setProjects((current) => current.map((project) => project.id === result.data!.id ? result.data! : project));
            }
            setManagedItem(null);
        } catch (error) {
            console.error("Failed to move item:", error);
            showMessage("Item was not moved", "Please try again.");
        }
    }

    function requestDeleteManagedItem() {
        if (!managedItem) return;
        const item = managedItem;
        setManagedItem(null);
        const noun = item.kind[0].toUpperCase() + item.kind.slice(1);
        const consequence = item.kind === "folder" ? "Projects will remain without a Folder." : item.kind === "project" ? "Tasks will remain without a Project." : "This cannot be undone.";
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
                if (item.parentKind === "project" && item.parentId) await refreshProjectStatus(item.parentId, nextTasks);
            } else if (item.kind === "project") {
                const result = await deleteRemoteWorkJourney(item.id);
                if (result.error) throw result.error;
                setProjects((current) => current.filter((project) => project.id !== item.id));
                setTasks((current) => current.map((task) => task.journeyId === item.id ? withoutProject(task) : task));
                if (scope.kind === "project" && scope.id === item.id) setScope({ kind: "all" });
            } else {
                const result = await deleteRemoteWorkFolder(item.id);
                if (result.error) throw result.error;
                setFolders((current) => current.filter((folder) => folder.id !== item.id));
                setProjects((current) => current.map((project) => project.folderId === item.id ? withoutFolder(project) : project));
                setTasks((current) => current.map((task) => task.folderId === item.id ? withoutDirectFolder(task) : task));
                if (scope.kind === "folder" && scope.id === item.id) setScope({ kind: "all" });
            }
        } catch (error) {
            console.error("Failed to delete item:", error);
            showMessage("Item was not deleted", "Please try again.");
        }
    }

    function focusTask(task: WorkQuest) {
        router.push({ pathname: "/focus/[questId]", params: { questId: task.id, questTitle: task.title, source: "tasks", ...(task.journeyId ? { journeyId: task.journeyId } : {}) } });
    }

    const hierarchy = (
        <TaskManagerHierarchy
            folders={folders}
            projects={projects}
            tasks={tasks}
            status={status}
            selected={scope}
            onSelect={(nextScope) => { setScope(nextScope); setBrowseOpen(false); }}
            onFolderMore={(folder) => setManagedItem({ kind: "folder", id: folder.id, title: folder.title })}
            onProjectMore={(project) => setManagedItem({ kind: "project", id: project.id, title: project.title, status: project.status, parentId: project.folderId, parentKind: project.folderId ? "folder" : undefined })}
        />
    );

    return (
        <AppScreenBackground>
            <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <ScreenHeader eyebrow="TASKS" title="Get things done" subtitle="Tasks stay simple. Add a Project or Folder only when it makes your work easier to navigate." action={<AppButton label="New Task" icon={<Plus size={16} color={colours.onPrimary} />} onPress={() => setCreateKind("task")} />} />

                <View style={styles.actionStrip}>
                    <View style={styles.actionCopy}><Text style={styles.actionTitle}>Add only the structure you need</Text><Text style={styles.actionDescription}>Folder and Project are both optional.</Text></View>
                    <View style={styles.actions}>
                        <AppButton label="Project" icon={<FolderKanban size={16} color={colours.primaryStrong} />} onPress={() => setCreateKind("project")} variant="soft" size="sm" />
                        <AppButton label="Folder" icon={<FolderPlus size={16} color={colours.textMuted} />} onPress={() => setCreateKind("folder")} variant="secondary" size="sm" />
                    </View>
                </View>

                <View style={styles.toolbar}>
                    <View accessibilityRole="tablist" style={styles.statusControl}>
                        {(["active", "completed"] as const).map((value) => <AnimatedPressable key={value} accessibilityRole="tab" accessibilityState={{ selected: status === value }} onPress={() => setStatus(value)} style={[styles.statusButton, status === value && styles.selectedStatusButton]}><Text style={[styles.statusText, status === value && styles.selectedStatusText]}>{value === "active" ? "Active" : "Completed"}</Text></AnimatedPressable>)}
                    </View>
                    <View style={styles.searchBox}><Search size={17} color={colours.textMuted} /><TextInput value={query} onChangeText={setQuery} style={styles.searchInput} placeholder="Search Tasks, Projects or Folders" placeholderTextColor={colours.textMuted} selectionColor={colours.primary} /></View>
                </View>

                {!isDesktop ? <AppCard padding="sm" style={styles.mobileBrowseCard}><AnimatedPressable onPress={() => setBrowseOpen((current) => !current)} style={styles.mobileBrowseButton}><View><Text style={styles.mobileBrowseLabel}>BROWSING</Text><Text style={styles.mobileBrowseValue}>{scopeCopy.title}</Text></View>{browseOpen ? <ChevronUp size={18} color={colours.primaryStrong} /> : <ChevronDown size={18} color={colours.primaryStrong} />}</AnimatedPressable>{browseOpen ? <View style={styles.mobileHierarchy}>{hierarchy}</View> : null}</AppCard> : null}

                {loading ? <View style={styles.loading}><ActivityIndicator color={colours.primary} /><Text style={styles.loadingText}>Loading your Tasks…</Text></View> : loadError ? <EmptyState icon={<ListChecks size={22} color={colours.danger} />} title="Tasks unavailable" description={loadError} actionLabel="Try again" onAction={() => void loadData()} /> : (
                    <View style={styles.manager}>
                        {isDesktop ? <AppCard padding="md" style={styles.hierarchyPanel}>{hierarchy}</AppCard> : null}
                        <AppCard padding="sm" style={styles.taskPanel}>
                            <View style={styles.taskHeader}>
                                <View style={styles.taskHeaderCopy}><Text style={styles.taskTitle}>{scopeCopy.title}</Text><Text style={styles.taskDescription}>{scopeCopy.description}</Text></View>
                                <View style={styles.taskCount}><Text style={styles.taskCountText}>{scopedTasks.length}</Text></View>
                            </View>
                            <View style={styles.taskList}>
                                {scopedTasks.length ? scopedTasks.map((task) => {
                                    const project = task.journeyId ? projectById.get(task.journeyId) : undefined;
                                    const folder = task.folderId ? folderById.get(task.folderId) : project?.folderId ? folderById.get(project.folderId) : undefined;
                                    return <TaskManagerTaskRow key={task.id} task={task} projectName={project?.title} folderName={folder?.title} onToggle={() => void toggleTask(task)} onFocus={() => focusTask(task)} onMore={() => setManagedItem({ kind: "task", id: task.id, title: task.title, status: task.status, parentId: task.journeyId ?? task.folderId, parentKind: task.journeyId ? "project" : task.folderId ? "folder" : undefined })} />;
                                }) : <EmptyState icon={<ListChecks size={22} color={colours.primaryStrong} />} title={normalizedQuery ? "No matching Tasks" : status === "active" ? "Nothing waiting here" : "No completed Tasks here"} description={normalizedQuery ? "Try a different search or location." : status === "active" ? "Create one clear Task and focus on what matters next." : "Completed Tasks will appear here."} actionLabel={status === "active" && !normalizedQuery ? "Create Task" : undefined} onAction={status === "active" && !normalizedQuery ? () => setCreateKind("task") : undefined} />}
                            </View>
                        </AppCard>
                    </View>
                )}
            </ScrollView>

            <TaskManagerCreateModal visible={createKind !== null} kind={createKind ?? "task"} folders={folders} projects={projects} initialParent={initialParent} onClose={() => setCreateKind(null)} onCreate={(title, assetId, parent) => void handleCreate(title, assetId, parent)} />
            <TaskManagerActionsModal
                item={managedItem}
                parentOptions={getLocationOptions(managedItem, folders, projects)}
                onClose={() => setManagedItem(null)}
                onMove={managedItem?.kind === "folder" ? undefined : (location) => void moveManagedItem(location)}
                onToggleComplete={managedItem?.kind === "task" ? () => { const task = tasks.find((entry) => entry.id === managedItem.id); if (task) void toggleTask(task); } : undefined}
                onDelete={requestDeleteManagedItem}
            />
        </AppScreenBackground>
    );
}

function getScopeCopy(scope: TaskManagerScope, folders: WorkFolder[], projects: WorkJourney[]) {
    if (scope.kind === "standalone") return { title: "Unsorted Tasks", description: "Tasks without a Folder or Project." };
    if (scope.kind === "project") return { title: projects.find((project) => project.id === scope.id)?.title ?? "Project", description: "Tasks inside this Project." };
    if (scope.kind === "folder") return { title: folders.find((folder) => folder.id === scope.id)?.title ?? "Folder", description: "Tasks across every Project in this Folder." };
    return { title: "All Tasks", description: "Everything active across your workspace." };
}

function withoutProject(task: WorkQuest): WorkQuest { const { journeyId: _journeyId, ...rest } = task; return rest; }
function withoutFolder(project: WorkJourney): WorkJourney { const { folderId: _folderId, ...rest } = project; return rest; }
function withoutDirectFolder(task: WorkQuest): WorkQuest { const { folderId: _folderId, ...rest } = task; return rest; }

function getLocationOptions(item: ManagedItem | null, folders: WorkFolder[], projects: WorkJourney[]): TaskManagerLocationOption[] {
    if (item?.kind === "task") {
        return [
            ...folders.map((folder) => ({ id: folder.id, title: folder.title, kind: "folder" as const })),
            ...projects.filter((project) => project.status === "active").map((project) => ({ id: project.id, title: project.title, kind: "project" as const })),
        ];
    }
    if (item?.kind === "project") return folders.map((folder) => ({ id: folder.id, title: folder.title, kind: "folder" as const }));
    return [];
}

function createStyles(colours: AppColours, isDesktop: boolean) {
    return StyleSheet.create({
        screen: { flex: 1, backgroundColor: "transparent" },
        content: { width: "100%", maxWidth: layout.contentMaxWidth, alignSelf: "center", paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 100, gap: spacing.md },
        actionStrip: { padding: spacing.md, flexDirection: isDesktop ? "row" : "column", alignItems: isDesktop ? "center" : "stretch", justifyContent: "space-between", gap: spacing.md, borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.lg, backgroundColor: colours.primarySubtle },
        actionCopy: { minWidth: 0, flex: isDesktop ? 1 : undefined },
        actionTitle: { fontSize: 14, fontWeight: "800", color: colours.text },
        actionDescription: { marginTop: 2, fontSize: 12, color: colours.textMuted },
        actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
        toolbar: { flexDirection: isDesktop ? "row" : "column", alignItems: isDesktop ? "center" : "stretch", gap: spacing.sm },
        statusControl: { flexDirection: "row", padding: 3, borderRadius: radius.md, backgroundColor: colours.primarySubtle },
        statusButton: { minHeight: 38, minWidth: isDesktop ? 108 : 0, flex: isDesktop ? undefined : 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.md, borderRadius: radius.sm },
        selectedStatusButton: { borderWidth: 1, borderColor: colours.primaryBorder, backgroundColor: colours.primarySoft },
        statusText: { fontSize: 12, fontWeight: "700", color: colours.textMuted },
        selectedStatusText: { color: colours.primaryStrong },
        searchBox: { minHeight: 44, flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colours.border, borderRadius: radius.md, backgroundColor: colours.surface },
        searchInput: { minWidth: 0, flex: 1, paddingVertical: 10, fontSize: 13, color: colours.text },
        manager: { flexDirection: isDesktop ? "row" : "column", alignItems: "flex-start", gap: spacing.md },
        hierarchyPanel: { width: 310, flexShrink: 0 },
        taskPanel: { minWidth: 0, flex: 1, width: isDesktop ? undefined : "100%", overflow: "hidden" },
        taskHeader: { minHeight: 68, flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colours.border, backgroundColor: colours.primarySubtle },
        taskHeaderCopy: { minWidth: 0, flex: 1 },
        taskTitle: { fontSize: 17, fontWeight: "900", color: colours.text },
        taskDescription: { marginTop: 2, fontSize: 11, color: colours.textMuted },
        taskCount: { minWidth: 30, height: 30, alignItems: "center", justifyContent: "center", paddingHorizontal: 8, borderRadius: radius.pill, backgroundColor: colours.primarySoft },
        taskCountText: { fontSize: 12, fontWeight: "900", color: colours.primaryStrong },
        taskList: { minHeight: 180 },
        mobileBrowseCard: { overflow: "hidden" },
        mobileBrowseButton: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md, paddingHorizontal: spacing.sm },
        mobileBrowseLabel: { fontSize: 9, fontWeight: "900", letterSpacing: 0.7, color: colours.textMuted },
        mobileBrowseValue: { marginTop: 2, fontSize: 14, fontWeight: "800", color: colours.text },
        mobileHierarchy: { paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colours.border },
        loading: { minHeight: 220, alignItems: "center", justifyContent: "center", gap: spacing.sm },
        loadingText: { fontSize: 13, color: colours.textMuted },
    });
}
