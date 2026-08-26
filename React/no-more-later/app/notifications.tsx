import { useCallback, useEffect, useMemo, useState } from "react";
import { AppState, Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { BellRing, Check, ExternalLink, LockKeyhole, ShieldCheck } from "lucide-react-native";
import { Stack, type Href, useLocalSearchParams, useRouter } from "expo-router";

import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import type { AppColours } from "@/constants/appearanceColours";
import { getScreenGutter, radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import {
    getFocusNotificationPermissionState,
    openFocusNotificationSettings,
    reconcileFocusNotificationWithStoredSession,
    requestFocusNotificationPermission,
} from "@/services/notifications/focusNotificationService";
import type { FocusNotificationPermissionState } from "@/services/notifications/focusNotificationTypes";
import { setNotificationEducationCompleted } from "@/services/storage/notificationEducationStorage";

const BENEFITS = [
    "A completion alert when the app is in the background or your phone is locked",
    "The Focus Session or Task name when it is available",
    "A tap that brings you back toward the active session",
];

export default function NotificationsScreen() {
    const { colours } = useAppearance();
    const { width } = useWindowDimensions();
    const router = useRouter();
    const { education } = useLocalSearchParams<{ education?: string }>();
    const isEducationFlow = education === "true";
    const styles = useMemo(() => createStyles(colours, getScreenGutter(width)), [colours, width]);
    const [permissionState, setPermissionState] = useState<FocusNotificationPermissionState | null>(null);
    const [isWorking, setIsWorking] = useState(false);

    const refreshPermissionState = useCallback(async () => {
        const nextState = await getFocusNotificationPermissionState();
        setPermissionState(nextState);

        if (nextState === "authorized" || nextState === "provisional") {
            await reconcileFocusNotificationWithStoredSession();
        }
    }, []);

    useEffect(() => {
        void refreshPermissionState();

        const subscription = AppState.addEventListener("change", (nextState) => {
            if (nextState === "active") {
                void refreshPermissionState();
            }
        });

        return () => subscription.remove();
    }, [refreshPermissionState]);

    async function markEducationComplete() {
        try {
            await setNotificationEducationCompleted();
        } catch (error) {
            console.warn("Failed to save notification education status:", error);
        }
    }

    async function completeEducation() {
        await markEducationComplete();
        router.replace("/" as Href);
    }

    async function handleEnableNotifications() {
        if (isWorking) return;

        setIsWorking(true);
        try {
            const nextState = await requestFocusNotificationPermission();
            setPermissionState(nextState);
            await markEducationComplete();

            if (nextState === "authorized" || nextState === "provisional") {
                await reconcileFocusNotificationWithStoredSession();
            }

            if (isEducationFlow) {
                router.replace("/" as Href);
            }
        } finally {
            setIsWorking(false);
        }
    }

    async function handleOpenSettings() {
        if (isWorking) return;

        setIsWorking(true);
        try {
            await markEducationComplete();
            await openFocusNotificationSettings();
        } finally {
            setIsWorking(false);
        }
    }

    const copy = getPermissionCopy(permissionState);
    const shouldOpenSettings = permissionState === "denied" || permissionState === "settings-disabled";
    const canRequest = permissionState === "not-determined" || (Platform.OS === "android" && permissionState === "denied");
    const isEnabled = permissionState === "authorized" || permissionState === "provisional";

    return (
        <AppScreenBackground>
            <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <Stack.Screen options={{ title: isEducationFlow ? "Stay in the loop" : "Notifications" }} />

                <ScreenHeader
                    eyebrow={isEducationFlow ? "ONE HELPFUL ALERT" : "NOTIFICATIONS"}
                    title={isEducationFlow ? "Know when Focus is complete" : "Focus notifications"}
                    subtitle="Optional, local completion alerts. No marketing messages and no remote push service."
                />

                <View style={styles.heroCard}>
                    <View style={styles.heroIcon}>
                        <BellRing size={29} strokeWidth={2.2} color={colours.primaryStrong} />
                    </View>

                    <View style={styles.statusBadge}>
                        <View style={[styles.statusDot, isEnabled && styles.statusDotEnabled]} />
                        <Text style={styles.statusBadgeText}>{copy.label}</Text>
                    </View>

                    <Text style={styles.cardTitle}>{copy.title}</Text>
                    <Text style={styles.cardDescription}>{copy.description}</Text>

                    <View style={styles.benefitList}>
                        {BENEFITS.map((benefit) => (
                            <View key={benefit} style={styles.benefitRow}>
                                <View style={styles.checkIcon}>
                                    <Check size={13} strokeWidth={3} color={colours.primaryStrong} />
                                </View>
                                <Text style={styles.benefitText}>{benefit}</Text>
                            </View>
                        ))}
                    </View>

                    {permissionState === "unavailable" ? (
                        <View style={styles.notice}>
                            <LockKeyhole size={17} color={colours.warning} />
                            <Text style={styles.noticeText}>
                                {Platform.OS === "ios"
                                    ? "Notifee is not included in Expo Go. Notifications remain off here, while the rest of the app continues to work."
                                    : "Notifications are not available in this runtime."}
                            </Text>
                        </View>
                    ) : null}

                    {canRequest ? (
                        <AnimatedPressable
                            accessibilityRole="button"
                            disabled={isWorking}
                            haptic="light"
                            onPress={() => void handleEnableNotifications()}
                            style={({ pressed }) => [styles.primaryButton, (pressed || isWorking) && styles.buttonPressed]}
                        >
                            <BellRing size={18} color={colours.onPrimary} />
                            <Text style={styles.primaryButtonText}>{isWorking ? "Checking…" : "Enable notifications"}</Text>
                        </AnimatedPressable>
                    ) : null}

                    {shouldOpenSettings && !canRequest ? (
                        <AnimatedPressable
                            accessibilityRole="button"
                            disabled={isWorking}
                            haptic="light"
                            onPress={() => void handleOpenSettings()}
                            style={({ pressed }) => [styles.primaryButton, (pressed || isWorking) && styles.buttonPressed]}
                        >
                            <ExternalLink size={18} color={colours.onPrimary} />
                            <Text style={styles.primaryButtonText}>Open Settings</Text>
                        </AnimatedPressable>
                    ) : null}

                    {isEnabled ? (
                        <View style={styles.enabledRow}>
                            <ShieldCheck size={18} color={colours.success} />
                            <Text style={styles.enabledText}>
                                {permissionState === "provisional" ? "Quiet delivery is enabled." : "Focus completion alerts are enabled."}
                            </Text>
                        </View>
                    ) : null}

                    {isEducationFlow ? (
                        <AnimatedPressable
                            accessibilityRole="button"
                            disabled={isWorking}
                            onPress={() => void completeEducation()}
                            style={({ pressed }) => [styles.secondaryButton, (pressed || isWorking) && styles.secondaryButtonPressed]}
                        >
                            <Text style={styles.secondaryButtonText}>{isEnabled ? "Continue" : "Not now"}</Text>
                        </AnimatedPressable>
                    ) : null}
                </View>
            </ScrollView>
        </AppScreenBackground>
    );
}

function getPermissionCopy(state: FocusNotificationPermissionState | null) {
    switch (state) {
        case "authorized":
            return { label: "ENABLED", title: "You’re all set", description: "Your device can alert you when a running Focus Session reaches its expected end." };
        case "provisional":
            return { label: "QUIETLY ENABLED", title: "Quiet alerts are on", description: "iOS can deliver Focus completion alerts quietly in Notification Centre." };
        case "denied":
            return { label: "OFF", title: "Notifications are off", description: Platform.OS === "ios" ? "iOS will not show the permission prompt again. Re-enable notifications from Settings whenever you want them." : "Enable notification access or open system Settings whenever you want completion alerts." };
        case "settings-disabled":
            return { label: "SYSTEM SETTINGS", title: "Alerts are disabled", description: "Notification access exists, but iOS has no visible delivery location enabled. You can change that in Settings." };
        case "unavailable":
            return { label: "UNAVAILABLE HERE", title: "The app still works normally", description: "Focus notifications are optional and unavailable in this runtime." };
        case "not-determined":
            return { label: "OPTIONAL", title: "Step away without watching the clock", description: "Enable one useful alert when Focus finishes. The native permission prompt only appears after you choose Enable." };
        default:
            return { label: "CHECKING", title: "Checking notification access", description: "No permission prompt will appear while No More Later checks your current settings." };
    }
}

function createStyles(colours: AppColours, gutter: number) {
    return StyleSheet.create({
        screen: { flex: 1, backgroundColor: "transparent" },
        contentContainer: { width: "100%", maxWidth: 680, alignSelf: "center", paddingHorizontal: gutter, paddingTop: spacing.lg, paddingBottom: 48 },
        heroCard: { marginTop: spacing.xl, alignItems: "center", padding: spacing.xl, borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.xl, backgroundColor: colours.surface },
        heroIcon: { width: 62, height: 62, alignItems: "center", justifyContent: "center", borderRadius: radius.lg, backgroundColor: colours.primarySoft },
        statusBadge: { marginTop: spacing.md, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colours.primarySubtle },
        statusDot: { width: 7, height: 7, borderRadius: radius.pill, backgroundColor: colours.textMuted },
        statusDotEnabled: { backgroundColor: colours.success },
        statusBadgeText: { fontSize: 10, fontWeight: "900", letterSpacing: 0.8, color: colours.primaryStrong },
        cardTitle: { marginTop: spacing.md, textAlign: "center", fontSize: 24, lineHeight: 30, fontWeight: "900", color: colours.text },
        cardDescription: { maxWidth: 480, marginTop: spacing.sm, textAlign: "center", fontSize: 14, lineHeight: 21, color: colours.textMuted },
        benefitList: { width: "100%", marginTop: spacing.lg, gap: spacing.md },
        benefitRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
        checkIcon: { width: 24, height: 24, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.primarySoft },
        benefitText: { flex: 1, paddingTop: 2, fontSize: 13, lineHeight: 19, color: colours.text },
        notice: { width: "100%", marginTop: spacing.lg, flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, padding: spacing.md, borderWidth: 1, borderColor: colours.warningBorder, borderRadius: radius.md, backgroundColor: colours.warningSoft },
        noticeText: { flex: 1, fontSize: 12, lineHeight: 18, color: colours.warning },
        primaryButton: { width: "100%", minHeight: 50, marginTop: spacing.lg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.md, backgroundColor: colours.primary },
        primaryButtonText: { fontSize: 15, fontWeight: "800", color: colours.onPrimary },
        buttonPressed: { opacity: 0.76 },
        enabledRow: { width: "100%", marginTop: spacing.lg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colours.successSoft },
        enabledText: { fontSize: 13, fontWeight: "700", color: colours.success },
        secondaryButton: { minHeight: 44, marginTop: spacing.md, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.lg },
        secondaryButtonPressed: { opacity: 0.62 },
        secondaryButtonText: { fontSize: 14, fontWeight: "800", color: colours.textMuted },
    });
}
