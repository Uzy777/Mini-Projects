import { useMemo, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

export function EmptyState({ icon, title, description, actionLabel, onAction }: { icon: ReactNode; title: string; description?: string; actionLabel?: string; onAction?: () => void }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <AppCard style={styles.card} padding="lg" tone="subtle">
            <View style={styles.icon}>{icon}</View>
            <Text style={styles.title}>{title}</Text>
            {description ? <Text style={styles.description}>{description}</Text> : null}
            {actionLabel && onAction ? <AppButton label={actionLabel} variant="soft" onPress={onAction} style={styles.action} /> : null}
        </AppCard>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        card: { minHeight: 170, alignItems: "center", justifyContent: "center" },
        icon: { width: 46, height: 46, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.primarySoft },
        title: { marginTop: spacing.md, fontSize: 16, fontWeight: "800", textAlign: "center", color: colours.text },
        description: { maxWidth: 380, marginTop: spacing.xs, fontSize: 13, lineHeight: 19, textAlign: "center", color: colours.textMuted },
        action: { marginTop: spacing.md },
    });
}
