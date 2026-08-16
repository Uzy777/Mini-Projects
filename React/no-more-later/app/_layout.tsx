import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useEffect } from "react";
import "react-native-reanimated";
import * as SplashScreen from "expo-splash-screen";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppearanceProvider, useAppearance } from "@/contexts/AppearanceContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    return (
        <AppearanceProvider>
            <AuthProvider>
                <AppShell />
            </AuthProvider>
        </AppearanceProvider>
    );
}

function AppShell() {
    const { colours, resolvedColourMode, isAppearanceLoading } = useAppearance();

    const { isLoading: isAuthLoading } = useAuth();

    const navigationTheme = useMemo(() => {
        const baseTheme = resolvedColourMode === "light" ? DefaultTheme : DarkTheme;

        return {
            ...baseTheme,

            colors: {
                ...baseTheme.colors,

                primary: colours.primary,
                background: colours.background,
                card: colours.surface,
                text: colours.text,
                border: colours.border,
                notification: colours.danger,
            },
        };
    }, [colours, resolvedColourMode]);

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

            <StatusBar style={resolvedColourMode === "light" ? "dark" : "light"} />
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
