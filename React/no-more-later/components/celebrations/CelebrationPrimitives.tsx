import { useMemo, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

type CelebrationHeaderProps = {
    icon: ReactNode;
    eyebrow: string;
    title: string;
    accentColor: string;
    accentSoft: string;
    compact: boolean;
};

type CelebrationXpRowProps = {
    earnedXp: number;
    compact?: boolean;
};

type CelebrationContinueButtonProps = {
    label?: string;
    accessibilityLabel?: string;
    onContinue: () => void;
};

export function CelebrationHeader({ icon, eyebrow, title, accentColor, accentSoft, compact }: CelebrationHeaderProps) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <View style={styles.header}>
            <View style={[styles.headerMark, { borderColor: accentColor, backgroundColor: accentSoft }]}>
                {icon}
            </View>
            <Text style={[styles.eyebrow, { color: accentColor }]}>{eyebrow}</Text>
            <Text accessibilityRole="header" style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
        </View>
    );
}

export function CelebrationXpRow({ earnedXp, compact = false }: CelebrationXpRowProps) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <View accessible accessibilityLabel={`${earnedXp} XP earned`} style={[styles.xpRow, compact && styles.xpRowCompact]}>
            <View style={styles.xpRule} />
            <Text style={styles.xpText}>+{earnedXp} XP</Text>
            <View style={styles.xpRule} />
        </View>
    );
}

export function CelebrationContinueButton({ label = "Continue", accessibilityLabel, onContinue }: CelebrationContinueButtonProps) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? "Continue from celebration"}
            haptic="light"
            pressedScale={0.985}
            onPress={onContinue}
            style={({ pressed }) => [styles.continueButton, pressed && styles.continueButtonPressed]}
        >
            <Text style={styles.continueButtonText}>{label}</Text>
        </AnimatedPressable>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        header: {
            alignItems: "center",
        },
        headerMark: {
            width: 34,
            height: 34,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderRadius: radius.pill,
        },
        eyebrow: {
            marginTop: spacing.sm,
            fontSize: 9,
            fontWeight: "900",
            letterSpacing: 1.5,
        },
        title: {
            marginTop: 3,
            fontSize: 26,
            lineHeight: 32,
            fontWeight: "900",
            letterSpacing: -0.2,
            textAlign: "center",
            color: colours.text,
        },
        titleCompact: {
            fontSize: 22,
            lineHeight: 27,
        },
        xpRow: {
            width: "100%",
            marginTop: spacing.lg,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
        },
        xpRowCompact: {
            marginTop: spacing.md,
        },
        xpRule: {
            flex: 1,
            height: 1,
            backgroundColor: colours.primaryBorder,
        },
        xpText: {
            fontSize: 14,
            fontWeight: "900",
            color: colours.primaryStrong,
        },
        continueButton: {
            width: "100%",
            minHeight: 48,
            marginTop: spacing.md,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.md,
            backgroundColor: colours.primary,
        },
        continueButtonPressed: {
            backgroundColor: colours.primaryPressed,
        },
        continueButtonText: {
            fontSize: 14,
            fontWeight: "800",
            color: colours.onPrimary,
        },
    });
}
