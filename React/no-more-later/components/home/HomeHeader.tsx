import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Sparkles } from "lucide-react-native";

import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import { useMemo } from "react";

type HomeHeaderProps = {
    displayName: string | null;
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

export function HomeHeader({ displayName }: HomeHeaderProps) {
    const { colours } = useAppearance();
    const { width } = useWindowDimensions();

    const styles = useMemo(() => createStyles(colours, width < 420), [colours, width]);

    return (
        <View style={styles.header}>
            <View style={styles.topRow}>
                <View style={styles.headingContainer}>
                    <View style={styles.brandRow}>
                        <View style={styles.brandMark}>
                            <Sparkles size={13} strokeWidth={2.4} color={colours.primaryStrong} />
                        </View>
                        <Text style={styles.appName}>NO MORE LATER</Text>
                    </View>

                    <Text style={styles.title}>{displayName ? `${getGreeting()} ${displayName} 👋` : `${getGreeting()} 👋`}</Text>
                </View>

                {/* The original Home account entry is intentionally hidden now that Account lives in the main navigation.
                    <AnimatedPressable style={styles.menuButton} onPress={onPressMenu} accessibilityLabel="Open account menu">
                        <Menu size={20} color={colours.primaryStrong} />
                    </AnimatedPressable>
                */}
            </View>

            <View style={styles.subtitleRow}>
                <View style={styles.subtitleLine} />
                <Text style={styles.subtitle}>{'Turn "later" into today.'}</Text>
            </View>
        </View>
    );
}

function createStyles(colours: AppColours, compact: boolean) {
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

        brandRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            marginBottom: spacing.sm,
        },

        brandMark: {
            width: 26,
            height: 26,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.sm,
            backgroundColor: colours.primarySoft,
        },

        appName: {
            fontSize: 11,
            fontWeight: "900",
            letterSpacing: 1.15,
            color: colours.primaryStrong,
        },

        title: {
            fontSize: compact ? 25 : 28,
            lineHeight: compact ? 31 : 34,
            fontWeight: "900",
            letterSpacing: -0.5,
            color: colours.text,
        },

        subtitleRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            marginTop: spacing.sm,
        },

        subtitleLine: {
            width: 24,
            height: 2,
            borderRadius: radius.pill,
            backgroundColor: colours.primary,
        },

        subtitle: {
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
    });
}
