import type { ReactNode } from "react";
import { Modal, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { Easing, FadeInUp, useReducedMotion } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

export type CelebrationKind = "level" | "rank" | "badge";

type CelebrationShellProps = {
    kind: CelebrationKind;
    accessibilityLabel: string;
    accentColor: string;
    children: ReactNode;
    onRequestClose: () => void;
};

export function CelebrationShell({ kind, accessibilityLabel, accentColor, children, onRequestClose }: CelebrationShellProps) {
    const { colours } = useAppearance();
    const { height, width } = useWindowDimensions();
    const reduceMotion = useReducedMotion();
    const compact = height < 700 || width < 390;
    const styles = createStyles(colours);
    const backdropStyle = kind === "level" ? styles.levelBackdrop : kind === "rank" ? styles.rankBackdrop : styles.badgeBackdrop;

    return (
        <Modal transparent animationType="none" statusBarTranslucent onRequestClose={onRequestClose}>
            <SafeAreaView style={[styles.safeArea, backdropStyle]}>
                <View style={[styles.positioner, compact && styles.positionerCompact]}>
                    <Animated.View
                        accessibilityViewIsModal
                        entering={
                            reduceMotion
                                ? undefined
                                : FadeInUp.duration(kind === "rank" ? 360 : 320).easing(Easing.out(Easing.cubic))
                        }
                        style={[
                            styles.card,
                            compact && styles.cardCompact,
                            { borderColor: kind === "badge" ? accentColor : colours.primaryBorder },
                        ]}
                    >
                        <View
                            accessible
                            accessibilityRole="alert"
                            accessibilityLabel={accessibilityLabel}
                            accessibilityLiveRegion="polite"
                            style={styles.announcement}
                        />
                        <View
                            accessible={false}
                            accessibilityElementsHidden
                            importantForAccessibility="no-hide-descendants"
                            style={[styles.accentLine, { backgroundColor: accentColor }]}
                        />
                        <ScrollView
                            bounces={false}
                            showsVerticalScrollIndicator={false}
                            style={styles.scroll}
                            contentContainerStyle={[styles.content, compact && styles.contentCompact]}
                        >
                            {children}
                        </ScrollView>
                    </Animated.View>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        safeArea: {
            flex: 1,
        },
        levelBackdrop: {
            backgroundColor: "rgba(7, 10, 18, 0.48)",
        },
        rankBackdrop: {
            backgroundColor: "rgba(5, 7, 16, 0.78)",
        },
        badgeBackdrop: {
            backgroundColor: "rgba(7, 9, 16, 0.6)",
        },
        positioner: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: spacing.lg,
        },
        positionerCompact: {
            padding: spacing.sm,
        },
        card: {
            width: "100%",
            maxWidth: 438,
            maxHeight: "100%",
            overflow: "hidden",
            borderWidth: 1.5,
            borderRadius: radius.xl,
            backgroundColor: colours.surface,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 16 },
            shadowOpacity: 0.22,
            shadowRadius: 30,
            elevation: 12,
        },
        cardCompact: {
            borderRadius: radius.lg,
        },
        accentLine: {
            width: "100%",
            height: 4,
            opacity: 1,
        },
        announcement: {
            width: 1,
            height: 1,
            position: "absolute",
            top: 0,
            left: 0,
            opacity: 0.01,
        },
        scroll: {
            width: "100%",
        },
        content: {
            alignItems: "center",
            padding: spacing.xl,
        },
        contentCompact: {
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
        },
    });
}
