import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type AddJourneyFormProps = {
    journeyTitle: string;
    onChangeJourneyTitle: (title: string) => void;
    onAddJourney: () => void;
};

export function AddJourneyForm({ journeyTitle, onChangeJourneyTitle, onAddJourney }: AddJourneyFormProps) {
    const titleIsEmpty = !journeyTitle.trim();

    return (
        <View style={styles.formCard}>
            <Text style={styles.formTitle}>Create a Journey</Text>

            <Text style={styles.formDescription}>Add a larger goal that you want to make steady progress towards.</Text>

            <TextInput
                style={styles.input}
                value={journeyTitle}
                onChangeText={onChangeJourneyTitle}
                placeholder="Enter a Journey"
                returnKeyType="done"
                onSubmitEditing={titleIsEmpty ? undefined : onAddJourney}
            />

            <Pressable style={[styles.addButton, titleIsEmpty && styles.disabledButton]} onPress={onAddJourney} disabled={titleIsEmpty}>
                <Text style={[styles.addButtonText, titleIsEmpty && styles.disabledButtonText]}>Add Journey</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    formCard: {
        width: "100%",
        marginTop: 24,
        padding: 18,
        borderRadius: 12,
        backgroundColor: "#ffffff",
    },
    formTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    formDescription: {
        marginTop: 6,
        fontSize: 14,
        lineHeight: 20,
        color: "#666666",
    },
    input: {
        width: "100%",
        marginTop: 16,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: "#cccccc",
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: "#ffffff",
    },
    addButton: {
        marginTop: 12,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#222222",
        alignItems: "center",
    },
    addButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#ffffff",
    },
    disabledButton: {
        backgroundColor: "#cccccc",
    },
    disabledButtonText: {
        color: "#777777",
    },
});
