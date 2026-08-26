import { useMemo, type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

type AppCardProps = Omit<ViewProps, "children" | "style"> & {
    children: ReactNode;
    tone?: "default" | "subtle" | "accent";
    padding?: "sm" | "md" | "lg";
    style?: StyleProp<ViewStyle>;
};

export function AppCard({ children, tone = "default", padding = "md", style, ...viewProps }: AppCardProps) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);

    return <View {...viewProps} style={[styles.card, styles[`${tone}Tone`], styles[`${padding}Padding`], style]}>{children}</View>;
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        card: { borderWidth: 1, borderRadius: radius.lg },
        defaultTone: { borderColor: colours.border, backgroundColor: colours.surface },
        subtleTone: { borderColor: colours.border, backgroundColor: colours.primarySubtle },
        accentTone: { borderColor: colours.primaryBorder, backgroundColor: colours.primarySoft },
        smPadding: { padding: spacing.sm },
        mdPadding: { padding: spacing.md },
        lgPadding: { padding: spacing.lg },
    });
}
