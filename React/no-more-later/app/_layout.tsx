import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";

import { Stack, type Href, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef } from "react";
import * as SplashScreen from "expo-splash-screen";

import "react-native-reanimated";

import { AUTH_COLOURS } from "@/constants/appearanceColours";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppearanceProvider, useAppearance } from "@/contexts/AppearanceContext";
import { OnboardingProvider, useOnboarding } from "@/contexts/OnboardingContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import {
    clearFocusNotifications,
    getFocusNotificationPermissionState,
    reconcileFocusNotificationWithStoredSession,
    subscribeToFocusNotificationPress,
} from "@/services/notifications/focusNotificationService";
import { getNotificationEducationCompleted } from "@/services/storage/notificationEducationStorage";
import { Platform } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    return (
        <AuthProvider>
            <OnboardingProvider>
                <PremiumProvider>
                    <AppearanceProvider>
                        <AppShell />
                    </AppearanceProvider>
                </PremiumProvider>
            </OnboardingProvider>
        </AuthProvider>
    );
}

function AppShell() {
    const { colours, resolvedColourMode, isAppearanceLoading } = useAppearance();
    const { isOnboardingLoading } = useOnboarding();

    const { session, isLoading: isAuthLoading } = useAuth();

    const shellColours = session ? colours : AUTH_COLOURS;

    const shellColourMode = session ? resolvedColourMode : "light";

    const navigationTheme = useMemo(() => {
        const baseTheme = shellColourMode === "light" ? DefaultTheme : DarkTheme;

        return {
            ...baseTheme,

            colors: {
                ...baseTheme.colors,

                primary: shellColours.primary,
                background: shellColours.background,
                card: shellColours.surface,
                text: shellColours.text,
                border: shellColours.border,
                notification: shellColours.danger,
            },
        };
    }, [shellColours, shellColourMode]);

    useEffect(() => {
        if (!isAppearanceLoading && !isAuthLoading && !isOnboardingLoading) {
            SplashScreen.hideAsync();
        }
    }, [isAppearanceLoading, isAuthLoading, isOnboardingLoading]);

    if (isAppearanceLoading || isAuthLoading || isOnboardingLoading) {
        return null;
    }

    return (
        <ThemeProvider value={navigationTheme}>
            <RootNavigator />

            <StatusBar style={shellColourMode === "light" ? "dark" : "light"} />
        </ThemeProvider>
    );
}

function RootNavigator() {
    const { session, isLoading } = useAuth();
    const { hasCompletedOnboarding, isOnboardingLoading } = useOnboarding();
    const { colours } = useAppearance();
    const router = useRouter();
    const notificationEducationCheckRef = useRef<string | null>(null);

    useEffect(() => {
        return subscribeToFocusNotificationPress((route) => {
            router.replace(route as Href);
        });
    }, [router]);

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (session) {
            void reconcileFocusNotificationWithStoredSession();
        } else {
            void clearFocusNotifications();
        }
    }, [isLoading, session]);

    useEffect(() => {
        if (isLoading || !session || Platform.OS === "web") {
            if (!session) notificationEducationCheckRef.current = null;
            return;
        }

        const userId = session.user.id;
        if (notificationEducationCheckRef.current === userId) {
            return;
        }

        notificationEducationCheckRef.current = userId;
        let isCurrent = true;

        Promise.all([getNotificationEducationCompleted(), getFocusNotificationPermissionState()])
            .then(([hasSeenEducation, permissionState]) => {
                if (!isCurrent || hasSeenEducation) {
                    return;
                }

                const shouldShowEducation =
                    permissionState === "not-determined" ||
                    (Platform.OS === "android" && permissionState === "denied");

                if (shouldShowEducation) {
                    router.push("/notifications?education=true" as Href);
                }
            })
            .catch((error) => {
                console.warn("Failed to prepare notification education:", error);
            });

        return () => {
            isCurrent = false;
        };
    }, [isLoading, router, session]);

    if (isLoading || isOnboardingLoading) {
        return null;
    }

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: colours.surface,
                },

                headerTintColor: colours.text,

                headerTitleStyle: {
                    fontWeight: "700",
                },

                headerShadowVisible: false,

                ...(Platform.OS === "ios"
                    ? {
                          headerBackButtonDisplayMode: "minimal",
                      }
                    : {}),
            }}
        >
            <Stack.Protected guard={!session && !hasCompletedOnboarding}>
                <Stack.Screen
                    name="onboarding"
                    options={{
                        headerShown: false,
                    }}
                />
            </Stack.Protected>

            <Stack.Protected guard={!session && hasCompletedOnboarding}>
                <Stack.Screen
                    name="(auth)"
                    options={{
                        headerShown: false,
                    }}
                />
            </Stack.Protected>

            <Stack.Protected guard={!!session}>
                <Stack.Screen
                    name="(tabs)"
                    options={{
                        headerShown: false,
                    }}
                />

                <Stack.Screen
                    name="focus/[questId]"
                    options={{
                        title: "Focus",
                    }}
                />

                <Stack.Screen
                    name="review/[questId]"
                    options={{
                        title: "Review",
                    }}
                />

                <Stack.Screen
                    name="session/[sessionId]"
                    options={{
                        headerShown: false,
                    }}
                />

                <Stack.Screen
                    name="account"
                    options={{
                        title: "Account",
                    }}
                />

                <Stack.Screen
                    name="profile"
                    options={{
                        title: "Profile",
                    }}
                />

                <Stack.Screen name="premium" options={{ title: "Premium" }} />

                <Stack.Screen
                    name="appearance"
                    options={{
                        title: "Appearance",
                    }}
                />

                <Stack.Screen
                    name="notifications"
                    options={{
                        title: "Notifications",
                    }}
                />
            </Stack.Protected>
        </Stack>
    );
}
