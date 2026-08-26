import { useCallback, useMemo, useState } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";

import type { Journey } from "../../../types/models";
import { saveJourneys } from "../../../services/storage/journeysStorage";
import { JourneyCard } from "../../../components/journeys/JourneyCard";
import { AddJourneyForm } from "../../../components/journeys/AddJourneyForm";
import { confirmDelete } from "../../../utils/confirmDelete";
import { getActiveFocusSession } from "../../../services/storage/activeFocusSessionStorage";
import { showMessage } from "../../../utils/showMessage";
import { getScreenGutter, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import { useAuth } from "@/contexts/AuthContext";
import { createRemoteJourney, deleteRemoteJourney, getRemoteJourneys } from "@/services/journeys/journeyService";
import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";
import { KeyboardAwareScrollView } from "@/components/ui/KeyboardAwareLayout";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

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
    const { colours } = useAppearance();
    const { width } = useWindowDimensions();

    const styles = useMemo(() => createStyles(colours, getScreenGutter(width)), [colours, width]);

    const router = useRouter();
    const { session } = useAuth();
    const userId = session?.user.id;

    const [journeyTitle, setJourneyTitle] = useState("");
    const [journeys, setJourneys] = useState<Journey[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<JourneyFilter>("all");

    useFocusEffect(
        useCallback(() => {
            async function loadJourneys() {
                if (!userId) {
                    setJourneys([]);
                    return;
                }

                try {
                    const { data, error } = await getRemoteJourneys(userId);

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
        }, [userId]),
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

    return (
        <AppScreenBackground>
            <KeyboardAwareScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <ScreenHeader eyebrow="JOURNEYS" title="Journeys" subtitle="Choose a goal and keep moving it forward." />

                <AddJourneyForm journeyTitle={journeyTitle} onChangeJourneyTitle={setJourneyTitle} onAddJourney={handleAddJourney} />

                <SegmentedControl value={selectedFilter} onChange={setSelectedFilter} options={journeyFilters} />

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
            </KeyboardAwareScrollView>
        </AppScreenBackground>
    );
}

function createStyles(colours: AppColours, gutter: number) {
    return StyleSheet.create({
        emptyText: {
            marginTop: 24,
            textAlign: "center",
            fontSize: 15,
            lineHeight: 22,
            color: colours.textMuted,
        },

        contentContainer: {
            width: "100%",
            maxWidth: 720,
            alignSelf: "center",
            paddingHorizontal: gutter,
            paddingTop: spacing.lg,
            paddingBottom: 48,
            gap: spacing.lg,
        },
        journeyList: {
            gap: spacing.md,
        },
        scrollView: {
            flex: 1,
            backgroundColor: "transparent",
        },
    });
}
