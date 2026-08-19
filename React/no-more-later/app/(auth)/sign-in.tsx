import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter, Link } from "expo-router";

import { radius, spacing } from "@/constants/design";
// import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import { AUTH_COLOURS } from "@/constants/appearanceColours";
import { signInWithEmail } from "@/services/auth/authService";
// import { useMemo } from "react";

export default function SignInScreen() {
    const colours = AUTH_COLOURS;
    const styles = createStyles(colours);

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [validationMessage, setValidationMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSignIn() {
        if (isSubmitting) {
            return;
        }

        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedEmail) {
            setValidationMessage("Enter your email address.");
            return;
        }

        if (!password) {
            setValidationMessage("Enter your password.");
            return;
        }

        setValidationMessage("");
        setIsSubmitting(true);

        try {
            const { data, error } = await signInWithEmail(trimmedEmail, password);

            if (error) {
                setValidationMessage(error.message);
                return;
            }

            if (!data.session) {
                setValidationMessage("Could not start your login session.");
                return;
            }

            router.replace("/");
        } catch (error) {
            console.error("Sign in failed:", error);

            setValidationMessage("Could not sign in. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
                <Text style={styles.label}>NO MORE LATER</Text>

                <Text style={styles.title}>Welcome back</Text>

                <Text style={styles.description}>Sign in to continue your progress.</Text>
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
                        placeholder="Your password"
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
                    onPress={handleSignIn}
                    disabled={isSubmitting}
                >
                    <Text style={styles.submitButtonText}>{isSubmitting ? "Signing in..." : "Sign in"}</Text>
                </Pressable>

                <View style={styles.authLinkRow}>
                    <Text style={styles.authLinkText}>{"Don't have an account?"}</Text>
                    <Link
                        href={{
                            pathname: "/sign-up",
                            params: {
                                email: email.trim().toLowerCase(),
                            },
                        }}
                        asChild
                    >
                        <Pressable>
                            <Text style={styles.authLink}>Create one</Text>
                        </Pressable>
                    </Link>
                </View>
            </View>
        </ScrollView>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
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

        submitButtonDisabled: {
            opacity: 0.6,
        },

        submitButtonText: {
            fontSize: 15,
            fontWeight: "700",
            color: colours.onPrimary,
        },
        authLinkRow: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: spacing.xs,
        },

        authLinkText: {
            fontSize: 14,
            color: colours.textMuted,
        },

        authLink: {
            fontSize: 14,
            fontWeight: "700",
            color: colours.primary,
        },
    });
}
