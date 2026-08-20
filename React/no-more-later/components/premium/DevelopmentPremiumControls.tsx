import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius, spacing } from "@/constants/design";
import { PREMIUM_TEST_CONTROLS_ENABLED } from "@/constants/premium";
import { useAppearance } from "@/contexts/AppearanceContext";
import { usePremium } from "@/contexts/PremiumContext";

import type { AppColours } from "@/constants/appearanceColours";

export function DevelopmentPremiumControls() {
    const { colours } = useAppearance();

    const { hasPremium, setDevelopmentPremium } = usePremium();

    const styles = useMemo(() => createStyles(colours), [colours]);

    if (!PREMIUM_TEST_CONTROLS_ENABLED) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>TESTING</Text>

            <View style={styles.card}>
                <View style={styles.details}>
                    <Text style={styles.title}>Premium status</Text>

                    <Text style={styles.description}>Simulate Free and Premium access in this test build.</Text>
                </View>

                <View style={styles.buttons}>
                    <Pressable style={[styles.button, !hasPremium && styles.buttonSelected]} onPress={() => setDevelopmentPremium(false)}>
                        <Text style={[styles.buttonText, !hasPremium && styles.buttonTextSelected]}>Free</Text>
                    </Pressable>

                    <Pressable style={[styles.button, hasPremium && styles.buttonSelected]} onPress={() => setDevelopmentPremium(true)}>
                        <Text style={[styles.buttonText, hasPremium && styles.buttonTextSelected]}>Premium</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        container: {
            gap: spacing.sm,
        },

        label: {
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 1,

            color: colours.textMuted,
        },

        card: {
            gap: spacing.md,

            padding: spacing.md,

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,

            backgroundColor: colours.surface,
        },

        details: {
            gap: spacing.xs,
        },

        title: {
            fontSize: 15,
            fontWeight: "700",

            color: colours.text,
        },

        description: {
            fontSize: 12,
            lineHeight: 18,

            color: colours.textMuted,
        },

        buttons: {
            flexDirection: "row",
            gap: spacing.sm,
        },

        button: {
            flex: 1,

            minHeight: 40,

            alignItems: "center",
            justifyContent: "center",

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,

            backgroundColor: colours.background,
        },

        buttonSelected: {
            borderColor: colours.primary,
            backgroundColor: colours.primarySoft,
        },

        buttonText: {
            fontSize: 13,
            fontWeight: "700",

            color: colours.textMuted,
        },

        buttonTextSelected: {
            color: colours.primary,
        },
    });
}
