import { Pressable, StyleSheet, Text, View } from "react-native";

import { colours, radius, spacing } from "@/constants/design";

type ActiveSessionNoticeProps = {
    message: string;
    showReturnButton: boolean;
    onReturn: () => void;
};

export function ActiveSessionNotice({ message, showReturnButton, onReturn }: ActiveSessionNoticeProps) {
    if (!message && !showReturnButton) {
        return null;
    }

    return (
        <View style={styles.notice}>
            <Text style={styles.label}>SESSION NOTICE</Text>

            {message && <Text style={styles.message}>{message}</Text>}

            {showReturnButton && (
                <Pressable style={({ pressed }) => [styles.returnButton, pressed && styles.returnButtonPressed]} onPress={onReturn}>
                    <Text style={styles.returnButtonText}>Return to active session</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    notice: {
        width: "100%",
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colours.warningBorder,
        borderRadius: radius.md,
        backgroundColor: colours.warningSoft,
    },

    label: {
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 0.7,
        color: colours.warning,
    },

    message: {
        marginTop: spacing.xs,
        fontSize: 14,
        lineHeight: 20,
        color: colours.text,
    },

    returnButton: {
        marginTop: spacing.md,
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colours.warning,
    },

    returnButtonPressed: {
        opacity: 0.82,
    },

    returnButtonText: {
        fontSize: 14,
        fontWeight: "700",
        color: colours.surface,
    },
});
