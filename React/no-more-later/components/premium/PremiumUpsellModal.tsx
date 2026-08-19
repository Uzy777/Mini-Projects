import { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Check, Crown, X } from "lucide-react-native";

import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";

type PremiumUpsellModalProps = {
    visible: boolean;
    requestedFeature: string | null;
    onClose: () => void;
    onUnlock: () => void;
};

export function PremiumUpsellModal({ visible, requestedFeature, onClose, onUnlock }: PremiumUpsellModalProps) {
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Pressable style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]} onPress={onClose}>
                        <X size={18} color={colours.textMuted} />
                    </Pressable>

                    <View style={styles.iconContainer}>
                        <Crown size={28} color={colours.primary} />
                    </View>

                    <Text style={styles.title}>{requestedFeature ? `Unlock ${requestedFeature}` : "Unlock Premium"}</Text>

                    <Text style={styles.description}>
                        {requestedFeature
                            ? `${requestedFeature} is part of No More Later Premium.`
                            : "Personalise No More Later with additional Premium features."}
                    </Text>
                    <View style={styles.features}>
                        <FeatureRow text="System appearance" colours={colours} styles={styles} />

                        <FeatureRow text="Dark mode" colours={colours} styles={styles} />

                        <FeatureRow text="AMOLED deep black" colours={colours} styles={styles} />

                        <FeatureRow text="All accent colours" colours={colours} styles={styles} />
                    </View>

                    <Pressable style={({ pressed }) => [styles.unlockButton, pressed && styles.unlockButtonPressed]} onPress={onUnlock}>
                        <Text style={styles.unlockButtonText}>Unlock Premium</Text>
                    </Pressable>

                    <Pressable style={({ pressed }) => [styles.notNowButton, pressed && styles.notNowButtonPressed]} onPress={onClose}>
                        <Text style={styles.notNowText}>Maybe later</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

type FeatureRowProps = {
    text: string;
    colours: AppColours;
    styles: ReturnType<typeof createStyles>;
};

function FeatureRow({ text, colours, styles }: FeatureRowProps) {
    return (
        <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
                <Check size={14} strokeWidth={3} color={colours.primary} />
            </View>

            <Text style={styles.featureText}>{text}</Text>
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        overlay: {
            flex: 1,

            alignItems: "center",
            justifyContent: "center",

            padding: spacing.lg,

            backgroundColor: "rgba(0, 0, 0, 0.5)",
        },

        card: {
            width: "100%",
            maxWidth: 420,

            padding: spacing.lg,

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,

            backgroundColor: colours.surface,
        },

        closeButton: {
            position: "absolute",
            top: spacing.md,
            right: spacing.md,

            width: 36,
            height: 36,

            alignItems: "center",
            justifyContent: "center",

            borderRadius: radius.pill,
        },

        closeButtonPressed: {
            backgroundColor: colours.background,
        },

        iconContainer: {
            width: 56,
            height: 56,

            alignItems: "center",
            justifyContent: "center",

            alignSelf: "center",

            borderRadius: radius.pill,

            backgroundColor: colours.primarySoft,
        },

        title: {
            marginTop: spacing.md,

            fontSize: 24,
            fontWeight: "800",
            textAlign: "center",

            color: colours.text,
        },

        description: {
            marginTop: spacing.sm,

            fontSize: 14,
            lineHeight: 21,
            textAlign: "center",

            color: colours.textMuted,
        },

        features: {
            gap: spacing.md,

            marginTop: spacing.xl,
            marginBottom: spacing.xl,
        },

        featureRow: {
            flexDirection: "row",
            alignItems: "center",

            gap: spacing.sm,
        },

        featureIcon: {
            width: 28,
            height: 28,

            alignItems: "center",
            justifyContent: "center",

            borderRadius: radius.pill,

            backgroundColor: colours.primarySoft,
        },

        featureText: {
            flex: 1,

            fontSize: 14,
            fontWeight: "600",

            color: colours.text,
        },

        unlockButton: {
            minHeight: 48,

            alignItems: "center",
            justifyContent: "center",

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

        notNowButton: {
            minHeight: 44,

            alignItems: "center",
            justifyContent: "center",

            marginTop: spacing.sm,
        },

        notNowButtonPressed: {
            opacity: 0.6,
        },

        notNowText: {
            fontSize: 14,
            fontWeight: "600",

            color: colours.textMuted,
        },
    });
}
