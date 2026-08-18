import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import type { FocusSessionRecord } from "../../types/models";
import { FocusSessionHistoryCard } from "../../components/history/FocusSessionHistoryCard";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import { useAuth } from "@/contexts/AuthContext";
import { getRemoteFocusSessions } from "@/services/focusSessions/focusSessionService";
import { useMemo } from "react";
import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";

export default function HistoryScreen() {
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    const { session } = useAuth();

    const [sessions, setSessions] = useState<FocusSessionRecord[]>([]);

    useFocusEffect(
        useCallback(() => {
            async function loadSessions() {
                if (!session) {
                    setSessions([]);
                    return;
                }

                try {
                    const { data, error } = await getRemoteFocusSessions(session.user.id);

                    if (error) {
                        console.error("Failed to load remote Focus Sessions:", error);

                        return;
                    }

                    setSessions(data ?? []);
                } catch (error) {
                    console.error("Failed to load Focus Sessions:", error);
                }
            }

            loadSessions();
        }, [session?.user.id]),
    );

    return (
        <AppScreenBackground>
            <View style={styles.scrollView}>
                <FlatList
                    data={sessions}
                    keyExtractor={(session) => session.id}
                    renderItem={({ item }) => <FocusSessionHistoryCard session={item} />}
                    style={styles.list}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    ListHeaderComponent={
                        <View style={styles.header}>
                            <Text style={styles.title}>History</Text>

                            <Text style={styles.description}>Review the focused progress you have made.</Text>
                        </View>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyTitle}>No Focus Sessions yet</Text>

                            <Text style={styles.emptyDescription}>Complete a Focus Session and its Review to see it here.</Text>
                        </View>
                    }
                />
            </View>
        </AppScreenBackground>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        list: {
            flex: 1,
        },

        contentContainer: {
            width: "100%",
            maxWidth: 720,
            alignSelf: "center",
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: 48,
        },

        header: {
            marginBottom: spacing.xl,
        },

        title: {
            fontSize: 30,
            lineHeight: 36,
            fontWeight: "800",
            color: colours.text,
        },

        description: {
            marginTop: spacing.sm,
            fontSize: 15,
            lineHeight: 22,
            color: colours.textMuted,
        },

        separator: {
            height: spacing.md,
        },

        emptyState: {
            width: "100%",
            alignItems: "center",
            paddingVertical: spacing.xl,
            paddingHorizontal: spacing.lg,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },

        emptyTitle: {
            fontSize: 17,
            fontWeight: "700",
            color: colours.text,
            textAlign: "center",
        },

        emptyDescription: {
            marginTop: spacing.sm,
            maxWidth: 320,
            fontSize: 14,
            lineHeight: 20,
            color: colours.textMuted,
            textAlign: "center",
        },
        scrollView: {
            flex: 1,
            backgroundColor: "transparent",
        },
    });
}
