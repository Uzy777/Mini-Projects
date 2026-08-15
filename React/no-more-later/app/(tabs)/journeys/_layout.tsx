import { Stack } from "expo-router";

import { useAppearance } from "@/contexts/AppearanceContext";

export default function JourneysLayout() {
    const { colours } = useAppearance();

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
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                }}
            />

            <Stack.Screen
                name="[id]"
                options={{
                    title: "Journey",
                }}
            />
        </Stack>
    );
}
