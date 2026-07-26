import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type ReviewFormProps = {
    accomplishment: string;
    nextAction: string;
    showNextAction: boolean;
    errorMessage: string;
    onChangeAccomplishment: (value: string) => void;
    onChangeNextAction: (value: string) => void;
    onSubmit: () => void;
};

export function ReviewForm({
    accomplishment,
    nextAction,
    showNextAction,
    errorMessage,
    onChangeAccomplishment,
    onChangeNextAction,
    onSubmit,
}: ReviewFormProps) {
    return (
        <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>What did you accomplish?</Text>

            <TextInput
                style={[styles.input, styles.multilineInput]}
                value={accomplishment}
                onChangeText={onChangeAccomplishment}
                placeholder="Describe what you completed or worked on"
                multiline
                textAlignVertical="top"
            />

            {showNextAction && (
                <>
                    <Text style={styles.inputLabel}>What is the next action?</Text>

                    <TextInput
                        style={[styles.input, styles.multilineInput]}
                        value={nextAction}
                        onChangeText={onChangeNextAction}
                        placeholder="Enter the next clear action"
                        multiline
                        textAlignVertical="top"
                    />
                </>
            )}

            {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}

            <Pressable style={styles.submitButton} onPress={onSubmit}>
                <Text style={styles.submitButtonText}>Complete Review</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    formContainer: {
        width: "100%",
    },
    inputLabel: {
        marginTop: 20,
        marginBottom: 8,
        fontSize: 14,
        fontWeight: "600",
        color: "#555555",
    },
    input: {
        width: "100%",
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: "#cccccc",
        borderRadius: 8,
        backgroundColor: "#ffffff",
        fontSize: 16,
    },
    multilineInput: {
        minHeight: 100,
    },
    errorMessage: {
        marginTop: 16,
        fontSize: 14,
        lineHeight: 20,
        color: "#b42318",
        textAlign: "center",
    },
    submitButton: {
        width: "100%",
        marginTop: 20,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: "#222222",
        alignItems: "center",
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
    },
});
