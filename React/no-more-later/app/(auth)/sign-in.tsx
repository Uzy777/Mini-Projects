import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { LockKeyhole, Mail } from "lucide-react-native";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";

import { AuthInput } from "@/components/auth/AuthInput";
import { AuthScreenShell } from "@/components/auth/AuthScreenShell";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import type { AppColours } from "@/constants/appearanceColours";
import { AUTH_COLOURS } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { signInWithEmail } from "@/services/auth/authService";

export default function SignInScreen() {
    const colours = AUTH_COLOURS;
    const styles = createStyles(colours);

    const router = useRouter();
    const reduceMotion = useReducedMotion();
    const { notice } = useLocalSearchParams<{ notice?: string }>();

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
        <AuthScreenShell colours={colours} eyebrow="WELCOME BACK" title="Ready to focus?" description="Sign in and pick up exactly where you left off.">
            <View style={styles.fields}>
                <AuthInput
                    label="EMAIL"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    colours={colours}
                    icon={Mail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <AuthInput
                    label="PASSWORD"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Your password"
                    colours={colours}
                    icon={LockKeyhole}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </View>

            {notice ? (
                <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(220)} style={styles.noticeBox}>
                    <Text style={styles.noticeText}>{notice}</Text>
                </Animated.View>
            ) : null}

            {validationMessage ? (
                <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(220)} style={styles.errorBox}>
                    <Text style={styles.errorText}>{validationMessage}</Text>
                </Animated.View>
            ) : null}

            <AnimatedPressable
                accessibilityRole="button"
                disabled={isSubmitting}
                haptic="light"
                pressedScale={0.975}
                onPress={handleSignIn}
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            >
                <Text style={styles.submitButtonText}>{isSubmitting ? "Signing in..." : "Sign in"}</Text>
            </AnimatedPressable>

            <View style={styles.authLinkRow}>
                <Text style={styles.authLinkText}>Don&apos;t have an account?</Text>

                <Link
                    href={{
                        pathname: "/sign-up",
                        params: {
                            email: email.trim().toLowerCase(),
                        },
                    }}
                    asChild
                >
                    <AnimatedPressable haptic="none" pressedScale={0.96}>
                        <Text style={styles.authLink}>Create one</Text>
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

        noticeBox: {
            padding: spacing.md,

            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.md,

            backgroundColor: colours.primarySoft,
        },

        noticeText: {
            fontSize: 13,
            lineHeight: 19,

            color: colours.primaryStrong,
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
