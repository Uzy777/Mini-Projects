import { useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { StyleSheet, Text, View, ScrollView, Alert, Platform, Pressable } from "react-native";

import type { Journey } from "../../../types/models";
import { getJourneys, saveJourneys } from "../../../services/storage/journeysStorage";
import { JourneyCard } from "../../../components/journeys/JourneyCard";
import { AddJourneyForm } from "../../../components/journeys/AddJourneyForm";
import { confirmDelete } from "../../../utils/confirmDelete";
import { clearQuestsForJourney } from "../../../services/storage/questsStorage";
import { getActiveFocusSession } from "../../../services/storage/activeFocusSessionStorage";
import { showMessage } from "../../../utils/showMessage";
import { clearNoMoreLaterStorage } from "../../../services/storage/resetAppStorage";
import { colours, spacing, radius } from "../../../constants/design";
import { useAuth } from "@/contexts/AuthContext";
import { getRemoteJourneys } from "@/services/journeys/journeyService";
import { createRemoteJourney, deleteRemoteJourney } from "@/services/journeys/journeyService";

type JourneyFilter = "all" | "active" | "completed";

const journeyFilters: {
    label: string;
    value: JourneyFilter;
}[] = [
    {
        label: "All",
        value: "all",
    },
    {
        label: "Active",
        value: "active",
    },
    {
        label: "Completed",
        value: "completed",
    },
];

export default function JourneyScreen() {
    const router = useRouter();
    const { session } = useAuth();

    const [journeyTitle, setJourneyTitle] = useState("");
    const [journeys, setJourneys] = useState<Journey[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<JourneyFilter>("all");

    useFocusEffect(
        useCallback(() => {
            async function loadJourneys() {
                if (!session) {
                    setJourneys([]);
                    return;
                }

                try {
                    const { data, error } = await getRemoteJourneys(session.user.id);

                    if (error) {
                        console.error("Failed to load remote Journeys:", error);

                        return;
                    }

                    const remoteJourneys = data ?? [];

                    setJourneys(remoteJourneys);

                    await saveJourneys(remoteJourneys);
                } catch (error) {
                    console.error("Failed to load Journeys:", error);
                }
            }

            loadJourneys();
        }, [session?.user.id]),
    );

    async function handleAddJourney() {
        const trimmedTitle = journeyTitle.trim();

        if (!trimmedTitle) {
            return;
        }

        const normalisedTitle = trimmedTitle.toLowerCase();

        const journeyAlreadyExists = journeys.some((journey) => journey.title.trim().toLowerCase() === normalisedTitle);

        if (journeyAlreadyExists) {
            showMessage("Journey already exists", `A Journey named "${trimmedTitle}" already exists.`);

            return;
        }

        if (!session) {
            return;
        }

        try {
            const { data, error } = await createRemoteJourney(session.user.id, trimmedTitle);

            if (error || !data) {
                console.error("Failed to create Journey:", error);

                return;
            }

            const newJourney: Journey = data;

            const updatedJourneys = [...journeys, newJourney];

            await saveJourneys(updatedJourneys);

            setJourneys(updatedJourneys);
            setJourneyTitle("");

            console.log("Created Journey:", newJourney);
        } catch (error) {
            console.error("Failed to create Journey:", error);
        }
    }

    async function handleDeleteJourney(journeyId: string) {
        try {
            const { error } = await deleteRemoteJourney(journeyId);

            if (error) {
                console.error("Failed to delete remote Journey:", error);
                return;
            }

            const updatedJourneys = journeys.filter((journey) => journey.id !== journeyId);

            await saveJourneys(updatedJourneys);

            setJourneys(updatedJourneys);
        } catch (error) {
            console.error("Failed to delete Journey:", error);
        }
    }

    async function handleRequestDeleteJourney(journey: Journey) {
        try {
            const activeSession = await getActiveFocusSession();

            const journeyHasActiveSession = activeSession?.journeyId === journey.id;

            if (journeyHasActiveSession) {
                showMessage("Journey has an active session", `End or review the Focus Session for "${activeSession.questTitle}" before deleting this Journey.`);

                return;
            }

            confirmDelete({
                title: "Delete Journey?",
                message: `Are you sure you want to delete "${journey.title}"?`,
                onConfirm: () => {
                    void handleDeleteJourney(journey.id);
                },
            });
        } catch (error) {
            console.error("Failed to check active Focus Session:", error);

            showMessage("Journey could not be deleted", "The active Focus Session could not be checked. Please try again.");
        }
    }

    function handleOpenJourney(journey: Journey) {
        router.push({ pathname: "/journeys/[id]", params: { id: journey.id, title: journey.title } });
    }

    const filteredJourneys = journeys.filter((journey) => {
        if (selectedFilter === "all") {
            return true;
        }

        return journey.status === selectedFilter;
    });

    async function handleResetAppDate() {
        try {
            await clearNoMoreLaterStorage();

            setJourneys([]);

            showMessage("App data cleared", "All Journeys, Quests, sessions and XP have been removed.");
        } catch (error) {
            console.error("Failed to clear app data:", error);

            showMessage("Reset failed", "The app data could not be cleared.");
        }
    }

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {/* <Pressable
                onPress={() => {
                    void clearNoMoreLaterStorage();
                }}
            >
                <Text>Reset all app data</Text>
            </Pressable> */}

            <View style={styles.header}>
                <Text style={styles.title}>Journeys</Text>

                <Text style={styles.subtitle}>Choose a goal and keep moving it forward.</Text>
            </View>

            <AddJourneyForm journeyTitle={journeyTitle} onChangeJourneyTitle={setJourneyTitle} onAddJourney={handleAddJourney} />

            <View style={styles.filterContainer}>
                {journeyFilters.map((filter) => {
                    const isSelected = selectedFilter === filter.value;

                    return (
                        <Pressable
                            key={filter.value}
                            style={[styles.filterButton, isSelected && styles.filterButtonSelected]}
                            onPress={() => setSelectedFilter(filter.value)}
                        >
                            <Text style={[styles.filterButtonText, isSelected && styles.filterButtonTextSelected]}>{filter.label}</Text>
                        </Pressable>
                    );
                })}
            </View>

            <View style={styles.journeyList}>
                {journeys.length === 0 ? (
                    <Text style={styles.emptyText}>No Journeys yet.</Text>
                ) : filteredJourneys.length === 0 ? (
                    <Text style={styles.emptyText}>{selectedFilter === "completed" ? "No completed Journeys." : "No active Journeys."}</Text>
                ) : (
                    filteredJourneys.map((journey) => (
                        <JourneyCard
                            key={journey.id}
                            journey={journey}
                            onOpen={() => handleOpenJourney(journey)}
                            onDelete={() => {
                                void handleRequestDeleteJourney(journey);
                            }}
                        />
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    emptyText: {
        marginTop: 24,
        textAlign: "center",
        fontSize: 15,
        lineHeight: 22,
        color: "#737373",
    },
    screen: {
        flex: 1,
        backgroundColor: colours.background,
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
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: 30,
        lineHeight: 36,
        fontWeight: "800",
        color: colours.text,
    },
    subtitle: {
        marginTop: spacing.sm,
        fontSize: 15,
        lineHeight: 22,
        color: colours.textMuted,
    },
    journeyList: {
        gap: spacing.md,
        marginTop: spacing.md,
    },
    filterContainer: {
        width: "100%",
        flexDirection: "row",
        gap: spacing.xs,
        marginTop: spacing.lg,
        padding: spacing.xs,
        borderWidth: 1,
        borderColor: colours.border,
        borderRadius: radius.md,
        backgroundColor: colours.surface,
    },

    filterButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.sm,
    },

    filterButtonSelected: {
        backgroundColor: colours.primary,
    },

    filterButtonText: {
        fontSize: 13,
        fontWeight: "700",
        color: colours.textMuted,
    },

    filterButtonTextSelected: {
        color: colours.surface,
    },
});
