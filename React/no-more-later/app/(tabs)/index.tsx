import { StyleSheet, View, ScrollView } from "react-native";
import { useState, useCallback, useMemo } from "react";
import { useFocusEffect, useRouter } from "expo-router";

import type { FocusSessionRecord } from "../../types/models";
import { HomeHeader } from "../../components/home/HomeHeader";
import { QuickFocusCard } from "../../components/home/QuickFocusCard";
import { FocusTipCard } from "../../components/home/FocusTipCard";
import { calculateCurrentStreak } from "../../utils/focusSessionStats";
import { spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import { useAuth } from "@/contexts/AuthContext";
import { getRemoteFocusSessions } from "@/services/focusSessions/focusSessionService";
import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";

export default function HomeScreen() {
    const router = useRouter();
    const { session, profile } = useAuth();
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

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

    const currentStreak = calculateCurrentStreak(focusSessions);

    function handleOpenMenu() {
        router.push("/account");
    }

    return (
        <View style={styles.screen}>
            <AppScreenBackground>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                    <View style={styles.contentSections}>
                        <HomeHeader currentStreak={currentStreak} displayName={profile?.display_name ?? null} onPressMenu={handleOpenMenu} />

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

                        <QuickFocusCard />
                        <FocusTipCard />
                    </View>
                </ScrollView>
            </AppScreenBackground>
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        contentContainer: {
            width: "100%",
            maxWidth: 720,
            alignSelf: "center",
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: 48,
        },
        contentSections: {
            gap: spacing.md,
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
