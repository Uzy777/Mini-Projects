import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { colours } from "@/constants/design";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

export const unstable_settings = {
    anchor: "(tabs)",
};

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <AuthProvider>
            <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
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
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
                </Stack>
                <StatusBar style="auto" />
            </ThemeProvider>
        </AuthProvider>
    );
}

function RootNavigator() {
    const { session, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    return (
        <Stack>
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
            </Stack.Protected>
        </Stack>
    );
}
