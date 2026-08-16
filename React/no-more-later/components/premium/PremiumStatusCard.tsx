import { useMemo } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";

import { Check, Crown } from "lucide-react-native";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { usePremium } from "@/contexts/PremiumContext";
import { useRouter } from "expo-router";

export function PremiumStatusCard() {
    const router = useRouter();

    const { colours } = useAppearance();
    const { hasPremium } = usePremium();

    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={() => router.push("/premium")}>
            <View style={styles.headerRow}>
                <View style={styles.iconContainer}>
                    <Crown size={20} color={colours.primary} />
                </View>

                <View style={styles.details}>
                    <Text style={styles.title}>{hasPremium ? "No More Later Premium" : "Free plan"}</Text>

                    <Text style={styles.description}>
                        {hasPremium ? "Premium is active on your account." : "You're currently using No More Later for free."}
                    </Text>
                </View>

                <View style={[styles.statusBadge, hasPremium && styles.premiumStatusBadge]}>
                    {hasPremium && <Check size={12} strokeWidth={3} color={colours.primary} />}

                    <Text style={[styles.statusText, hasPremium && styles.premiumStatusText]}>{hasPremium ? "Premium" : "Free"}</Text>
                </View>
            </View>
        </Pressable>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        card: {
            padding: spacing.md,

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,

            backgroundColor: colours.surface,
        },

        headerRow: {
            flexDirection: "row",
            alignItems: "center",

            gap: spacing.md,
        },

        iconContainer: {
            width: 42,
            height: 42,

            alignItems: "center",
            justifyContent: "center",

            borderRadius: radius.md,

            backgroundColor: colours.primarySoft,
        },

        details: {
            flex: 1,

            gap: spacing.xs,
        },

        title: {
            fontSize: 15,
            fontWeight: "700",

            color: colours.text,
        },

        description: {
            fontSize: 12,
            lineHeight: 17,

            color: colours.textMuted,
        },

        statusBadge: {
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.pill,

            backgroundColor: colours.background,
        },

        premiumStatusBadge: {
            flexDirection: "row",
            alignItems: "center",

            gap: spacing.xs,

            borderColor: colours.primaryBorder,
            backgroundColor: colours.primarySoft,
        },

        statusText: {
            fontSize: 10,
            fontWeight: "700",

            color: colours.textMuted,
        },

        premiumStatusText: {
            color: colours.primary,
        },
        cardPressed: {
            opacity: 0.75,
        },
    });
}
