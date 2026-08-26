import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, useWindowDimensions, View, Platform } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { BellRing, ChevronRight, LogOut, Palette, ShieldCheck, Trash2, UserRoundPen } from "lucide-react-native";

import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";
import { DeleteAccountModal } from "@/components/account/DeleteAccountModal";
import { DevelopmentPremiumControls } from "@/components/premium/DevelopmentPremiumControls";
import { PremiumStatusCard } from "@/components/premium/PremiumStatusCard";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import type { AppColours } from "@/constants/appearanceColours";
import { getScreenGutter, radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { useAuth } from "@/contexts/AuthContext";
import { deleteAccount, signOut } from "@/services/auth/authService";
import { clearFocusNotifications } from "@/services/notifications/focusNotificationService";
import { updateLeaderboardAnonymity } from "@/services/profile/profileService";
import { clearNoMoreLaterStorage } from "@/services/storage/resetAppStorage";

export default function AccountScreen() {
    const { session, profile, refreshProfile } = useAuth();
    const { colours } = useAppearance();
    const { width } = useWindowDimensions();
    const styles = useMemo(() => createStyles(colours, width < 520, getScreenGutter(width)), [colours, width]);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
    const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);
    const [privacyError, setPrivacyError] = useState<string | null>(null);
    const [isPublicLeaderboardHidden, setIsPublicLeaderboardHidden] = useState(false);

    useEffect(() => {
        setIsPublicLeaderboardHidden(profile?.leaderboard_anonymous ?? false);
    }, [profile?.leaderboard_anonymous]);

    async function handleSignOut() {
        const { error } = await signOut();

        if (error) {
            console.error("Failed to sign out:", error);
        }
    }

    async function handleLeaderboardPrivacyChange(value: boolean) {
        if (!session || isUpdatingPrivacy) return;

        setIsUpdatingPrivacy(true);
        setPrivacyError(null);
        setIsPublicLeaderboardHidden(value);

        const { error } = await updateLeaderboardAnonymity(session.user.id, value);

        if (error) {
            console.error("Failed to update leaderboard privacy:", error);
            setPrivacyError("Your leaderboard privacy setting could not be saved. Try again.");
            setIsPublicLeaderboardHidden(!value);
            setIsUpdatingPrivacy(false);
            return;
        }

        await refreshProfile();
        setIsUpdatingPrivacy(false);
    }

    function openDeleteAccountModal() {
        setDeleteAccountError(null);
        setIsDeleteModalVisible(true);
    }

    function closeDeleteAccountModal() {
        if (isDeletingAccount) {
            return;
        }

        setDeleteAccountError(null);
        setIsDeleteModalVisible(false);
    }

    async function handleDeleteAccount() {
        if (isDeletingAccount) {
            return;
        }

        setIsDeletingAccount(true);
        setDeleteAccountError(null);

        const { error } = await deleteAccount();

        if (error) {
            console.error("Failed to delete account:", error);
            setDeleteAccountError("We couldn't delete your account. Check your connection and try again.");
            setIsDeletingAccount(false);
            return;
        }

        const cleanupResults = await Promise.allSettled([clearFocusNotifications(), clearNoMoreLaterStorage()]);

        cleanupResults.forEach((result) => {
            if (result.status === "rejected") {
                console.warn("Account was deleted, but local cleanup did not fully complete:", result.reason);
            }
        });

        const { error: signOutError } = await signOut();

        if (signOutError) {
            console.warn("Account was deleted, but the local session did not clear cleanly:", signOutError);
        }

        router.replace("/sign-in");
    }

    return (
        <AppScreenBackground>
            <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <Stack.Screen options={{ title: "Account" }} />

                <ScreenHeader eyebrow="ACCOUNT" title="Your account" subtitle="Manage your profile and app preferences." />

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>PLAN</Text>

                    <PremiumStatusCard />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>SETTINGS</Text>

                    <View style={styles.settingsCard}>
                        <AnimatedPressable style={styles.settingRow} onPress={() => router.push("/profile")}>
                            <View style={styles.settingIcon}>
                                <UserRoundPen size={19} color={colours.primary} />
                            </View>
                            <View style={styles.settingDetails}>
                                <Text style={styles.settingTitle}>Profile</Text>
                                <Text style={styles.settingDescription}>
                                    {profile
                                        ? profile.display_name_change_used
                                            ? "Display name locked"
                                            : "One display name change available"
                                        : "Update your account details"}
                                </Text>
                            </View>
                            <ChevronRight size={18} color={colours.textMuted} />
                        </AnimatedPressable>

                        <View style={styles.rowDivider} />

                        <AnimatedPressable style={styles.settingRow} onPress={() => router.push("/appearance")}>
                            <View style={styles.settingIcon}>
                                <Palette size={19} color={colours.primary} />
                            </View>

                            <View style={styles.settingDetails}>
                                <Text style={styles.settingTitle}>Appearance</Text>
                                <Text style={styles.settingDescription}>Theme and colour preferences</Text>
                            </View>

                            <ChevronRight size={18} color={colours.textMuted} />
                        </AnimatedPressable>

                        {Platform.OS !== "web" ? (
                            <>
                                <View style={styles.rowDivider} />

                                <AnimatedPressable style={styles.settingRow} onPress={() => router.push("/notifications" as Href)}>
                                    <View style={styles.settingIcon}>
                                        <BellRing size={19} color={colours.primary} />
                                    </View>

                                    <View style={styles.settingDetails}>
                                        <Text style={styles.settingTitle}>Notifications</Text>
                                        <Text style={styles.settingDescription}>Focus completion alerts</Text>
                                    </View>

                                    <ChevronRight size={18} color={colours.textMuted} />
                                </AnimatedPressable>
                            </>
                        ) : null}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>LEADERBOARD PRIVACY</Text>

                    <View style={styles.privacyCard}>
                        <View style={styles.privacyIcon}>
                            <ShieldCheck size={20} color={colours.primaryStrong} />
                        </View>
                        <View style={styles.privacyDetails}>
                            <Text style={styles.settingTitle}>Hide from public leaderboard</Text>
                            <Text style={styles.settingDescription}>
                                Removes you entirely from Everyone rankings. Your accepted buddies will still see your real name and stats in Buddies.
                            </Text>
                            {privacyError ? <Text style={styles.privacyError}>{privacyError}</Text> : null}
                        </View>
                        <View style={styles.privacyControl}>
                            {Platform.OS === "web" ? (
                                <AnimatedPressable
                                    accessibilityRole="switch"
                                    accessibilityState={{
                                        checked: isPublicLeaderboardHidden,
                                        disabled: !profile || isUpdatingPrivacy,
                                    }}
                                    accessibilityLabel="Hide from the public leaderboard"
                                    disabled={!profile || isUpdatingPrivacy}
                                    onPress={() => void handleLeaderboardPrivacyChange(!isPublicLeaderboardHidden)}
                                    style={[styles.webSwitch, isPublicLeaderboardHidden && styles.webSwitchActive]}
                                >
                                    <View style={[styles.webSwitchThumb, isPublicLeaderboardHidden && styles.webSwitchThumbActive]} />
                                </AnimatedPressable>
                            ) : (
                                <Switch
                                    accessibilityLabel="Hide from the public leaderboard"
                                    disabled={!profile || isUpdatingPrivacy}
                                    value={isPublicLeaderboardHidden}
                                    onValueChange={(value) => void handleLeaderboardPrivacyChange(value)}
                                    trackColor={{
                                        false: colours.border,
                                        true: colours.primaryMuted,
                                    }}
                                    thumbColor={isPublicLeaderboardHidden ? colours.primary : colours.surface}
                                />
                            )}
                        </View>
                    </View>
                </View>

                <DevelopmentPremiumControls />

                <AnimatedPressable style={styles.signOutButton} onPress={handleSignOut}>
                    <LogOut size={18} color={colours.danger} />

                    <Text style={styles.signOutText}>Sign out</Text>
                </AnimatedPressable>

                <View style={[styles.section, styles.dangerSection]}>
                    <Text style={[styles.sectionLabel, styles.dangerSectionLabel]}>DANGER ZONE</Text>

                    <View style={styles.dangerCard}>
                        <View style={styles.dangerHeader}>
                            <View style={styles.dangerIcon}>
                                <Trash2 size={20} color={colours.danger} />
                            </View>

                            <View style={styles.dangerDetails}>
                                <Text style={styles.dangerTitle}>Delete account</Text>
                                <Text style={styles.dangerDescription}>Permanently remove your account and all associated data.</Text>
                            </View>
                        </View>

                        <AnimatedPressable
                            accessibilityRole="button"
                            accessibilityLabel="Delete account"
                            haptic="selection"
                            onPress={openDeleteAccountModal}
                            style={styles.deleteButton}
                        >
                            <Trash2 size={17} color={colours.onDanger} />
                            <Text style={styles.deleteButtonText}>Delete account</Text>
                        </AnimatedPressable>
                    </View>
                </View>

                <DeleteAccountModal
                    visible={isDeleteModalVisible}
                    accountEmail={session?.user.email}
                    isDeleting={isDeletingAccount}
                    errorMessage={deleteAccountError}
                    onClose={closeDeleteAccountModal}
                    onConfirm={() => void handleDeleteAccount()}
                />
            </ScrollView>
        </AppScreenBackground>
    );
}

