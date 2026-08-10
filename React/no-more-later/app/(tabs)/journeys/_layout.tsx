import { Stack } from "expo-router";

import { colours } from "@/constants/design";

export default function JourneysLayout() {
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
