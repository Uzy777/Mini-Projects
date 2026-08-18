import { useMemo } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { ChevronRight, FolderPlus, ListPlus, Zap } from "lucide-react-native";

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
            <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={onNewQuest}>
                <View style={styles.iconContainer}>
                    <ListPlus size={24} color={colours.primary} />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>New Quest</Text>

                    <Text style={styles.description}>Add something to work on</Text>
                </View>

                <ChevronRight size={20} color={colours.textMuted} />
            </Pressable>

            <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={onNewJourney}>
                <View style={styles.iconContainer}>
                    <FolderPlus size={24} color={colours.primary} />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>New Journey</Text>

                    <Text style={styles.description}>Group related Quests together</Text>
                </View>

                <ChevronRight size={20} color={colours.textMuted} />
            </Pressable>

            <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={onQuickStart}>
                <View style={styles.iconContainer}>
                    <Zap size={24} color={colours.primary} />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>Quick Start</Text>

                    <Text style={styles.description}>Jump straight into a Focus Session</Text>
                </View>

                <ChevronRight size={20} color={colours.textMuted} />
            </Pressable>
        </View>
    );
}

function createStyles(colours: AppColours, isMobile: boolean) {
    return StyleSheet.create({
        container: {
            flexDirection: isMobile ? "column" : "row",
            gap: spacing.md,

            marginTop: spacing.xl,
        },

        card: {
            flex: 1,
            minHeight: isMobile ? 88 : 108,

            flexDirection: "row",
            alignItems: "center",

            gap: spacing.md,
            padding: spacing.lg,

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,

            backgroundColor: colours.surface,
        },

        cardPressed: {
            opacity: 0.7,
        },

        iconContainer: {
            width: 50,
            height: 50,

            alignItems: "center",
            justifyContent: "center",

            borderRadius: radius.md,

            backgroundColor: colours.primarySoft,
        },

        textContainer: {
            flex: 1,
            gap: 4,
        },

        title: {
            fontSize: 16,
            fontWeight: "800",

            color: colours.text,
        },

        description: {
            fontSize: 13,
            lineHeight: 18,

            color: colours.textMuted,
        },
    });
}
