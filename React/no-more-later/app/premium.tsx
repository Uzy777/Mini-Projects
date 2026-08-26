import { useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Stack } from "expo-router";
import { Check, Crown, Image as ImageIcon, Infinity as InfinityIcon, MoonStar, Palette, ShieldCheck, Sparkles, Timer } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import Animated, { FadeInDown, FadeInUp, useReducedMotion } from "react-native-reanimated";

import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";
import { PremiumFeatureShowcase } from "@/components/premium/PremiumFeatureShowcase";
import { AppButton } from "@/components/ui/AppButton";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import type { AppColours } from "@/constants/appearanceColours";
import { getScreenGutter, radius, spacing } from "@/constants/design";
import { PREMIUM_TEST_CONTROLS_ENABLED } from "@/constants/premium";
import { useAppearance } from "@/contexts/AppearanceContext";
import { usePremium } from "@/contexts/PremiumContext";

const PREMIUM_FEATURES: { icon: LucideIcon; metric: string; title: string; description: string }[] = [
    { icon: ImageIcon, metric: "9", title: "Atmospheric backdrops", description: "Wheat, hills, forest, ocean, meadow, mountains, desert, sky and jungle." },
    { icon: Palette, metric: "5", title: "Additional accents", description: "Blue, emerald, amber, rose and violet palettes throughout the experience." },
    { icon: Timer, metric: "5", title: "Premium timer faces", description: "Minimal, Focus Pulse, Flip Clock, Blocks and Concentric on every shared timer." },
    { icon: MoonStar, metric: "3", title: "Adaptive colour modes", description: "System appearance, comfortable Dark mode and deep-black AMOLED mode." },
];

export default function PremiumScreen() {
    const { colours } = useAppearance();
    const { width } = useWindowDimensions();
    const reduceMotion = useReducedMotion();
    const isWide = width >= 820;
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    const {
        hasPremium,
        isRevenueCatConfigured,
        revenueCatUnavailableReason,
        isLifetimePurchaseAvailable,
        lifetimePrice,
        isPurchasing,
        isRestoring,
        purchasePremium,
        restorePremium,
    } = usePremium();

    const styles = useMemo(() => createStyles(colours, isWide, getScreenGutter(width)), [colours, isWide, width]);
    const displayPrice = lifetimePrice ?? "£4.99";

    async function handleUnlockPremium() {
        setActionMessage(null);
        const result = await purchasePremium();

        if (!result.success && !result.cancelled) setActionMessage(result.errorMessage);
    }

    async function handleRestorePremium() {
        setActionMessage(null);
        const result = await restorePremium();

        if (!result.success) setActionMessage(result.errorMessage);
    }

    const screenContent = (
        <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            <Stack.Screen options={{ title: "Premium" }} />

            <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(520)} style={styles.heroShell}>
                <View pointerEvents="none" style={styles.heroGlowOne} />
                <View pointerEvents="none" style={styles.heroGlowTwo} />

                <View style={styles.heroLayout}>
                    <View style={styles.heroCopy}>
                        <View style={styles.premiumPill}>
                            <Sparkles size={14} color={colours.primaryStrong} />
                            <Text style={styles.premiumPillText}>NO MORE LATER PREMIUM</Text>
                        </View>

                        <View style={styles.heroMark}><Crown size={30} strokeWidth={2.3} color={colours.onPrimary} /></View>
                        <Text style={styles.heroTitle}>Your focus space, elevated.</Text>
                        <Text style={styles.heroDescription}>
                            Turn No More Later into an environment you want to return to—with richer themes, calm scenery and timer faces that fit the way you focus.
                        </Text>

                        <View style={styles.valueChips}>
                            <ValueChip icon={InfinityIcon} label="Lifetime access" styles={styles} colours={colours} />
                            <ValueChip icon={ShieldCheck} label="No subscription" styles={styles} colours={colours} />
                        </View>
                    </View>

                    <View style={styles.offerColumn}>
                        {hasPremium ? (
                            <View style={styles.activeCard}>
                                <View style={styles.activeIcon}><Check size={23} strokeWidth={3} color={colours.onPrimary} /></View>
                                <View style={styles.activeDetails}>
                                    <Text style={styles.activeEyebrow}>LIFETIME ACCESS</Text>
                                    <Text style={styles.activeTitle}>Premium is yours</Text>
                                    <Text style={styles.activeDescription}>Every Premium appearance option is unlocked on your account.</Text>
                                </View>
                            </View>
                        ) : (
                            <PurchaseCard
                                displayPrice={displayPrice}
                                actionMessage={actionMessage}
                                isPurchasing={isPurchasing}
                                isRestoring={isRestoring}
                                isRevenueCatConfigured={isRevenueCatConfigured}
                                revenueCatUnavailableReason={revenueCatUnavailableReason}
                                isLifetimePurchaseAvailable={isLifetimePurchaseAvailable}
                                onPurchase={() => void handleUnlockPremium()}
                                onRestore={() => void handleRestorePremium()}
                                colours={colours}
                                styles={styles}
                            />
                        )}
                    </View>
                </View>
            </Animated.View>

            <Animated.View entering={reduceMotion ? undefined : FadeInUp.delay(120).duration(480)}>
                <PremiumFeatureShowcase />
            </Animated.View>

            <Animated.View entering={reduceMotion ? undefined : FadeInUp.delay(220).duration(480)} style={styles.includedSection}>
                <View style={styles.sectionHeading}>
                    <Text style={styles.sectionEyebrow}>EVERYTHING INCLUDED</Text>
                    <Text style={styles.sectionTitle}>One unlock. A completely richer app.</Text>
                    <Text style={styles.sectionDescription}>Every option is available from Appearance and flows through the shared No More Later experience.</Text>
                </View>

                <View style={styles.featureGrid}>
                    {PREMIUM_FEATURES.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <View key={feature.title} style={styles.featureCard}>
                                <View style={styles.featureTopRow}>
                                    <View style={styles.featureIcon}><Icon size={19} color={colours.primaryStrong} /></View>
                                    <Text style={styles.featureMetric}>{feature.metric}</Text>
                                </View>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDescription}>{feature.description}</Text>
                            </View>
                        );
                    })}
                </View>
            </Animated.View>

            {!hasPremium ? (
                <View style={styles.finalCta}>
                    <View style={styles.finalCtaCopy}>
                        <Text style={styles.finalCtaEyebrow}>MAKE IT YOURS</Text>
                        <Text style={styles.finalCtaTitle}>Premium for life.</Text>
                        <Text style={styles.finalCtaDescription}>One payment, with no recurring subscription.</Text>
                    </View>
                    <View style={styles.finalCtaPriceWrap}>
                        <Text style={styles.finalCtaPrice}>{displayPrice}</Text>
                        <Text style={styles.finalCtaPriceLabel}>one time</Text>
                    </View>
                    <View style={styles.finalCtaAction}>
                        <AppButton
                            label={`Unlock Premium · ${displayPrice}`}
                            icon={<Crown size={18} color={colours.onPrimary} />}
                            fullWidth
                            size="lg"
                            loading={isPurchasing}
                            disabled={!isRevenueCatConfigured || !isLifetimePurchaseAvailable || isRestoring}
                            onPress={() => void handleUnlockPremium()}
                        />
                        {actionMessage ? <Text accessibilityRole="alert" style={styles.finalCtaError}>{actionMessage}</Text> : null}
                    </View>
                </View>
            ) : null}
        </ScrollView>
    );

    return <AppScreenBackground>{screenContent}</AppScreenBackground>;
}

