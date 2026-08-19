import { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Folder, FolderKanban, ListChecks, X } from "lucide-react-native";

import { AppButton } from "@/components/ui/AppButton";
import { WORK_JOURNEY_ASSETS, WORK_QUEST_ASSETS, WorkAssetIcon } from "@/components/work/WorkAssetIcon";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import type { WorkAssetId, WorkFolder, WorkJourney } from "@/types/work";

export type TaskManagerCreateKind = "folder" | "project" | "task";
export type TaskManagerParent = { kind: "folder" | "project"; id: string };

type Props = {
    visible: boolean;
    kind: TaskManagerCreateKind;
    folders: WorkFolder[];
    projects: WorkJourney[];
    initialParent?: TaskManagerParent;
    onClose: () => void;
    onCreate: (title: string, assetId: WorkAssetId, parent?: TaskManagerParent) => void;
};

const copy = {
    folder: {
        eyebrow: "NEW FOLDER",
        title: "Create a Folder",
        description: "Folders are optional. Use one only when several Projects belong together.",
        placeholder: "e.g. Personal",
        action: "Create Folder",
    },
    project: {
        eyebrow: "NEW PROJECT",
        title: "Create a Project",
        description: "Projects group related Tasks and can optionally live inside a Folder.",
        placeholder: "e.g. Portfolio Website",
        action: "Create Project",
    },
    task: {
        eyebrow: "NEW TASK",
        title: "What needs doing?",
        description: "Keep the Task clear and actionable. A Project is optional.",
        placeholder: "e.g. Build the sign-in form",
        action: "Create Task",
    },
} as const;

export function TaskManagerCreateModal({ visible, kind, folders, projects, initialParent, onClose, onCreate }: Props) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const [title, setTitle] = useState("");
    const [assetId, setAssetId] = useState<WorkAssetId>(kind === "project" ? "work" : "task");
    const [parent, setParent] = useState<TaskManagerParent | undefined>();
    const details = copy[kind];

    useEffect(() => {
        if (!visible) return;
        setTitle("");
        setAssetId(kind === "project" ? "work" : "task");
        setParent(initialParent);
    }, [initialParent?.id, initialParent?.kind, kind, visible]);

    const trimmedTitle = title.trim();
    const assets = kind === "project" ? WORK_JOURNEY_ASSETS : WORK_QUEST_ASSETS;
    const parentOptions: Array<TaskManagerParent & { title: string }> = kind === "project"
        ? folders.map((folder) => ({ ...folder, kind: "folder" as const }))
        : [
              ...folders.map((folder) => ({ ...folder, kind: "folder" as const })),
              ...projects.filter((project) => project.status === "active").map((project) => ({ ...project, kind: "project" as const })),
          ];
    const parentLabel = kind === "project" ? "FOLDER (OPTIONAL)" : "LOCATION (OPTIONAL)";
    const noParentLabel = kind === "project" ? "No Folder" : "Unsorted";

    function submit() {
        if (!trimmedTitle) return;
        onCreate(trimmedTitle, assetId, parent);
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={styles.card}>
                    <View style={styles.header}>
                        <View style={styles.headingIcon}>
                            {kind === "folder" ? <Folder size={20} color={colours.primaryStrong} /> : kind === "project" ? <FolderKanban size={20} color={colours.primaryStrong} /> : <ListChecks size={20} color={colours.primaryStrong} />}
                        </View>
                        <View style={styles.headerCopy}>
                            <Text style={styles.eyebrow}>{details.eyebrow}</Text>
                            <Text style={styles.title}>{details.title}</Text>
                            <Text style={styles.description}>{details.description}</Text>
                        </View>
                        <Pressable accessibilityLabel="Close" hitSlop={8} onPress={onClose} style={styles.closeButton}>
                            <X size={19} color={colours.textMuted} />
                        </Pressable>
                    </View>

                    <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            style={styles.input}
                            placeholder={details.placeholder}
                            placeholderTextColor={colours.textMuted}
                            selectionColor={colours.primary}
                            autoFocus
                            returnKeyType="done"
                            onSubmitEditing={submit}
                        />

                        {kind !== "folder" ? (
                            <>
                                <View style={styles.field}>
                                    <Text style={styles.fieldLabel}>ICON</Text>
                                    <View style={styles.options}>
                                        {assets.map((asset) => {
                                            const selected = assetId === asset.id;
                                            return (
                                                <Pressable key={asset.id} onPress={() => setAssetId(asset.id)} style={[styles.option, selected && styles.selectedOption]}>
                                                    <WorkAssetIcon assetId={asset.id} size={17} color={selected ? colours.primaryStrong : colours.textMuted} />
                                                    <Text style={[styles.optionText, selected && styles.selectedOptionText]}>{asset.label}</Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                </View>

                                <View style={styles.field}>
                                    <Text style={styles.fieldLabel}>{parentLabel}</Text>
                                    <View style={styles.options}>
                                        <Pressable onPress={() => setParent(undefined)} style={[styles.option, !parent && styles.selectedOption]}>
                                            <Text style={[styles.optionText, !parent && styles.selectedOptionText]}>{noParentLabel}</Text>
                                        </Pressable>
                                        {parentOptions.map((option) => {
                                            const selected = parent?.kind === option.kind && parent.id === option.id;
                                            return (
                                                <Pressable key={`${option.kind}-${option.id}`} onPress={() => setParent({ kind: option.kind, id: option.id })} style={[styles.option, selected && styles.selectedOption]}>
                                                    {kind === "task" ? <Text style={[styles.optionKind, selected && styles.selectedOptionText]}>{option.kind === "folder" ? "Folder" : "Project"}</Text> : null}
                                                    <Text numberOfLines={1} style={[styles.optionText, selected && styles.selectedOptionText]}>{option.title}</Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                </View>
                            </>
                        ) : null}
                    </ScrollView>

                    <View style={styles.actions}>
                        <AppButton label="Cancel" onPress={onClose} variant="ghost" />
                        <AppButton label={details.action} onPress={submit} disabled={!trimmedTitle} />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        overlay: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.md, backgroundColor: "rgba(8, 8, 20, 0.58)" },
        card: { width: "100%", maxWidth: 560, maxHeight: "90%", padding: spacing.lg, gap: spacing.lg, borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.xl, backgroundColor: colours.surface },
        header: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
        headingIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: radius.md, backgroundColor: colours.primarySubtle },
        headerCopy: { minWidth: 0, flex: 1 },
        eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1, color: colours.primaryStrong },
        title: { marginTop: 3, fontSize: 22, fontWeight: "900", color: colours.text },
        description: { marginTop: 4, fontSize: 13, lineHeight: 19, color: colours.textMuted },
        closeButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.background },
        form: { gap: spacing.lg },
        input: { minHeight: 50, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colours.border, borderRadius: radius.md, backgroundColor: colours.background, fontSize: 15, color: colours.text },
        field: { gap: spacing.sm },
        fieldLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 0.8, color: colours.textMuted },
        options: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
        option: { maxWidth: "100%", minHeight: 38, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 12, borderWidth: 1, borderColor: colours.border, borderRadius: radius.pill, backgroundColor: colours.background },
        selectedOption: { borderColor: colours.primaryBorder, backgroundColor: colours.primarySoft },
        optionText: { maxWidth: 180, fontSize: 12, fontWeight: "700", color: colours.textMuted },
        optionKind: { fontSize: 9, fontWeight: "900", textTransform: "uppercase", color: colours.textMuted },
        selectedOptionText: { color: colours.primaryStrong },
        actions: { flexDirection: "row", justifyContent: "flex-end", gap: spacing.sm },
    });
}
