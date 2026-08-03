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

    const [journeyTitle, setJourneyTitle] = useState("");
    const [journeys, setJourneys] = useState<Journey[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<JourneyFilter>("all");

    useFocusEffect(
        useCallback(() => {
            async function loadJourneys() {
                try {
                    const currentJourneys = await getJourneys();

                    setJourneys(currentJourneys);
                } catch (error) {
                    console.error("Failed to load Journeys:", error);
                }
            }

            loadJourneys();
        }, []),
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

        const newJourney: Journey = {
            id: Date.now().toString(),
            title: trimmedTitle,
            status: "active",
        };

        const updatedJourneys = [...journeys, newJourney];

        try {
            await saveJourneys(updatedJourneys);

            setJourneys(updatedJourneys);
            setJourneyTitle("");
        } catch (error) {
            console.error("Failed to save Journey:", error);
        }
    }

    async function handleDeleteJourney(journeyId: string) {
        const updatedJourneys = journeys.filter((journey) => journey.id !== journeyId);

        try {
            await saveJourneys(updatedJourneys);

            await clearQuestsForJourney(journeyId);
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
        <ScrollView style={styles.container}>
            <Pressable
                onPress={() => {
                    void clearNoMoreLaterStorage();
                }}
            >
                <Text>Reset all app data</Text>
            </Pressable>

            <Text style={styles.title}>Journeys</Text>

            <Text style={styles.description}>Your larger goals and projects will appear here.</Text>

            <AddJourneyForm journeyTitle={journeyTitle} onChangeJourneyTitle={setJourneyTitle} onAddJourney={handleAddJourney} />

            <View style={styles.filterRow}>
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
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        marginTop: 48,
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
    },
    journeyList: {
        marginTop: 24,
        gap: 12,
    },
    filterRow: {
        flexDirection: "row",
        gap: 8,
        marginVertical: 16,
    },
    filterButton: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#d4d4d4",
        borderRadius: 10,
        backgroundColor: "#ffffff",
    },
    filterButtonSelected: {
        backgroundColor: "#171717",
        borderColor: "#171717",
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#525252",
    },
    filterButtonTextSelected: {
        color: "#ffffff",
    },
    emptyText: {
        marginTop: 24,
        textAlign: "center",
        fontSize: 15,
        lineHeight: 22,
        color: "#737373",
    },
});
