import { useMemo } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";
import type { AppColours } from "@/constants/appearanceColours";
import { spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

export default function WorkScreen() {
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <AppScreenBackground>
            <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.brand}>NO MORE LATER</Text>

                <Text style={styles.title}>Journeys & Quests</Text>

                <Text style={styles.subtitle}>Everything you want to get done.</Text>
            </ScrollView>
        </AppScreenBackground>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: "transparent",
        },

        content: {
            width: "100%",
            maxWidth: 1180,
            alignSelf: "center",

            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xl,
            paddingBottom: 100,
        },

        brand: {
            fontSize: 12,
            fontWeight: "900",
            letterSpacing: 1,

            color: colours.primary,
        },

        title: {
            marginTop: spacing.xs,

            fontSize: 32,
            lineHeight: 40,
            fontWeight: "900",

            color: colours.text,
        },

        subtitle: {
            marginTop: spacing.xs,

            fontSize: 15,
            lineHeight: 22,

            color: colours.textMuted,
        },
    });
}
