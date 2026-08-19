import { StyleSheet, Text, View } from "react-native";
import { useMemo } from "react";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";

type ReviewSessionSummaryProps = {
    questTitle: string;
    plannedMinutes: number;
    actualSeconds: number;
    endedEarly: boolean;
};

function formatFocusedTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);

    const seconds = totalSeconds % 60;

    if (minutes === 0) {
        return `${seconds} seconds`;
    }

    if (seconds === 0) {
        return `${minutes} minutes`;
    }

    return `${minutes} min ${seconds} sec`;
}

export function ReviewSessionSummary({ questTitle, plannedMinutes, actualSeconds, endedEarly }: ReviewSessionSummaryProps) {
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <View style={styles.summaryCard}>
            <Text style={styles.label}>Current Quest</Text>

            <Text style={styles.questTitle}>{questTitle}</Text>

            <View style={styles.durationRow}>
                <View style={styles.durationItem}>
                    <Text style={styles.durationLabel}>Focused</Text>

                    <Text style={styles.durationValue}>{formatFocusedTime(actualSeconds)}</Text>
                </View>

                <View style={styles.durationItem}>
                    <Text style={styles.durationLabel}>Planned</Text>

                    <Text style={styles.durationValue}>{plannedMinutes} min</Text>
                </View>
            </View>

            {endedEarly && <Text style={styles.endedEarlyText}>This Focus Session ended early.</Text>}
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        summaryCard: {
            width: "100%",
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },
        label: {
            fontSize: 13,
            fontWeight: "600",
            color: colours.textMuted,
        },
        questTitle: {
            marginTop: 6,
            fontSize: 24,
            fontWeight: "700",
            color: colours.text,
        },
        durationRow: {
            marginTop: 18,
            flexDirection: "row",
            gap: 12,
        },
        durationItem: {
            flex: 1,
            padding: 12,
            borderRadius: 8,
            backgroundColor: colours.primarySubtle,
        },
        durationLabel: {
            fontSize: 12,
            fontWeight: "600",
            color: colours.textMuted,
        },
        durationValue: {
            marginTop: 4,
            fontSize: 16,
            fontWeight: "700",
            color: colours.text,
        },
        endedEarlyText: {
            marginTop: 14,
            fontSize: 14,
            color: colours.danger,
        },
    });
}
