import { StyleSheet, View, ScrollView, useWindowDimensions } from "react-native";
import { useState, useCallback, useMemo } from "react";
import { useFocusEffect } from "expo-router";

import type { FocusSessionRecord } from "../../types/models";
import { HomeHeader } from "../../components/home/HomeHeader";
import { QuickFocusCard } from "../../components/home/QuickFocusCard";
import { HomeStreakCard } from "../../components/home/HomeStreakCard";
import { layout, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import { useAuth } from "@/contexts/AuthContext";
import { getRemoteFocusSessions } from "@/services/focusSessions/focusSessionService";
import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";

export default function HomeScreen() {
    const { session, profile } = useAuth();
    const { colours } = useAppearance();
    const { width } = useWindowDimensions();
    const isWide = width >= 900;

    const styles = useMemo(() => createStyles(colours, isWide), [colours, isWide]);

    const [focusSessions, setFocusSessions] = useState<FocusSessionRecord[]>([]);

    useFocusEffect(
        useCallback(() => {
            async function loadFocusSessions() {
                if (!session) {
                    setFocusSessions([]);

                    return;
                }

                try {
                    const { data: remoteFocusSessions, error: remoteFocusSessionsError } = await getRemoteFocusSessions(session.user.id);

                    if (remoteFocusSessionsError) {
                        console.error("Failed to load remote Focus Sessions:", remoteFocusSessionsError);

                        return;
                    }

                    setFocusSessions(remoteFocusSessions ?? []);
                } catch (error) {
                    console.error("Failed to load focus sessions:", error);

                    setFocusSessions([]);
                }
            }

            loadFocusSessions();
        }, [session]),
    );

    return (
        <View style={styles.screen}>
            <AppScreenBackground>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                    <View style={styles.contentSections}>
                        <HomeHeader displayName={profile?.display_name ?? null} />

                        {/* The Home level card now lives in Progress Overview.
                        <LevelProgressCard
                            level={level}
                            xpIntoLevel={xpIntoLevel}
                            xpRequired={xpRequired}
                            currentStreak={currentStreak}
                            totalFocusedSeconds={totalFocusedSeconds}
                            totalXp={totalXp}
                        />
                        */}

                        <View style={styles.homeGrid}>
                            <View style={styles.focusColumn}>
                                <QuickFocusCard />
                            </View>
                            <View style={styles.streakColumn}>
                                <HomeStreakCard sessions={focusSessions} />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </AppScreenBackground>
        </View>
    );
}

function createStyles(colours: AppColours, isWide: boolean) {
    return StyleSheet.create({
        contentContainer: {
            width: "100%",
            maxWidth: layout.contentMaxWidth,
            alignSelf: "center",
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: 48,
        },
        contentSections: {
            gap: spacing.md,
        },
        homeGrid: {
            flexDirection: isWide ? "row" : "column",
            alignItems: "flex-start",
            gap: spacing.lg,
        },
        focusColumn: {
            width: isWide ? "auto" : "100%",
            flex: isWide ? 1.6 : undefined,
        },
        streakColumn: {
            width: isWide ? "auto" : "100%",
            flex: isWide ? 0.72 : undefined,
        },
        screen: {
            flex: 1,
            backgroundColor: colours.background,
        },
        scrollView: {
            flex: 1,

            backgroundColor: "transparent",
        },
    });
}