function createStyles(colours: AppColours, compact: boolean, gutter: number) {
    return StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: "transparent",
        },

        contentContainer: {
            width: "100%",
            maxWidth: 640,
            alignSelf: "center",
            paddingHorizontal: gutter,
            paddingTop: spacing.lg,
            paddingBottom: 48,
        },

        section: {
            marginTop: spacing.xl,
        },

        sectionLabel: {
            marginBottom: spacing.sm,
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 0.8,
            color: colours.textMuted,
        },

        settingsCard: {
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
            overflow: "hidden",
        },

        settingRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            padding: spacing.md,
        },

        settingIcon: {
            width: 38,
            height: 38,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.md,
            backgroundColor: colours.primarySoft,
        },

        settingDetails: {
            flex: 1,
        },

        settingTitle: {
            fontSize: 15,
            fontWeight: "700",
            color: colours.text,
        },

        settingDescription: {
            marginTop: 2,
            fontSize: 12,
            color: colours.textMuted,
        },

        rowDivider: {
            height: 1,
            marginLeft: 70,
            backgroundColor: colours.border,
        },

        privacyCard: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: spacing.md,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },

        privacyIcon: {
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.md,
            backgroundColor: colours.primarySoft,
        },

        privacyDetails: {
            minWidth: 0,
            flex: 1,
        },
        privacyControl: {
            flexShrink: 0,
            alignItems: "flex-end",
            paddingTop: compact ? 2 : 0,
        },

        privacyError: {
            marginTop: spacing.sm,
            fontSize: 11,
            lineHeight: 16,
            color: colours.danger,
        },

        signOutButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,

            marginTop: spacing.xl,
            paddingVertical: 14,

            borderWidth: 1,
            borderColor: colours.danger,
            borderRadius: radius.md,

            backgroundColor: colours.surface,
        },

        signOutButtonPressed: {
            backgroundColor: colours.dangerSoft,
        },

        signOutText: {
            fontSize: 15,
            fontWeight: "700",
            color: colours.danger,
        },

        dangerSection: {
            marginTop: spacing.xxl,
        },

        dangerSectionLabel: {
            color: colours.danger,
        },

        dangerCard: {
            gap: spacing.lg,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colours.danger,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },

        dangerHeader: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: spacing.md,
        },

        dangerIcon: {
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.md,
            backgroundColor: colours.dangerSoft,
        },

        dangerDetails: {
            flex: 1,
        },

        dangerTitle: {
            fontSize: 16,
            fontWeight: "800",
            color: colours.text,
        },

        dangerDescription: {
            marginTop: spacing.xs,
            fontSize: 13,
            lineHeight: 19,
            color: colours.textMuted,
        },

        deleteButton: {
            minHeight: 44,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: radius.md,
            backgroundColor: colours.danger,
        },

        deleteButtonText: {
            fontSize: 14,
            fontWeight: "800",
            color: colours.onDanger,
        },
        webSwitch: {
            width: 44,
            height: 24,
            justifyContent: "center",
            paddingHorizontal: 2,
            borderRadius: radius.pill,
            backgroundColor: colours.border,
        },

        webSwitchActive: {
            backgroundColor: colours.primaryMuted,
        },

        webSwitchThumb: {
            width: 20,
            height: 20,
            borderRadius: radius.pill,
            backgroundColor: colours.surface,
        },

        webSwitchThumbActive: {
            alignSelf: "flex-end",
            backgroundColor: colours.primary,
        },
    });
}
