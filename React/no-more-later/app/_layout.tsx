import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";

import { Stack, type Href, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import * as SplashScreen from "expo-splash-screen";

import "react-native-reanimated";

import { AUTH_COLOURS } from "@/constants/appearanceColours";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppearanceProvider, useAppearance } from "@/contexts/AppearanceContext";
import { OnboardingProvider, useOnboarding } from "@/contexts/OnboardingContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import {
    reconcileFocusNotificationWithStoredSession,
    removeRunningFocusNotification,
    subscribeToFocusNotificationPress,
} from "@/services/notifications/focusNotificationService";

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
            void removeRunningFocusNotification();
        }
    }, [isLoading, session]);

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
            </Stack.Protected>
        </Stack>
    );
}
