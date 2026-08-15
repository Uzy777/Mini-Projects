import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { House, Map, RotateCcwClock, Trophy } from "lucide-react-native";

import { useAppearance } from "@/contexts/AppearanceContext";

export default function TabLayout() {
    const { colours } = useAppearance();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarButton: HapticTab,

                tabBarActiveTintColor: colours.primary,

                tabBarInactiveTintColor: colours.textMuted,

                tabBarStyle: {
                    backgroundColor: colours.surface,

                    borderTopColor: colours.border,

                    borderTopWidth: 1,

                    paddingTop: 6,
                },

                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "600",
                },

                tabBarItemStyle: {
                    paddingVertical: 4,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => <House size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="journeys"
                options={{
                    title: "Journeys",
                    tabBarIcon: ({ color, size }) => <Map size={size} color={color} />,
                }}
            />
            <Tabs.Screen name="history" options={{ title: "History", tabBarIcon: ({ color, size }) => <RotateCcwClock size={size} color={color} /> }} />

            <Tabs.Screen name="leaderboard" options={{ title: "Leaderboard", tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} /> }} />
        </Tabs>
    );
}
