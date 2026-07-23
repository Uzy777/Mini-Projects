import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type AddQuestFormProps = {
    questTitle: string;
    onChangeQuestTitle: (title: string) => void;
    onAddQuest: () => void;
};

export function AddQuestForm({ questTitle, onChangeQuestTitle, onAddQuest }: AddQuestFormProps) {
    const titleIsEmpty = !questTitle.trim();

    return (
        <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add a Quest</Text>

            <Text style={styles.formDescription}>Break this Journey into a clear, achievable task.</Text>

            <TextInput
                style={styles.input}
                value={questTitle}
                onChangeText={onChangeQuestTitle}
                placeholder="Enter a Quest"
                returnKeyType="done"
                onSubmitEditing={titleIsEmpty ? undefined : onAddQuest}
            />

            <Pressable style={[styles.addButton, titleIsEmpty && styles.disabledButton]} onPress={onAddQuest} disabled={titleIsEmpty}>
                <Text style={[styles.addButtonText, titleIsEmpty && styles.disabledButtonText]}>Add Quest</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    formCard: {
        width: "100%",
        marginTop: 20,
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
