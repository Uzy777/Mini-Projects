import { useMemo, useState } from "react";
import {
    Platform,
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
import { AppButton } from "@/components/ui/AppButton";

export default function PremiumScreen() {
    const { colours } = useAppearance();

    const {
        hasPremium,
        isRevenueCatConfigured,
        isLifetimePurchaseAvailable,
        lifetimePrice,
        isPurchasing,
        isRestoring,
        purchasePremium,
        restorePremium,
    } = usePremium();
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    const styles = useMemo(
        () => createStyles(colours),
        [colours],
    );

    async function handleUnlockPremium() {
        setActionMessage(null);

        const result = await purchasePremium();

        if (!result.success && !result.cancelled) {
            setActionMessage(result.errorMessage);
        }
    }

    async function handleRestorePremium() {
        setActionMessage(null);

        const result = await restorePremium();

        if (!result.success) {
            setActionMessage(result.errorMessage);
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
                <View style={styles.purchaseCard}>
                    <View style={styles.purchaseHeader}>
                        <View style={styles.purchaseDetails}>
                            <View style={styles.purchaseTitleRow}>
                                <Text style={styles.purchaseTitle}>Lifetime access</Text>
                                {PREMIUM_TEST_CONTROLS_ENABLED ? (
                                    <View style={styles.testBadge}>
                                        <Text style={styles.testBadgeText}>TEST STORE</Text>
                                    </View>
                                ) : null}
                            </View>
                            <Text style={styles.purchaseDescription}>One payment. No subscription.</Text>
                        </View>

                        <Text style={styles.purchasePrice}>{lifetimePrice ?? "£4.99"}</Text>
                    </View>

                    <AppButton
                        label={`Unlock Premium · ${lifetimePrice ?? "£4.99"}`}
                        icon={<Crown size={18} color={colours.onPrimary} />}
                        fullWidth
                        size="lg"
                        loading={isPurchasing}
                        disabled={!isRevenueCatConfigured || !isLifetimePurchaseAvailable || isRestoring}
                        onPress={() => void handleUnlockPremium()}
                    />

                    {!isRevenueCatConfigured ? (
                        <Text style={styles.setupMessage}>
                            Add the RevenueCat Test Store SDK key to this development build to enable test purchases.
                        </Text>
                    ) : !isLifetimePurchaseAvailable ? (
                        <Text style={styles.setupMessage}>
                            No lifetime package was found in the current RevenueCat offering.
                        </Text>
                    ) : null}

                    {actionMessage ? (
                        <Text accessibilityRole="alert" style={styles.errorMessage}>
                            {actionMessage}
                        </Text>
                    ) : null}

                    {Platform.OS !== "web" && isRevenueCatConfigured ? (
                        <Pressable
                            accessibilityRole="button"
                            disabled={isPurchasing || isRestoring}
                            onPress={() => void handleRestorePremium()}
                            style={({ pressed }) => [styles.restoreButton, pressed && styles.restoreButtonPressed]}
                        >
                            <Text style={styles.restoreButtonText}>{isRestoring ? "Restoring…" : "Restore purchase"}</Text>
                        </Pressable>
                    ) : null}
                </View>
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

        purchaseCard: {
            gap: spacing.md,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },

        purchaseHeader: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
        },

        purchaseDetails: {
            flex: 1,
            gap: spacing.xs,
        },

        purchaseTitleRow: {
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            gap: spacing.sm,
        },

        purchaseTitle: {
            fontSize: 17,
            fontWeight: "800",
            color: colours.text,
        },

        purchaseDescription: {
            fontSize: 13,
            color: colours.textMuted,
        },

        purchasePrice: {
            fontSize: 22,
            fontWeight: "900",
            color: colours.primary,
        },

        testBadge: {
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: radius.pill,
            backgroundColor: colours.primarySoft,
        },

        testBadgeText: {
            fontSize: 9,
            fontWeight: "900",
            letterSpacing: 0.6,
            color: colours.primary,
        },

        setupMessage: {
            fontSize: 12,
            lineHeight: 18,
            textAlign: "center",
            color: colours.textMuted,
        },

        errorMessage: {
            padding: spacing.sm,
            borderRadius: radius.sm,
            fontSize: 12,
            lineHeight: 18,
            textAlign: "center",
            color: colours.danger,
            backgroundColor: colours.dangerSoft,
        },

        restoreButton: {
            alignSelf: "center",
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: radius.md,
        },

        restoreButtonPressed: {
            backgroundColor: colours.primarySoft,
        },

        restoreButtonText: {
            fontSize: 13,
            fontWeight: "700",
            color: colours.primary,
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
