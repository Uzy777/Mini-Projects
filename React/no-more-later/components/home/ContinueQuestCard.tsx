import { Pressable, StyleSheet, Text, View } from "react-native";

import { colours, radius, spacing } from "../../constants/design";

type ContinueQuestCardProps = {
    questTitle: string;
    nextAction: string;
    onContinue: () => void;
};

export function ContinueQuestCard({ questTitle, nextAction, onContinue }: ContinueQuestCardProps) {
    return (
        <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={onContinue}>
            <Text style={styles.label}>CONTINUE WHERE YOU LEFT OFF</Text>

            <Text style={styles.title}>{questTitle}</Text>

            {nextAction.trim() && (
                <View style={styles.nextActionContainer}>
                    <Text style={styles.nextActionLabel}>Next action</Text>

                    <Text style={styles.nextActionText}>{nextAction}</Text>
                </View>
            )}

            <View style={styles.actionRow}>
                <Text style={styles.actionText}>Continue Quest</Text>

                <Text style={styles.arrow}>→</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "100%",
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colours.border,
        borderRadius: radius.lg,
        backgroundColor: colours.surface,
    },

    cardPressed: {
        opacity: 0.75,
    },

    label: {
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 0.7,
        color: colours.textMuted,
    },

    title: {
        marginTop: spacing.sm,
        fontSize: 20,
        lineHeight: 26,
        fontWeight: "700",
        color: colours.text,
    },

    nextActionContainer: {
        marginTop: spacing.md,
        padding: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colours.background,
    },

    nextActionLabel: {
        marginBottom: spacing.xs,
        fontSize: 12,
        fontWeight: "700",
        color: colours.textMuted,
    },

    nextActionText: {
        fontSize: 15,
        lineHeight: 21,
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
