import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { LockKeyhole, Mail, UserRound } from "lucide-react-native";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";

import { AuthInput } from "@/components/auth/AuthInput";
import { AuthScreenShell } from "@/components/auth/AuthScreenShell";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import type { AppColours } from "@/constants/appearanceColours";
import { AUTH_COLOURS } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { signUpWithEmail } from "@/services/auth/authService";
import { getUsernameValidationMessage } from "@/utils/usernameValidation";

export default function SignUpScreen() {
    const colours = AUTH_COLOURS;
    const styles = createStyles(colours);

    const router = useRouter();
    const reduceMotion = useReducedMotion();

    const { email: initialEmail } = useLocalSearchParams<{
        email?: string;
    }>();

    const [email, setEmail] = useState(initialEmail ?? "");

    const [password, setPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");

    const [displayName, setDisplayName] = useState("");

    const [validationMessage, setValidationMessage] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSignUp() {
        if (isSubmitting) {
            return;
        }

        const trimmedEmail = email.trim().toLowerCase();

        const trimmedDisplayName = displayName.trim();

        const usernameValidationMessage = getUsernameValidationMessage(trimmedDisplayName);

        if (usernameValidationMessage) {
            setValidationMessage(usernameValidationMessage);

            return;
        }

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
        setIsSubmitting(true);

        try {
            const { data, error } = await signUpWithEmail(trimmedEmail, password, trimmedDisplayName);

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
        <AuthScreenShell
            colours={colours}
            eyebrow="GET STARTED"
            title="Create your account"
            description="Save your Focus Sessions, build your rank and keep your progress with you."
        >
            <View style={styles.fields}>
                <AuthInput
                    label="DISPLAY NAME"
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="How should we call you?"
                    colours={colours}
                    icon={UserRound}
                    required
                    autoCapitalize="words"
                    autoCorrect={false}
                    maxLength={40}
                />

                <AuthInput
                    label="EMAIL"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    colours={colours}
                    icon={Mail}
                    required
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <AuthInput
                    label="PASSWORD"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="At least 8 characters"
                    colours={colours}
                    icon={LockKeyhole}
                    required
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <AuthInput
                    label="CONFIRM PASSWORD"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Enter it again"
                    colours={colours}
                    icon={LockKeyhole}
                    required
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </View>

            {validationMessage ? (
                <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(220)} style={styles.errorBox}>
                    <Text style={styles.errorText}>{validationMessage}</Text>
                </Animated.View>
            ) : null}

            <AnimatedPressable
                accessibilityRole="button"
                disabled={isSubmitting}
                haptic="light"
                onPress={handleSignUp}
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            >
                <Text style={styles.submitButtonText}>{isSubmitting ? "Creating account..." : "Create account"}</Text>
            </AnimatedPressable>

            <View style={styles.authLinkRow}>
                <Text style={styles.authLinkText}>Already have an account?</Text>

                <Link href="/sign-in" asChild>
                    <AnimatedPressable haptic="none">
                        <Text style={styles.authLink}>Sign in</Text>
                    </AnimatedPressable>
                </Link>
            </View>
        </AuthScreenShell>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        fields: {
            gap: spacing.md,
        },

        errorBox: {
            padding: spacing.md,

            borderRadius: radius.md,

            backgroundColor: colours.dangerSoft,
        },

        errorText: {
            fontSize: 13,
            lineHeight: 19,

            color: colours.danger,
        },

        submitButton: {
            minHeight: 50,

            alignItems: "center",
            justifyContent: "center",

            borderRadius: radius.md,

            backgroundColor: colours.primary,
        },

        submitButtonDisabled: {
            opacity: 0.55,
        },

        submitButtonText: {
            fontSize: 15,
            fontWeight: "800",

            color: colours.onPrimary,
        },

        authLinkRow: {
            flexDirection: "row",
            flexWrap: "wrap",

            alignItems: "center",
            justifyContent: "center",

            gap: spacing.xs,
        },

        authLinkText: {
            fontSize: 13,

            color: colours.textMuted,
        },

        authLink: {
            fontSize: 13,
            fontWeight: "800",

            color: colours.primaryStrong,
        },
    });
}
