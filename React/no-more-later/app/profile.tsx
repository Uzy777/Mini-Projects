import { useEffect, useState, useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Stack } from "expo-router";
import { UserRound } from "lucide-react-native";

import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import { useAuth } from "@/contexts/AuthContext";
import { updateDisplayName } from "@/services/profile/profileService";

export default function ProfileScreen() {
    const { session, profile, refreshProfile } = useAuth();
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        setDisplayName(profile?.display_name ?? "");
    }, [profile?.display_name]);

    async function handleSave() {
        const trimmedDisplayName = displayName.trim();

        if (!session) {
            return;
        }

        if (!trimmedDisplayName) {
            setErrorMessage("Display name is required.");
            setSuccessMessage(null);

            return;
        }

        setIsSaving(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        const { error } = await updateDisplayName(session.user.id, trimmedDisplayName);

        if (error) {
            console.error("Failed to update display name:", error);

            setErrorMessage("Unable to update your display name.");
            setIsSaving(false);

            return;
        }

        await refreshProfile();

        setDisplayName(trimmedDisplayName);
        setSuccessMessage("Profile updated.");
        setIsSaving(false);
    }

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            <Stack.Screen options={{ title: "Profile" }} />

            <View style={styles.header}>
                <Text style={styles.label}>PROFILE</Text>

                <Text style={styles.title}>Profile details</Text>

                <Text style={styles.description}>Manage the information shown on your account.</Text>
            </View>

            <View style={styles.formCard}>
                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>DISPLAY NAME</Text>

                    <TextInput
                        style={styles.input}
                        value={displayName}
                        onChangeText={setDisplayName}
                        placeholder="Your display name"
                        placeholderTextColor={colours.textMuted}
                        autoCapitalize="words"
                        maxLength={40}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>EMAIL</Text>

                    <View style={styles.readOnlyInput}>
                        <Text style={styles.readOnlyText}>{session?.user.email ?? ""}</Text>
                    </View>

                    <Text style={styles.helperText}>Email changes are not available yet.</Text>
                </View>

                {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

                {successMessage && <Text style={styles.successText}>{successMessage}</Text>}

                <Pressable
                    style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed, isSaving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? <ActivityIndicator color={colours.surface} /> : <Text style={styles.saveButtonText}>Save changes</Text>}
                </Pressable>
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
            maxWidth: 640,
            alignSelf: "center",
            padding: spacing.lg,
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

        formCard: {
            gap: spacing.lg,
            padding: spacing.lg,

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,

            backgroundColor: colours.surface,
        },

        field: {
            gap: spacing.sm,
        },

        fieldLabel: {
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 0.8,
            color: colours.textMuted,
        },

        input: {
            minHeight: 48,
            paddingHorizontal: spacing.md,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,
            fontSize: 15,
            color: colours.text,
            backgroundColor: colours.background,
        },

        readOnlyInput: {
            minHeight: 48,
            justifyContent: "center",

            paddingHorizontal: spacing.md,

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,

            backgroundColor: colours.background,
        },

        readOnlyText: {
            fontSize: 15,
            color: colours.textMuted,
        },

        helperText: {
            fontSize: 12,
            color: colours.textMuted,
        },

        errorText: {
            fontSize: 13,
            color: colours.danger,
        },

        successText: {
            fontSize: 13,
            color: colours.success,
        },

        saveButton: {
            minHeight: 48,

            alignItems: "center",
            justifyContent: "center",

            borderRadius: radius.md,
            backgroundColor: colours.primary,
        },

        saveButtonPressed: {
            backgroundColor: colours.primaryPressed,
        },

        saveButtonDisabled: {
            opacity: 0.6,
        },

        saveButtonText: {
            fontSize: 15,
            fontWeight: "700",
            color: colours.surface,
        },
    });
}
