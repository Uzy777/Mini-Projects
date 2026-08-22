import { useEffect, useState, useMemo } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Stack } from "expo-router";
import { AlertTriangle, LockKeyhole } from "lucide-react-native";

import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import { useAuth } from "@/contexts/AuthContext";
import { updateDisplayName } from "@/services/profile/profileService";
import { AppButton } from "@/components/ui/AppButton";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { getUsernameValidationMessage } from "@/utils/usernameValidation";

export default function ProfileScreen() {
    const { session, profile, refreshProfile } = useAuth();
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const hasUsedDisplayNameChange = profile?.display_name_change_used ?? false;
    const currentDisplayName = profile?.display_name?.trim() ?? "";
    const hasDisplayNameChanged = displayName.trim() !== currentDisplayName;

    useEffect(() => {
        setDisplayName(profile?.display_name ?? "");
    }, [profile?.display_name]);

    async function handleSave() {
        const trimmedDisplayName = displayName.trim();

        if (!session) {
            return;
        }

        if (hasUsedDisplayNameChange) {
            setErrorMessage("You have already used your one display name change.");
            setSuccessMessage(null);

            return;
        }

        const usernameValidationMessage = getUsernameValidationMessage(trimmedDisplayName);

        if (usernameValidationMessage) {
            setErrorMessage(usernameValidationMessage);
            setSuccessMessage(null);

            return;
        }

        setIsSaving(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        const { error } = await updateDisplayName(session.user.id, trimmedDisplayName);

        if (error) {
            console.error("Failed to update display name:", error);

            setErrorMessage(
                error.message.includes("already been used")
                    ? "You have already used your one display name change."
                    : "Unable to update your display name.",
            );
            setIsSaving(false);

            return;
        }

        await refreshProfile();

        setDisplayName(trimmedDisplayName);
        setSuccessMessage("Display name updated. Your name is now locked.");
        setIsSaving(false);
    }

    const screenContent = (
        <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            <Stack.Screen options={{ title: "Profile" }} />

            <ScreenHeader eyebrow="PROFILE" title="Profile details" subtitle="Manage the information shown on your account." />

            <View style={styles.formCard}>
                {profile ? (
                    <View style={[styles.nameChangeNotice, hasUsedDisplayNameChange && styles.nameChangeNoticeLocked]}>
                        <View style={styles.nameChangeNoticeIcon}>
                            {hasUsedDisplayNameChange ? (
                                <LockKeyhole size={18} color={colours.textMuted} />
                            ) : (
                                <AlertTriangle size={18} color={colours.warning} />
                            )}
                        </View>

                        <View style={styles.nameChangeNoticeContent}>
                            <Text style={styles.nameChangeNoticeTitle}>
                                {hasUsedDisplayNameChange ? "Display name locked" : "One name change available"}
                            </Text>
                            <Text style={styles.nameChangeNoticeText}>
                                {hasUsedDisplayNameChange
                                    ? "You have used your one name change. Your display name can no longer be edited."
                                    : "Your name appears on leaderboards. Choose carefully—after saving a different name, it cannot be changed again."}
                            </Text>
                        </View>
                    </View>
                ) : null}

                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>DISPLAY NAME</Text>

                    <TextInput
                        style={[styles.input, hasUsedDisplayNameChange && styles.inputLocked]}
                        value={displayName}
                        onChangeText={setDisplayName}
                        placeholder="Your display name"
                        placeholderTextColor={colours.textMuted}
                        autoCapitalize="words"
                        maxLength={40}
                        editable={!hasUsedDisplayNameChange}
                        accessibilityLabel="Display name"
                        accessibilityState={{ disabled: hasUsedDisplayNameChange }}
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

                <AppButton
                    label={hasUsedDisplayNameChange ? "Name change used" : "Save display name"}
                    onPress={handleSave}
                    disabled={!profile || hasUsedDisplayNameChange || !hasDisplayNameChanged}
                    loading={isSaving}
                    fullWidth
                    size="lg"
                />
            </View>
        </ScrollView>
    );

    return <AppScreenBackground>{screenContent}</AppScreenBackground>;
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: "transparent",
        },

        contentContainer: {
            width: "100%",
            maxWidth: 640,
            alignSelf: "center",
            padding: spacing.lg,
            paddingBottom: 48,
        },

        formCard: {
            marginTop: spacing.xl,
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

        nameChangeNotice: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: spacing.md,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colours.warningBorder,
            borderRadius: radius.md,
            backgroundColor: colours.warningSoft,
        },

        nameChangeNoticeLocked: {
            borderColor: colours.border,
            backgroundColor: colours.background,
        },

        nameChangeNoticeIcon: {
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 16,
            backgroundColor: colours.surface,
        },

        nameChangeNoticeContent: {
            minWidth: 0,
            flex: 1,
            gap: 3,
        },

        nameChangeNoticeTitle: {
            fontSize: 14,
            fontWeight: "800",
            color: colours.text,
        },

        nameChangeNoticeText: {
            fontSize: 12,
            lineHeight: 18,
            color: colours.textMuted,
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

        inputLocked: {
            opacity: 0.7,
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
    });
}
