import { useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { FolderPlus, ListPlus, Play } from "lucide-react-native";

import { AppButton } from "@/components/ui/AppButton";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

type WorkQuickActionsProps = {
    onNewQuest: () => void;
    onNewJourney: () => void;
    onQuickStart: () => void;
};

export function WorkQuickActions({ onNewQuest, onNewJourney, onQuickStart }: WorkQuickActionsProps) {
    const { width } = useWindowDimensions();
    const { colours } = useAppearance();
    const isMobile = width < 700;
    const styles = useMemo(() => createStyles(colours, isMobile), [colours, isMobile]);

    return (
        <View style={styles.container}>
            <View style={styles.copy}>
                <Text style={styles.title}>Choose the next useful thing</Text>
                <Text style={styles.description}>Start with a Quest. Add a Journey only when grouping helps.</Text>
            </View>

            <View style={styles.actions}>
                <AppButton
                    label="New Quest"
                    icon={<ListPlus size={16} color={colours.onPrimary} />}
                    onPress={onNewQuest}
                    style={styles.action}
                />
                <AppButton
                    label="New Journey"
                    icon={<FolderPlus size={16} color={colours.primaryStrong} />}
                    onPress={onNewJourney}
                    variant="secondary"
                    style={styles.action}
                />
                <AppButton
                    label="Focus next"
                    icon={<Play size={15} color={colours.primaryStrong} fill={colours.primaryStrong} />}
                    onPress={onQuickStart}
                    variant="soft"
                    style={styles.action}
                />
            </View>
        </View>
    );
}

function createStyles(colours: AppColours, isMobile: boolean) {
    return StyleSheet.create({
        container: {
            marginTop: spacing.xl,
            padding: spacing.md,
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "stretch" : "center",
            justifyContent: "space-between",
            gap: spacing.md,
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.lg,
            backgroundColor: colours.primarySubtle,
        },
        copy: { minWidth: 0, flex: isMobile ? undefined : 1 },
        title: { fontSize: 15, fontWeight: "800", color: colours.text },
        description: { maxWidth: 420, marginTop: 3, fontSize: 12, lineHeight: 18, color: colours.textMuted },
        actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
        action: { flexGrow: isMobile ? 1 : 0 },
    });
}
