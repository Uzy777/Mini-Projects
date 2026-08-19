import { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { FolderKanban, ListChecks, X } from "lucide-react-native";

import { AppButton } from "@/components/ui/AppButton";
import { WORK_JOURNEY_ASSETS, WORK_QUEST_ASSETS, WorkAssetIcon } from "@/components/work/WorkAssetIcon";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import type { WorkAssetId, WorkJourney } from "@/types/work";

export type TaskManagerCreateKind = "project" | "task";

type Props = {
    visible: boolean;
    kind: TaskManagerCreateKind;
    projects: WorkJourney[];
    initialProjectId?: string;
    onClose: () => void;
    onCreate: (title: string, assetId: WorkAssetId, projectId?: string) => void;
};

const copy = {
    project: {
        eyebrow: "NEW PROJECT",
        title: "Create a Project",
        description: "Projects are optional containers for Tasks that belong together.",
        placeholder: "e.g. Learn React",
        action: "Create Project",
    },
    task: {
        eyebrow: "NEW TASK",
        title: "What needs doing?",
        description: "Create a standalone Task or place it inside one Project.",
        placeholder: "e.g. Practise React hooks",
        action: "Create Task",
    },
} as const;

export function TaskManagerCreateModal({ visible, kind, projects, initialProjectId, onClose, onCreate }: Props) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const [title, setTitle] = useState("");
    const [assetId, setAssetId] = useState<WorkAssetId>(kind === "project" ? "work" : "task");
    const [projectId, setProjectId] = useState<string | undefined>();
    const details = copy[kind];
    const assets = kind === "project" ? WORK_JOURNEY_ASSETS : WORK_QUEST_ASSETS;

    useEffect(() => {
        if (!visible) return;
        setTitle("");
        setAssetId(kind === "project" ? "work" : "task");
        setProjectId(kind === "task" ? initialProjectId : undefined);
    }, [initialProjectId, kind, visible]);

    const trimmedTitle = title.trim();

    function submit() {
        if (!trimmedTitle) return;
        onCreate(trimmedTitle, assetId, kind === "task" ? projectId : undefined);
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={styles.card}>
                    <View style={styles.header}>
                        <View style={styles.headingIcon}>{kind === "project" ? <FolderKanban size={20} color={colours.primaryStrong} /> : <ListChecks size={20} color={colours.primaryStrong} />}</View>
                        <View style={styles.headerCopy}>
                            <Text style={styles.eyebrow}>{details.eyebrow}</Text>
                            <Text style={styles.title}>{details.title}</Text>
                            <Text style={styles.description}>{details.description}</Text>
                        </View>
                        <Pressable accessibilityLabel="Close" hitSlop={8} onPress={onClose} style={styles.closeButton}><X size={19} color={colours.textMuted} /></Pressable>
                    </View>

                    <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                        <TextInput value={title} onChangeText={setTitle} style={styles.input} placeholder={details.placeholder} placeholderTextColor={colours.textMuted} selectionColor={colours.primary} autoFocus returnKeyType="done" onSubmitEditing={submit} />

                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>ICON</Text>
                            <View style={styles.options}>
                                {assets.map((asset) => {
                                    const selected = assetId === asset.id;
                                    return <Pressable key={asset.id} onPress={() => setAssetId(asset.id)} style={[styles.option, selected && styles.selectedOption]}><WorkAssetIcon assetId={asset.id} size={17} color={selected ? colours.primaryStrong : colours.textMuted} /><Text style={[styles.optionText, selected && styles.selectedOptionText]}>{asset.label}</Text></Pressable>;
                                })}
                            </View>
                        </View>

                        {kind === "task" ? (
                            <View style={styles.field}>
                                <Text style={styles.fieldLabel}>PROJECT (OPTIONAL)</Text>
                                <Text style={styles.helper}>A Task can belong to one Project, or remain standalone.</Text>
                                <View style={styles.options}>
                                    <Pressable onPress={() => setProjectId(undefined)} style={[styles.option, !projectId && styles.selectedOption]}><Text style={[styles.optionText, !projectId && styles.selectedOptionText]}>Standalone</Text></Pressable>
                                    {projects.filter((project) => project.status === "active").map((project) => {
                                        const selected = projectId === project.id;
                                        return <Pressable key={project.id} onPress={() => setProjectId(project.id)} style={[styles.option, selected && styles.selectedOption]}><Text numberOfLines={1} style={[styles.optionText, selected && styles.selectedOptionText]}>{project.title}</Text></Pressable>;
                                    })}
                                </View>
                            </View>
                        ) : null}
                    </ScrollView>

                    <View style={styles.actions}><AppButton label="Cancel" onPress={onClose} variant="ghost" /><AppButton label={details.action} onPress={submit} disabled={!trimmedTitle} /></View>
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
        helper: { fontSize: 12, lineHeight: 17, color: colours.textMuted },
        options: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
        option: { maxWidth: "100%", minHeight: 38, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 12, borderWidth: 1, borderColor: colours.border, borderRadius: radius.pill, backgroundColor: colours.background },
        selectedOption: { borderColor: colours.primaryBorder, backgroundColor: colours.primarySoft },
        optionText: { maxWidth: 180, fontSize: 12, fontWeight: "700", color: colours.textMuted },
        selectedOptionText: { color: colours.primaryStrong },
        actions: { flexDirection: "row", justifyContent: "flex-end", gap: spacing.sm },
    });
}
