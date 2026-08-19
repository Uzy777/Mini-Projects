import { StyleSheet, Text, View } from "react-native";

import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import { Menu } from "lucide-react-native";
import { useMemo } from "react";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";

type HomeHeaderProps = {
    displayName: string | null;
    onPressMenu: () => void;
};

function getGreeting(): string {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
        return "Good morning,";
    }

    if (currentHour < 18) {
        return "Good afternoon,";
    }

    return "Good evening,";
}

export function HomeHeader({ displayName, onPressMenu }: HomeHeaderProps) {
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <View style={styles.header}>
            <View style={styles.topRow}>
                <View style={styles.headingContainer}>
                    <Text style={styles.appName}>NO MORE LATER</Text>

                    <Text style={styles.title}>{displayName ? `${getGreeting()} ${displayName} 👋` : `${getGreeting()} 👋`}</Text>
                </View>

                <View style={styles.actions}>
                    <AnimatedPressable style={styles.menuButton} onPress={onPressMenu} accessibilityLabel="Open account menu">
                        <Menu size={20} color={colours.primaryStrong} />
                    </AnimatedPressable>
                </View>
            </View>

            <Text style={styles.subtitle}>{'Turn "later" into today.'}</Text>
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        header: {
            width: "100%",
            marginBottom: spacing.xl,
            marginTop: spacing.xl,
        },

        topRow: {
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: spacing.md,
        },

        headingContainer: {
            flex: 1,
        },

        appName: {
            marginBottom: spacing.xs,
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 1,
            color: colours.primary,
        },

        title: {
            fontSize: 28,
            lineHeight: 34,
            fontWeight: "900",
            letterSpacing: -0.5,
            color: colours.text,
        },

        subtitle: {
            marginTop: spacing.sm,
            fontSize: 15,
            lineHeight: 22,
            color: colours.textMuted,
        },

        menuButton: {
            width: 42,
            height: 42,

            alignItems: "center",
            justifyContent: "center",

            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.md,

            backgroundColor: colours.primarySubtle,
        },
        actions: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
        },
    });
}
