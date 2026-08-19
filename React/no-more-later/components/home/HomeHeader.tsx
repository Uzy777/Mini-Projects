import { StyleSheet, Text, View } from "react-native";

import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import { Flame, Menu } from "lucide-react-native";
import { useMemo } from "react";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";

type HomeHeaderProps = {
    currentStreak: number;
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

export function HomeHeader({ currentStreak, displayName, onPressMenu }: HomeHeaderProps) {
    const streakLabel = currentStreak === 1 ? "day streak" : "days streak";

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
                    <View style={styles.streakBadge}>
                        <Flame size={17} color={colours.primaryStrong} />
                        <View>
                            <Text style={styles.streakValue}>{currentStreak}</Text>
                            <Text style={styles.streakLabel}>{streakLabel}</Text>
                        </View>
                    </View>
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
        streakBadge: {
            minHeight: 42,
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
            paddingHorizontal: 11,
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.md,
            backgroundColor: colours.primarySubtle,
        },
        streakValue: {
            fontSize: 13,
            lineHeight: 15,
            fontWeight: "900",
            color: colours.text,
        },
        streakLabel: {
            fontSize: 8,
            lineHeight: 10,
            color: colours.textMuted,
        },
    });
}
