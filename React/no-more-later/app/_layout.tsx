import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import * as SplashScreen from "expo-splash-screen";

import "react-native-reanimated";

import { AUTH_COLOURS } from "@/constants/appearanceColours";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppearanceProvider, useAppearance } from "@/contexts/AppearanceContext";
import { PremiumProvider } from "@/contexts/PremiumContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    return (
        <AuthProvider>
            <PremiumProvider>
                <AppearanceProvider>
                    <AppShell />
                </AppearanceProvider>
            </PremiumProvider>
        </AuthProvider>
    );
}

function AppShell() {
    const { colours, resolvedColourMode, isAppearanceLoading } = useAppearance();

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
        if (!isAppearanceLoading && !isAuthLoading) {
            SplashScreen.hideAsync();
        }
    }, [isAppearanceLoading, isAuthLoading]);

    if (isAppearanceLoading || isAuthLoading) {
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
    const { colours } = useAppearance();

    if (isLoading) {
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
            <Stack.Protected guard={!session}>
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

                <Stack.Screen
                    name="appearance"
                    options={{
                        title: "Appearance",
                    }}
                />

                <Stack.Screen
                    name="modal"
                    options={{
                        presentation: "modal",
                        title: "Modal",
                    }}
                />
            </Stack.Protected>
        </Stack>
    );
}
