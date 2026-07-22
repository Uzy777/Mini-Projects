import { Pressable, StyleSheet, Text, View } from "react-native";

type ContinueQuestCardProps = {
    questTitle: string;
    nextAction: string;
    onContinue: () => void;
};

export function ContinueQuestCard({ questTitle, nextAction, onContinue }: ContinueQuestCardProps) {
    return (
        <View style={styles.continueCard}>
            <Text style={styles.continueLabel}>Continue where you left off</Text>

            <Text style={styles.continueTitle}>{questTitle}</Text>

            <Text style={styles.continueNextAction}>Next action: {nextAction}</Text>

            <Pressable style={styles.continueButton} onPress={onContinue}>
                <Text style={styles.continueButtonText}>Continue Quest</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    continueCard: {
        width: "100%",
        marginTop: 20,
        padding: 18,
        borderRadius: 12,
        backgroundColor: "#ffffff",
    },
    continueLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#666666",
    },
    continueTitle: {
        marginTop: 6,
        fontSize: 18,
        fontWeight: "700",
    },
    continueNextAction: {
        marginTop: 8,
        fontSize: 14,
        lineHeight: 20,
        color: "#555555",
    },
    continueButton: {
        marginTop: 16,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#222222",
        alignItems: "center",
    },
    continueButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#ffffff",
    },
});
