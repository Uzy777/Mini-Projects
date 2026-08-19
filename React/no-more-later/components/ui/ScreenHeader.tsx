import { useMemo, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

export function ScreenHeader({ eyebrow = "NO MORE LATER", title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: ReactNode }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <View style={styles.header}>
            <View style={styles.copy}>
                <Text style={styles.eyebrow}>{eyebrow}</Text>
                <Text style={styles.title}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {action ? <View style={styles.action}>{action}</View> : null}
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        header: { marginTop: spacing.xl, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.md },
        copy: { minWidth: 0, flex: 1 },
        eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.1, color: colours.primary },
        title: { marginTop: spacing.xs, fontSize: 30, lineHeight: 36, fontWeight: "900", letterSpacing: -0.6, color: colours.text },
        subtitle: { maxWidth: 620, marginTop: spacing.xs, fontSize: 14, lineHeight: 21, color: colours.textMuted },
        action: { minHeight: 42, alignItems: "center", justifyContent: "center", borderRadius: radius.md },
    });
}
