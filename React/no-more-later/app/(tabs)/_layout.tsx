import { Tabs } from "expo-router";
import React from "react";
import { useWindowDimensions } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { BarChart3, House, Map, RotateCcwClock, Trophy, Layers3 } from "lucide-react-native";

import { useAppearance } from "@/contexts/AppearanceContext";
import { layout, radius, spacing } from "@/constants/design";

export default function TabLayout() {
    const { colours } = useAppearance();
    const { width } = useWindowDimensions();
    const isDesktop = width >= layout.desktopBreakpoint;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarPosition: isDesktop ? "left" : "bottom",
                tabBarLabelPosition: isDesktop ? "beside-icon" : "below-icon",

                tabBarActiveTintColor: colours.primary,

                tabBarInactiveTintColor: colours.textMuted,

                tabBarStyle: {
                    backgroundColor: colours.surface,
                    borderTopColor: isDesktop ? "transparent" : colours.border,
                    borderTopWidth: isDesktop ? 0 : 1,
                    borderRightColor: isDesktop ? colours.border : "transparent",
                    borderRightWidth: isDesktop ? 1 : 0,
                    width: isDesktop ? 184 : undefined,
                    paddingTop: isDesktop ? spacing.xl : 6,
                    paddingHorizontal: isDesktop ? spacing.md : 0,
                    paddingBottom: isDesktop ? spacing.lg : undefined,
                },

                tabBarLabelStyle: {
                    fontSize: isDesktop ? 13 : 11,
                    fontWeight: "700",
                },

                tabBarItemStyle: {
                    minHeight: isDesktop ? 48 : undefined,
                    maxHeight: isDesktop ? 48 : undefined,
                    marginVertical: isDesktop ? 3 : 0,
                    paddingVertical: isDesktop ? 0 : 4,
                    borderRadius: isDesktop ? radius.md : 0,
                },
                tabBarActiveBackgroundColor: isDesktop ? colours.primarySoft : "transparent",
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
                    // Keep the route available, but remove it from the bottom navigation.
                    href: null,
                    tabBarIcon: ({ color, size }) => <Map size={size} color={color} />,
                }}
            />
            
            <Tabs.Screen
                name="work"
                options={{
                    title: "Work",
                    tabBarIcon: ({ color, size }) => <Layers3 size={size} color={color} />,
                }}
            />

            <Tabs.Screen
                name="history"
                options={{
                    title: "History",
                    // History now lives inside Progress, so its original route stays available without a tab button.
                    href: null,
                    tabBarIcon: ({ color, size }) => <RotateCcwClock size={size} color={color} />,
                }}
            />

            <Tabs.Screen
                name="progress"
                options={{
                    title: "Progress",
                    tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
                }}
            />

            <Tabs.Screen name="leaderboard" options={{ title: "Leaderboard", tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} /> }} />
        </Tabs>
    );
}
