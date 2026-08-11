import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable } from "react-native";
import { useRouter } from "expo-router";

import { colours, radius, spacing } from "@/constants/design";
import { signUpWithEmail } from "@/services/auth/authService";

export default function SignUpScreen() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [validationMessage, setValidationMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSignUp() {
        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedEmail) {
            setValidationMessage("Enter your email address.");

            return;
        }

        if (!password) {
            setValidationMessage("Enter a password.");

            return;
        }

        if (password.length < 8) {
            setValidationMessage("Password must be at least 8 characters.");

            return;
        }

        if (password !== confirmPassword) {
            setValidationMessage("Passwords do not match.");

            return;
        }

        setValidationMessage("");
        setIsSubmitting(false);

        try {
            const { data, error } = await signUpWithEmail(trimmedEmail, password);

            if (error) {
                setValidationMessage(error.message);
                return;
            }
            if (!data.session) {
                setValidationMessage("Your account was created, but no login session was started.");

                return;
            }

            router.replace("/");
        } catch (error) {
            console.error("Sign up failed:", error);

            setValidationMessage("Could not create your account. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
                <Text style={styles.label}>NO MORE LATER</Text>

                <Text style={styles.title}>Create your account</Text>

                <Text style={styles.description}>Keep your progress, Focus Sessions and stats connected to your account.</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>EMAIL</Text>

                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="you@example.com"
                        placeholderTextColor={colours.textMuted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>PASSWORD</Text>

                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Choose a password"
                        placeholderTextColor={colours.textMuted}
                        secureTextEntry
                    />
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>CONFIRM PASSWORD</Text>

                    <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Enter it again"
                        placeholderTextColor={colours.textMuted}
                        secureTextEntry
                    />
                </View>

                {validationMessage && (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{validationMessage}</Text>
                    </View>
                )}

                <Pressable
                    style={({ pressed }) => [
                        styles.submitButton,
                        isSubmitting && styles.submitButtonDisabled,
                        pressed && !isSubmitting && styles.submitButtonPressed,
                    ]}
                    onPress={handleSignUp}
                    disabled={isSubmitting}
                >
                    <Text style={styles.submitButtonText}>{isSubmitting ? "Creating account..." : "Create account"}</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colours.background,
    },

    contentContainer: {
        width: "100%",
        maxWidth: 520,
        alignSelf: "center",
        paddingHorizontal: spacing.lg,
        paddingTop: 64,
        paddingBottom: 48,
    },

    header: {
        marginBottom: spacing.xl,
    },

    label: {
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 0.8,
        color: colours.primary,
    },

    title: {
        marginTop: spacing.sm,
        fontSize: 30,
        lineHeight: 36,
        fontWeight: "800",
        color: colours.text,
    },

    description: {
        marginTop: spacing.sm,
        fontSize: 15,
        lineHeight: 22,
        color: colours.textMuted,
    },

    form: {
        padding: spacing.lg,
        gap: spacing.lg,
        borderWidth: 1,
        borderColor: colours.border,
        borderRadius: radius.lg,
        backgroundColor: colours.surface,
    },

    fieldGroup: {
        gap: spacing.sm,
    },

    fieldLabel: {
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 0.7,
        color: colours.text,
    },

    input: {
        width: "100%",
        paddingHorizontal: spacing.md,
        paddingVertical: 13,
        borderWidth: 1,
        borderColor: colours.border,
        borderRadius: radius.md,
        fontSize: 16,
        color: colours.text,
        backgroundColor: colours.background,
    },
    errorBox: {
        padding: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colours.dangerSoft,
    },

    errorText: {
        fontSize: 14,
        lineHeight: 20,
        color: colours.danger,
    },

    submitButton: {
        alignItems: "center",
        paddingVertical: 14,
        borderRadius: radius.md,
        backgroundColor: colours.primary,
    },

    submitButtonPressed: {
        backgroundColor: colours.primaryPressed,
    },

    submitButtonText: {
        fontSize: 15,
        fontWeight: "700",
        color: colours.surface,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
});