type PurchaseCardProps = {
    displayPrice: string;
    actionMessage: string | null;
    isPurchasing: boolean;
    isRestoring: boolean;
    isRevenueCatConfigured: boolean;
    revenueCatUnavailableReason: string | null;
    isLifetimePurchaseAvailable: boolean;
    onPurchase: () => void;
    onRestore: () => void;
    colours: AppColours;
    styles: ReturnType<typeof createStyles>;
};

function PurchaseCard({ displayPrice, actionMessage, isPurchasing, isRestoring, isRevenueCatConfigured, revenueCatUnavailableReason, isLifetimePurchaseAvailable, onPurchase, onRestore, colours, styles }: PurchaseCardProps) {
    return (
        <View style={styles.purchaseCard}>
            <View style={styles.purchaseTopRow}>
                <View style={styles.purchaseCopy}>
                    <View style={styles.purchaseTitleRow}>
                        <Text style={styles.purchaseEyebrow}>LIFETIME</Text>
                        {PREMIUM_TEST_CONTROLS_ENABLED ? <View style={styles.testBadge}><Text style={styles.testBadgeText}>TEST STORE</Text></View> : null}
                    </View>
                    <Text style={styles.purchaseTitle}>One payment. Yours forever.</Text>
                </View>
                <View style={styles.priceWrap}><Text style={styles.purchasePrice}>{displayPrice}</Text><Text style={styles.priceCaption}>one time</Text></View>
            </View>

            <View style={styles.purchaseBenefits}>
                <CompactBenefit text="Every Premium appearance option" styles={styles} colours={colours} />
                <CompactBenefit text="No recurring subscription" styles={styles} colours={colours} />
                <CompactBenefit text="Restore on your account" styles={styles} colours={colours} />
            </View>

            <AppButton label={`Unlock Premium · ${displayPrice}`} icon={<Crown size={18} color={colours.onPrimary} />} fullWidth size="lg" loading={isPurchasing} disabled={!isRevenueCatConfigured || !isLifetimePurchaseAvailable || isRestoring} onPress={onPurchase} />

            {!isRevenueCatConfigured ? (
                <Text style={styles.setupMessage}>{revenueCatUnavailableReason ?? "Add the RevenueCat Test Store SDK key to this development build to enable test purchases."}</Text>
            ) : !isLifetimePurchaseAvailable ? (
                <Text style={styles.setupMessage}>No lifetime package was found in the current RevenueCat offering.</Text>
            ) : PREMIUM_TEST_CONTROLS_ENABLED ? (
                <Text style={styles.purchaseFootnote}>Sandbox checkout · No real charge</Text>
            ) : (
                <Text style={styles.purchaseFootnote}>Purchase handled securely by your app store</Text>
            )}

            {actionMessage ? <Text accessibilityRole="alert" style={styles.errorMessage}>{actionMessage}</Text> : null}

            {Platform.OS !== "web" && isRevenueCatConfigured ? (
                <AnimatedPressable accessibilityRole="button" disabled={isPurchasing || isRestoring} onPress={onRestore} style={({ pressed }) => [styles.restoreButton, pressed && styles.restoreButtonPressed]}>
                    <Text style={styles.restoreButtonText}>{isRestoring ? "Restoring…" : "Restore purchase"}</Text>
                </AnimatedPressable>
            ) : null}
        </View>
    );
}

