import { useMemo } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Stack } from "expo-router";

import {
    Check,
    Crown,
} from "lucide-react-native";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { PREMIUM_TEST_CONTROLS_ENABLED } from "@/constants/premium";
import { useAppearance } from "@/contexts/AppearanceContext";
import { usePremium } from "@/contexts/PremiumContext";

export default function PremiumScreen() {
    const { colours } = useAppearance();

    const {
        hasPremium,
        setDevelopmentPremium,
    } = usePremium();

    const styles = useMemo(
        () => createStyles(colours),
        [colours],
    );

    function handleUnlockPremium() {
        if (PREMIUM_TEST_CONTROLS_ENABLED) {
            setDevelopmentPremium(true);
        }
    }

    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            <Stack.Screen
                options={{
                    title: "Premium",
                }}
            />

            <View style={styles.hero}>
                <View style={styles.iconContainer}>
                    <Crown
                        size={32}
                        color={colours.primary}
                    />
                </View>

                <Text style={styles.label}>
                    NO MORE LATER PREMIUM
                </Text>

                <Text style={styles.title}>
                    Make No More Later yours.
                </Text>

                <Text style={styles.description}>
                    Unlock additional ways to personalise your experience.
                </Text>
            </View>

            <View style={styles.card}>
                <FeatureRow
                    title="System appearance"
                    description="Automatically follow your device theme."
                    colours={colours}
                    styles={styles}
                />

                <View style={styles.divider} />

                <FeatureRow
                    title="Dark mode"
                    description="A comfortable dark appearance for everyday use."
                    colours={colours}
                    styles={styles}
                />

                <View style={styles.divider} />

                <FeatureRow
                    title="AMOLED mode"
                    description="A deep black appearance designed for OLED displays."
                    colours={colours}
                    styles={styles}
                />

                <View style={styles.divider} />

                <FeatureRow
                    title="All accent colours"
                    description="Choose from every available app accent colour."
                    colours={colours}
                    styles={styles}
                />

                <View style={styles.divider} />

                <FeatureRow
                    title="Focus timer styles"
                    description="Choose from six timer faces across Focus and break sessions."
                    colours={colours}
                    styles={styles}
                />
            </View>

            {hasPremium ? (
                <View style={styles.activeCard}>
                    <Check
                        size={20}
                        strokeWidth={3}
                        color={colours.primary}
                    />

                    <View style={styles.activeDetails}>
                        <Text style={styles.activeTitle}>
                            Premium active
                        </Text>

                        <Text style={styles.activeDescription}>
                            You have access to all Premium appearance options.
                        </Text>
                    </View>
                </View>
            ) : (
                <Pressable
                    style={({ pressed }) => [
                        styles.unlockButton,
                        pressed && styles.unlockButtonPressed,
                    ]}
                    onPress={handleUnlockPremium}
                >
                    <Crown
                        size={18}
                        color={colours.onPrimary}
                    />

                    <Text style={styles.unlockButtonText}>
                        Unlock Premium
                    </Text>
                </Pressable>
            )}
        </ScrollView>
    );
}

type FeatureRowProps = {
    title: string;
    description: string;
    colours: AppColours;
    styles: ReturnType<typeof createStyles>;
};

function FeatureRow({
    title,
    description,
    colours,
    styles,
}: FeatureRowProps) {
    return (
        <View style={styles.featureRow}>
            <View style={styles.checkContainer}>
                <Check
                    size={14}
                    strokeWidth={3}
                    color={colours.primary}
                />
            </View>

            <View style={styles.featureDetails}>
                <Text style={styles.featureTitle}>
                    {title}
                </Text>

                <Text style={styles.featureDescription}>
                    {description}
                </Text>
            </View>
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: colours.background,
        },

        contentContainer: {
            width: "100%",
            maxWidth: 640,

            alignSelf: "center",

            gap: spacing.lg,

            padding: spacing.lg,
            paddingBottom: spacing.xl,
        },

        hero: {
            alignItems: "center",

            gap: spacing.sm,

            paddingVertical: spacing.lg,
        },

        iconContainer: {
            width: 64,
            height: 64,

            alignItems: "center",
            justifyContent: "center",

            marginBottom: spacing.sm,

            borderRadius: radius.pill,

            backgroundColor: colours.primarySoft,
        },

        label: {
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 1.2,

            color: colours.primary,
        },

        title: {
            fontSize: 26,
            fontWeight: "800",
            textAlign: "center",

            color: colours.text,
        },

        description: {
            maxWidth: 440,

            fontSize: 14,
            lineHeight: 21,
            textAlign: "center",

            color: colours.textMuted,
        },

        card: {
            overflow: "hidden",

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,

            backgroundColor: colours.surface,
        },

        featureRow: {
            flexDirection: "row",

            gap: spacing.md,

            padding: spacing.md,
        },

        checkContainer: {
            width: 30,
            height: 30,

            alignItems: "center",
            justifyContent: "center",

            borderRadius: radius.pill,

            backgroundColor: colours.primarySoft,
        },

        featureDetails: {
            flex: 1,

            gap: spacing.xs,
        },

        featureTitle: {
            fontSize: 14,
            fontWeight: "700",

            color: colours.text,
        },

        featureDescription: {
            fontSize: 12,
            lineHeight: 18,

            color: colours.textMuted,
        },

        divider: {
            height: 1,
            marginLeft: 62,

            backgroundColor: colours.border,
        },

        unlockButton: {
            minHeight: 50,

            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",

            gap: spacing.sm,

            borderRadius: radius.md,

            backgroundColor: colours.primary,
        },

        unlockButtonPressed: {
            backgroundColor: colours.primaryPressed,
        },

        unlockButtonText: {
            fontSize: 15,
            fontWeight: "700",

            color: colours.onPrimary,
        },

        activeCard: {
            flexDirection: "row",
            alignItems: "center",

            gap: spacing.md,

            padding: spacing.md,

            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.lg,

            backgroundColor: colours.primarySoft,
        },

        activeDetails: {
            flex: 1,

            gap: spacing.xs,
        },

        activeTitle: {
            fontSize: 14,
            fontWeight: "700",

            color: colours.primary,
        },

        activeDescription: {
            fontSize: 12,
            lineHeight: 18,

            color: colours.textMuted,
        },
    });
}
