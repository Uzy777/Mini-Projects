import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { radius, spacing } from "@/constants/design";
import { PREMIUM_TEST_CONTROLS_ENABLED } from "@/constants/premium";
import { useAppearance } from "@/contexts/AppearanceContext";
import { usePremium } from "@/contexts/PremiumContext";

import type { AppColours } from "@/constants/appearanceColours";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

export function DevelopmentPremiumControls() {
    const { colours } = useAppearance();

    const { hasDevelopmentPremiumOverride, setDevelopmentPremium } = usePremium();

    const styles = useMemo(() => createStyles(colours), [colours]);

    if (!PREMIUM_TEST_CONTROLS_ENABLED) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>TESTING</Text>

            <View style={styles.card}>
                <View style={styles.details}>
                    <Text style={styles.title}>Local Premium override</Text>

                    <Text style={styles.description}>
                        Force Premium UI access without changing RevenueCat purchases. Clear it to use RevenueCat normally.
                    </Text>
                </View>

                <SegmentedControl
                    value={hasDevelopmentPremiumOverride ? "forced" : "revenuecat"}
                    onChange={(value) => setDevelopmentPremium(value === "forced")}
                    options={[
                        { value: "revenuecat", label: "Use RevenueCat" },
                        { value: "forced", label: "Force Premium" },
                    ]}
                />
            </View>
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        container: {
            gap: spacing.sm,
            marginTop: spacing.xl,
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

    });
}
