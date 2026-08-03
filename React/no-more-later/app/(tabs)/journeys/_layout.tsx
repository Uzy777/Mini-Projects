import { Stack } from "expo-router";

export default function JourneysLayout() {
    return (
        <Stack>
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
