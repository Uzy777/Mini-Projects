import { StyleSheet, Text, View } from "react-native";

import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { useMemo } from "react";

type ActiveSessionStatus = "In progress" | "Paused" | "Ready for review";

type ActiveFocusSessionCardProps = {
    questTitle: string;
    status: ActiveSessionStatus;
    onReturn: () => void;
};

export function ActiveFocusSessionCard({ questTitle, status, onReturn }: ActiveFocusSessionCardProps) {
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    const actionText = status === "Ready for review" ? "Review session" : "Return to session";

    return (
        <AnimatedPressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={onReturn}>
            <View style={styles.topRow}>
                <Text style={styles.label}>ACTIVE FOCUS SESSION</Text>

                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{status}</Text>
                </View>
            </View>

            <Text style={styles.title}>{questTitle}</Text>

            <View style={styles.actionRow}>
                <Text style={styles.actionText}>{actionText}</Text>

                <Text style={styles.arrow}>→</Text>
            </View>
        </AnimatedPressable>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        card: {
            width: "100%",
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.lg,
            backgroundColor: colours.primarySoft,
        },

        cardPressed: {
            opacity: 0.78,
        },

        topRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.sm,
            marginBottom: spacing.md,
        },

        label: {
            flexShrink: 1,
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 0.7,
            color: colours.primary,
        },

        statusBadge: {
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: radius.pill,
            backgroundColor: colours.surface,
        },

        statusText: {
            fontSize: 12,
            fontWeight: "600",
            color: colours.primary,
        },

        title: {
            fontSize: 21,
            lineHeight: 27,
            fontWeight: "700",
            color: colours.text,
        },

        actionRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: spacing.lg,
        },

        actionText: {
            fontSize: 15,
            fontWeight: "700",
            color: colours.primary,
        },

        arrow: {
            fontSize: 21,
            fontWeight: "700",
            color: colours.primary,
        },
    });
}
