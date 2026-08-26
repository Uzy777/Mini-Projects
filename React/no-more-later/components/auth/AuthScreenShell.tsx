import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Check, Timer } from "lucide-react-native";
import Animated, { FadeInDown, FadeInUp, useReducedMotion } from "react-native-reanimated";

import type { ReactNode } from "react";

import type { AppColours } from "@/constants/appearanceColours";
import { getScreenGutter, radius, spacing } from "@/constants/design";
import { KeyboardAwareScrollView } from "@/components/ui/KeyboardAwareLayout";

type AuthScreenShellProps = {
    colours: AppColours;

    eyebrow: string;
    title: string;
    description: string;

    children: ReactNode;
};

const BENEFITS = ["Focus with intention", "Track meaningful progress", "Build your Focus Rank"];

export function AuthScreenShell({ colours, eyebrow, title, description, children }: AuthScreenShellProps) {
    const { width } = useWindowDimensions();

    const isWide = width >= 820;
    const isNarrow = width < 480;
    const reduceMotion = useReducedMotion();

    const styles = createStyles(colours, isWide, isNarrow, getScreenGutter(width));

    return (
        <KeyboardAwareScrollView
            style={styles.screen}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.shell}>
                <View pointerEvents="none" style={styles.glowOne} />

                <View pointerEvents="none" style={styles.glowTwo} />

                <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(500)} style={styles.brandPanel}>
                    <View style={styles.brandRow}>
                        <View style={styles.brandMark}>
                            <Timer size={24} strokeWidth={2.4} color={colours.onPrimary} />
                        </View>

                        <Text style={styles.brandName}>NO MORE LATER</Text>
                    </View>

                    <View style={styles.brandCopy}>
                        <Text style={styles.brandTitle}>Turn “later” into today.</Text>

                        <Text style={styles.brandDescription}>A calmer way to focus, make progress and keep moving forward.</Text>
                    </View>

                    {isWide ? (
                        <View style={styles.benefits}>
                            {BENEFITS.map((benefit) => (
                                <View key={benefit} style={styles.benefit}>
                                    <View style={styles.benefitIcon}>
                                        <Check size={12} strokeWidth={3} color={colours.primaryStrong} />
                                    </View>

                                    <Text style={styles.benefitText}>{benefit}</Text>
                                </View>
                            ))}
                        </View>
                    ) : null}
                </Animated.View>

                <Animated.View entering={reduceMotion ? undefined : FadeInUp.delay(100).duration(480)} style={styles.formColumn}>
                    <View style={styles.formCard}>
                        <View style={styles.formHeader}>
                            <Text style={styles.eyebrow}>{eyebrow}</Text>

                            <Text style={styles.title}>{title}</Text>

                            <Text style={styles.description}>{description}</Text>
                        </View>

                        {children}
                    </View>
                </Animated.View>
            </View>
        </KeyboardAwareScrollView>
    );
}

function createStyles(colours: AppColours, isWide: boolean, isNarrow: boolean, gutter: number) {
    return StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: colours.background,
        },

        contentContainer: {
            flexGrow: 1,

            width: "100%",

            justifyContent: "center",

            paddingHorizontal: gutter,
            paddingVertical: spacing.xl,
        },

        shell: {
            width: "100%",
            maxWidth: 960,

            alignSelf: "center",

            flexDirection: isWide ? "row" : "column",

            overflow: "hidden",

            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.xl,

            backgroundColor: colours.surface,
        },

        glowOne: {
            position: "absolute",

            top: -160,
            left: -120,

            width: 360,
            height: 360,

            borderRadius: radius.pill,

            backgroundColor: colours.primarySoft,

            opacity: 0.9,
        },

        glowTwo: {
            position: "absolute",

            right: -130,
            bottom: -180,

            width: 320,
            height: 320,

            borderRadius: radius.pill,

            backgroundColor: colours.primarySubtle,
        },

        brandPanel: {
            flex: isWide ? 1 : undefined,

            minHeight: isWide ? 560 : undefined,

            justifyContent: "center",

            padding: isWide ? spacing.xxl : isNarrow ? spacing.md : spacing.lg,
        },

        brandRow: {
            flexDirection: "row",
            alignItems: "center",

            gap: spacing.sm,
        },

        brandMark: {
            width: 44,
            height: 44,

            alignItems: "center",
            justifyContent: "center",

            borderRadius: radius.md,

            backgroundColor: colours.primary,

            transform: [{ rotate: "-4deg" }],
        },

        brandName: {
            fontSize: 12,
            fontWeight: "900",
            letterSpacing: 1.1,

            color: colours.primaryStrong,
        },

        brandCopy: {
            maxWidth: 430,

            marginTop: isWide ? spacing.xl : spacing.lg,
        },

        brandTitle: {
            fontSize: isWide ? 40 : 28,
            lineHeight: isWide ? 46 : 34,

            fontWeight: "900",
            letterSpacing: -1,

            color: colours.text,
        },

        brandDescription: {
            maxWidth: 400,

            marginTop: spacing.md,

            fontSize: 15,
            lineHeight: 23,

            color: colours.textMuted,
        },

        benefits: {
            gap: spacing.md,

            marginTop: spacing.xl,
        },

        benefit: {
            flexDirection: "row",
            alignItems: "center",

            gap: spacing.sm,
        },

        benefitIcon: {
            width: 24,
            height: 24,

            alignItems: "center",
            justifyContent: "center",

            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.pill,

            backgroundColor: colours.primarySoft,
        },

        benefitText: {
            fontSize: 13,
            fontWeight: "700",

            color: colours.text,
        },

        formColumn: {
            width: isWide ? 420 : "100%",

            justifyContent: "center",

            padding: isWide ? spacing.xl : isNarrow ? spacing.sm : spacing.lg,

            backgroundColor: isWide ? colours.primarySubtle : "transparent",
        },

        formCard: {
            gap: spacing.lg,

            padding: isWide ? spacing.xl : isNarrow ? spacing.md : spacing.lg,

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.xl,

            backgroundColor: colours.surface,
        },

        formHeader: {
            gap: spacing.sm,
        },

        eyebrow: {
            fontSize: 10,
            fontWeight: "900",
            letterSpacing: 1,

            color: colours.primaryStrong,
        },

        title: {
            fontSize: 27,
            lineHeight: 33,

            fontWeight: "900",
            letterSpacing: -0.5,

            color: colours.text,
        },

        description: {
            fontSize: 14,
            lineHeight: 21,

            color: colours.textMuted,
        },
    });
}
