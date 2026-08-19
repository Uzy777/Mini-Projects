import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Lightbulb } from "lucide-react-native";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

const FOCUS_TIPS = [
    "The secret of getting ahead is getting started.",
    "Make the next action small enough to begin now.",
    "A focused twenty-five minutes can change the shape of a day.",
    "Choose one thing, remove the noise, and begin.",
    "Progress grows when attention has somewhere clear to land.",
];

export function FocusTipCard() {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const tip = useMemo(() => {
        const today = new Date();
        const dayKey = Math.floor(new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / 86_400_000);
        return FOCUS_TIPS[dayKey % FOCUS_TIPS.length];
    }, []);

    return (
        <View style={styles.card}>
            <View style={styles.icon}>
                <Lightbulb size={19} color={colours.primary} />
            </View>
            <View style={styles.copy}>
                <Text style={styles.label}>FOCUS REMINDER</Text>
                <Text style={styles.tip}>{tip}</Text>
            </View>
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        card: {
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.lg,
            backgroundColor: colours.primarySubtle,
        },
        icon: {
            width: 42,
            height: 42,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
            backgroundColor: colours.primarySoft,
        },
        copy: {
            minWidth: 0,
            flex: 1,
        },
        label: {
            fontSize: 10,
            fontWeight: "900",
            letterSpacing: 0.7,
            color: colours.primaryStrong,
        },
        tip: {
            marginTop: 4,
            fontSize: 13,
            lineHeight: 19,
            color: colours.text,
        },
    });
}