function CompactBenefit({ text, styles, colours }: { text: string; styles: ReturnType<typeof createStyles>; colours: AppColours }) {
    return <View style={styles.compactBenefit}><View style={styles.compactCheck}><Check size={11} strokeWidth={3} color={colours.primaryStrong} /></View><Text style={styles.compactBenefitText}>{text}</Text></View>;
}

function ValueChip({ icon: Icon, label, styles, colours }: { icon: LucideIcon; label: string; styles: ReturnType<typeof createStyles>; colours: AppColours }) {
    return <View style={styles.valueChip}><Icon size={14} color={colours.primaryStrong} /><Text style={styles.valueChipText}>{label}</Text></View>;
}

function createStyles(colours: AppColours, isWide: boolean, gutter: number) {
    return StyleSheet.create({
        screen: { flex: 1, backgroundColor: "transparent" },
        contentContainer: { width: "100%", maxWidth: 960, alignSelf: "center", gap: spacing.xxl, paddingHorizontal: gutter, paddingTop: spacing.lg, paddingBottom: spacing.xxxl },
        heroShell: { overflow: "hidden", padding: isWide ? spacing.xl : spacing.lg, borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.xl, backgroundColor: colours.surface },
        heroGlowOne: { position: "absolute", top: -110, right: -70, width: 280, height: 280, borderRadius: radius.pill, backgroundColor: colours.primarySoft, opacity: 0.9 },
        heroGlowTwo: { position: "absolute", bottom: -130, left: -90, width: 250, height: 250, borderRadius: radius.pill, backgroundColor: colours.primarySubtle },
        heroLayout: { flexDirection: isWide ? "row" : "column", alignItems: isWide ? "stretch" : "center", gap: isWide ? spacing.xl : spacing.lg },
        heroCopy: { minWidth: 0, flex: isWide ? 1.12 : undefined, alignItems: isWide ? "flex-start" : "center" },
        premiumPill: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 11, paddingVertical: 7, borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.pill, backgroundColor: colours.primarySoft },
        premiumPillText: { fontSize: 9, fontWeight: "900", letterSpacing: 1, color: colours.primaryStrong },
        heroMark: { width: 62, height: 62, alignItems: "center", justifyContent: "center", marginTop: spacing.lg, borderRadius: radius.lg, backgroundColor: colours.primary, transform: [{ rotate: "-4deg" }] },
        heroTitle: { maxWidth: 520, marginTop: spacing.lg, fontSize: isWide ? 42 : 34, lineHeight: isWide ? 47 : 39, fontWeight: "900", letterSpacing: -1.25, textAlign: isWide ? "left" : "center", color: colours.text },
        heroDescription: { maxWidth: 560, marginTop: spacing.md, fontSize: 15, lineHeight: 23, textAlign: isWide ? "left" : "center", color: colours.textMuted },
        valueChips: { flexDirection: "row", flexWrap: "wrap", justifyContent: isWide ? "flex-start" : "center", gap: spacing.sm, marginTop: spacing.lg },
        valueChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: colours.border, borderRadius: radius.pill, backgroundColor: colours.background },
        valueChipText: { fontSize: 11, fontWeight: "800", color: colours.text },
        offerColumn: { width: isWide ? 350 : "100%", justifyContent: "center" },
        purchaseCard: { gap: spacing.md, padding: spacing.lg, borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.xl, backgroundColor: colours.background },
        purchaseTopRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.md },
        purchaseCopy: { minWidth: 0, flex: 1 },
        purchaseTitleRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.sm },
        purchaseEyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.1, color: colours.primaryStrong },
        purchaseTitle: { maxWidth: 190, marginTop: 6, fontSize: 19, lineHeight: 24, fontWeight: "900", color: colours.text },
        testBadge: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colours.primarySoft },
        testBadgeText: { fontSize: 8, fontWeight: "900", letterSpacing: 0.5, color: colours.primaryStrong },
        priceWrap: { alignItems: "flex-end" },
        purchasePrice: { fontSize: 27, lineHeight: 31, fontWeight: "900", letterSpacing: -0.7, color: colours.primaryStrong },
        priceCaption: { fontSize: 10, fontWeight: "700", color: colours.textMuted },
        purchaseBenefits: { gap: spacing.sm, paddingVertical: spacing.xs },
        compactBenefit: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
        compactCheck: { width: 22, height: 22, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.primarySoft },
        compactBenefitText: { flex: 1, fontSize: 12, fontWeight: "700", color: colours.text },
        setupMessage: { fontSize: 11, lineHeight: 17, textAlign: "center", color: colours.textMuted },
        purchaseFootnote: { fontSize: 10, fontWeight: "700", textAlign: "center", color: colours.textMuted },
        errorMessage: { padding: spacing.sm, borderRadius: radius.sm, fontSize: 11, lineHeight: 17, textAlign: "center", color: colours.danger, backgroundColor: colours.dangerSoft },
        restoreButton: { alignSelf: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md },
        restoreButtonPressed: { backgroundColor: colours.primarySoft },
        restoreButtonText: { fontSize: 12, fontWeight: "800", color: colours.primaryStrong },
        activeCard: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg, borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.xl, backgroundColor: colours.primarySoft },
        activeIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.primary },
        activeDetails: { minWidth: 0, flex: 1, gap: 4 },
        activeEyebrow: { fontSize: 9, fontWeight: "900", letterSpacing: 1, color: colours.primaryStrong },
        activeTitle: { fontSize: 19, fontWeight: "900", color: colours.text },
        activeDescription: { fontSize: 12, lineHeight: 18, color: colours.textMuted },
        includedSection: { gap: spacing.lg },
        sectionHeading: { maxWidth: 650 },
        sectionEyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.1, color: colours.primaryStrong },
        sectionTitle: { marginTop: 5, fontSize: 25, lineHeight: 31, fontWeight: "900", letterSpacing: -0.55, color: colours.text },
        sectionDescription: { marginTop: spacing.sm, fontSize: 13, lineHeight: 20, color: colours.textMuted },
        featureGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
        featureCard: { width: isWide ? "48.8%" : "100%", minHeight: 170, gap: spacing.sm, padding: spacing.lg, borderWidth: 1, borderColor: colours.border, borderRadius: radius.lg, backgroundColor: colours.surface },
        featureTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
        featureIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: radius.md, backgroundColor: colours.primarySoft },
        featureMetric: { fontSize: 34, lineHeight: 38, fontWeight: "900", letterSpacing: -1, color: colours.primaryMuted },
        featureTitle: { marginTop: spacing.xs, fontSize: 16, fontWeight: "900", color: colours.text },
        featureDescription: { fontSize: 12, lineHeight: 19, color: colours.textMuted },
        finalCta: { flexDirection: isWide ? "row" : "column", alignItems: isWide ? "center" : "stretch", gap: spacing.lg, padding: spacing.lg, borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.xl, backgroundColor: colours.primarySoft },
        finalCtaCopy: { minWidth: 0, flex: 1 },
        finalCtaEyebrow: { fontSize: 9, fontWeight: "900", letterSpacing: 1, color: colours.primaryStrong },
        finalCtaTitle: { marginTop: 4, fontSize: 21, fontWeight: "900", color: colours.text },
        finalCtaDescription: { marginTop: 4, fontSize: 12, color: colours.textMuted },
        finalCtaPriceWrap: { alignItems: isWide ? "flex-end" : "flex-start" },
        finalCtaPrice: { fontSize: 25, fontWeight: "900", color: colours.primaryStrong },
        finalCtaPriceLabel: { fontSize: 10, fontWeight: "700", color: colours.textMuted },
        finalCtaAction: { width: isWide ? 270 : "100%", gap: spacing.sm },
        finalCtaError: { maxWidth: 270, fontSize: 10, lineHeight: 15, textAlign: "center", color: colours.danger },
    });
}
