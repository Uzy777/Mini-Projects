import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, router } from "expo-router";
import { ChevronRight, LogOut, Palette, UserRound, UserRoundPen } from "lucide-react-native";

import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/services/auth/authService";
import { useMemo } from "react";
import { DevelopmentPremiumControls } from "@/components/premium/DevelopmentPremiumControls";
import { PremiumStatusCard } from "@/components/premium/PremiumStatusCard";

export default function AccountScreen() {
    const { session, profile } = useAuth();

    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    async function handleSignOut() {
        const { error } = await signOut();

        if (error) {
            console.error("Failed to sign out:", error);
        }
    }

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            <Stack.Screen options={{ title: "Account" }} />

            <View style={styles.header}>
                <Text style={styles.label}>ACCOUNT</Text>
                <Text style={styles.title}>Your account</Text>
                <Text style={styles.description}>Manage your profile and app preferences.</Text>
            </View>

            <View style={styles.profileCard}>
                <View style={styles.profileIcon}>
                    <UserRound size={24} color={colours.primary} />
                </View>

                <View style={styles.profileDetails}>
                    <Text style={styles.profileName}>{profile?.display_name ?? "No display name"}</Text>

                    <Text style={styles.profileEmail}>{session?.user.email ?? ""}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionLabel}>PLAN</Text>

                <PremiumStatusCard />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionLabel}>SETTINGS</Text>

                <View style={styles.settingsCard}>
                    <Pressable style={styles.settingRow} onPress={() => router.push("/profile")}>
                        <View style={styles.settingIcon}>
                            <UserRoundPen size={19} color={colours.primary} />
                        </View>
                        <View style={styles.settingDetails}>
                            <Text style={styles.settingTitle}>Profile</Text>
                            <Text style={styles.settingDescription}>Update your account details</Text>
                        </View>
                        <ChevronRight size={18} color={colours.textMuted} />
                    </Pressable>

                    <View style={styles.rowDivider} />

                    <Pressable style={styles.settingRow} onPress={() => router.push("/appearance")}>
                        <View style={styles.settingIcon}>
                            <Palette size={19} color={colours.primary} />
                        </View>

                        <View style={styles.settingDetails}>
                            <Text style={styles.settingTitle}>Appearance</Text>
                            <Text style={styles.settingDescription}>Theme and colour preferences</Text>
                        </View>

                        <ChevronRight size={18} color={colours.textMuted} />
                    </Pressable>
                </View>
            </View>

            <DevelopmentPremiumControls />

            <Pressable style={({ pressed }) => [styles.signOutButton, pressed && styles.signOutButtonPressed]} onPress={handleSignOut}>
                <LogOut size={18} color={colours.danger} />

                <Text style={styles.signOutText}>Sign out</Text>
            </Pressable>
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

        profileCard: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,

            padding: spacing.lg,

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,

            backgroundColor: colours.surface,
        },

        profileIcon: {
            width: 48,
            height: 48,

            alignItems: "center",
            justifyContent: "center",

            borderRadius: radius.pill,
            backgroundColor: colours.primarySoft,
        },

        profileDetails: {
            flex: 1,
        },

        profileName: {
            fontSize: 17,
            fontWeight: "700",
            color: colours.text,
        },

        profileEmail: {
            marginTop: spacing.xs,
            fontSize: 13,
            color: colours.textMuted,
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
    });
}
