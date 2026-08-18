import { useMemo, useState, useCallback } from "react";
import { ScrollView, StyleSheet, Text, View, TextInput } from "react-native";

import { Folder } from "lucide-react-native";

import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";
import { CreateWorkQuestModal } from "@/components/work/CreateWorkQuestModal";
import { WorkJourneyCard } from "@/components/work/WorkJourneyCard";
import { WorkQuestCard } from "@/components/work/WorkQuestCard";
import { WorkQuickActions } from "@/components/work/WorkQuickActions";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { CreateWorkJourneyModal } from "@/components/work/CreateWorkJourneyModal";
import type { WorkAssetId, WorkJourney, WorkQuest } from "@/types/work";
import { WorkToolbar, type WorkStatusFilter, type WorkViewFilter } from "@/components/work/WorkToolbar";
import { WorkQuestActionsModal } from "@/components/work/WorkQuestActionsModal";
import { confirmDelete } from "@/utils/confirmDelete";
import { useFocusEffect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

import { createRemoteWorkJourney, createRemoteWorkQuest, getRemoteWorkJourneys, getRemoteWorkQuests } from "@/services/work/workService";

export default function WorkScreen() {
    const { colours } = useAppearance();
    const { session } = useAuth();

    const styles = useMemo(() => createStyles(colours), [colours]);

    const [selectedFilter, setSelectedFilter] = useState<WorkViewFilter>("all");
    const [statusFilter, setStatusFilter] = useState<WorkStatusFilter>("active");
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [selectedQuest, setSelectedQuest] = useState<WorkQuest | null>(null);

    const [searchQuery, setSearchQuery] = useState("");

    const [quests, setQuests] = useState<WorkQuest[]>([]);

    const [journeys, setJourneys] = useState<WorkJourney[]>([]);

    const [isCreateJourneyVisible, setIsCreateJourneyVisible] = useState(false);

    const [isCreateQuestVisible, setIsCreateQuestVisible] = useState(false);

    const normalisedSearchQuery = searchQuery.trim().toLowerCase();

    useFocusEffect(
        useCallback(() => {
            async function loadWork() {
                if (!session) {
                    setJourneys([]);
                    setQuests([]);
                    return;
                }

                try {
                    const [journeysResult, questsResult] = await Promise.all([getRemoteWorkJourneys(session.user.id), getRemoteWorkQuests(session.user.id)]);

                    if (journeysResult.error) {
                        console.error("Failed to load Work Journeys:", journeysResult.error);
                    } else {
                        setJourneys(journeysResult.data ?? []);
                    }

                    if (questsResult.error) {
                        console.error("Failed to load Work Quests:", questsResult.error);
                    } else {
                        setQuests(questsResult.data ?? []);
                    }
                } catch (error) {
                    console.error("Failed to load Work:", error);
                }
            }

            loadWork();
        }, [session?.user.id]),
    );

    const visibleQuests = quests.filter((quest) => {
        if (quest.status !== statusFilter) {
            return false;
        }

        if (selectedFilter === "journeys" && !quest.journeyId) {
            return false;
        }

        if (selectedFilter === "standalone" && quest.journeyId) {
            return false;
        }

        if (normalisedSearchQuery && !quest.title.toLowerCase().includes(normalisedSearchQuery)) {
            return false;
        }

        return true;
    });

    const visibleJourneys = journeys.filter((journey) => {
        if (journey.status !== statusFilter) {
            return false;
        }

        if (normalisedSearchQuery && !journey.title.toLowerCase().includes(normalisedSearchQuery)) {
            return false;
        }

        return true;
    });
    const showQuests = selectedFilter !== "journeys" || selectedFilter === "journeys";

    const showJourneys = selectedFilter === "all" || selectedFilter === "journeys";

    function handleSearch() {
        setIsSearchVisible((currentValue) => {
            if (currentValue) {
                setSearchQuery("");
            }

            return !currentValue;
        });
    }

    function handleStatusFilter() {
        setStatusFilter((currentStatus) => (currentStatus === "active" ? "completed" : "active"));
    }

    function handleNewQuest() {
        setIsCreateQuestVisible(true);
    }

    function handleNewJourney() {
        setIsCreateJourneyVisible(true);
    }

    function handleQuickStart() {
        const nextQuest = quests.find((quest) => quest.status === "active");

        if (!nextQuest) {
            setIsCreateQuestVisible(true);
            return;
        }

        handleFocusQuest(nextQuest);
    }

    async function handleCreateQuest(title: string, assetId: WorkAssetId, journeyId?: string) {
        if (!session) {
            return;
        }

        try {
            const { data, error } = await createRemoteWorkQuest(session.user.id, title, assetId, journeyId);

            if (error || !data) {
                console.error("Failed to create Work Quest:", error);

                return;
            }

            setQuests((currentQuests) => [data, ...currentQuests]);

            setIsCreateQuestVisible(false);
        } catch (error) {
            console.error("Failed to create Work Quest:", error);
        }
    }

    async function handleCreateJourney(title: string, assetId: WorkAssetId) {
        if (!session) {
            return;
        }

        try {
            const { data, error } = await createRemoteWorkJourney(session.user.id, title, assetId);

            if (error || !data) {
                console.error("Failed to create Work Journey:", error);

                return;
            }

            setJourneys((currentJourneys) => [data, ...currentJourneys]);

            setIsCreateJourneyVisible(false);
        } catch (error) {
            console.error("Failed to create Work Journey:", error);
        }
    }

    function handleToggleQuestComplete() {
        if (!selectedQuest) {
            return;
        }

        setQuests((currentQuests) =>
            currentQuests.map((quest) => {
                if (quest.id !== selectedQuest.id) {
                    return quest;
                }

                return {
                    ...quest,
                    status: quest.status === "completed" ? "active" : "completed",
                };
            }),
        );

        setSelectedQuest(null);
    }

    function handleAssignQuestJourney(journeyId?: string) {
        if (!selectedQuest) {
            return;
        }

        setQuests((currentQuests) =>
            currentQuests.map((quest) => {
                if (quest.id !== selectedQuest.id) {
                    return quest;
                }

                if (!journeyId) {
                    const { journeyId: _currentJourneyId, ...standaloneQuest } = quest;

                    return standaloneQuest;
                }

                return {
                    ...quest,
                    journeyId,
                };
            }),
        );

        setSelectedQuest(null);
    }

    function handleDeleteQuest() {
        if (!selectedQuest) {
            return;
        }

        const questToDelete = selectedQuest;

        setSelectedQuest(null);

        confirmDelete({
            title: "Delete Quest?",
            message: `Are you sure you want to delete "${questToDelete.title}"?`,
            onConfirm: () => {
                setQuests((currentQuests) => currentQuests.filter((quest) => quest.id !== questToDelete.id));
            },
        });
    }

    function getJourneyName(journeyId?: string) {
        if (!journeyId) {
            return undefined;
        }

        return journeys.find((journey) => journey.id === journeyId)?.title;
    }

    function handleFocusQuest(quest: WorkQuest) {
        console.log("Focus:", quest.title);
    }

    return (
        <AppScreenBackground>
            <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.brand}>NO MORE LATER</Text>

                <Text style={styles.title}>Journeys & Quests</Text>

                <Text style={styles.subtitle}>Everything you want to get done.</Text>

                <WorkQuickActions onNewQuest={handleNewQuest} onNewJourney={handleNewJourney} onQuickStart={handleQuickStart} />

                <WorkToolbar
                    selectedFilter={selectedFilter}
                    statusFilter={statusFilter}
                    onSelectFilter={setSelectedFilter}
                    onSearch={handleSearch}
                    onStatusFilter={handleStatusFilter}
                />

                {isSearchVisible && (
                    <View style={styles.searchContainer}>
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={styles.searchInput}
                            placeholder="Search Journeys and Quests"
                            placeholderTextColor={colours.textMuted}
                            selectionColor={colours.primary}
                            autoFocus
                        />
                    </View>
                )}

                <View style={styles.questSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{statusFilter === "active" ? "ACTIVE QUESTS" : "COMPLETED QUESTS"}</Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{visibleQuests.length}</Text>
                        </View>
                    </View>

                    <View style={styles.questList}>
                        {visibleQuests.map((quest) => (
                            <WorkQuestCard
                                key={quest.id}
                                title={quest.title}
                                assetId={quest.assetId}
                                journeyName={getJourneyName(quest.journeyId)}
                                onFocus={() => handleFocusQuest(quest)}
                                onMore={() => {
                                    setSelectedQuest(quest);
                                }}
                            />
                        ))}
                    </View>
                </View>

                {showJourneys && (
                    <View style={styles.journeySection}>
                        <View style={styles.sectionHeader}>
                            <Folder size={19} color={colours.primary} />

                            <Text style={styles.sectionTitle}>{statusFilter === "active" ? "JOURNEYS" : "COMPLETED JOURNEYS"}</Text>
                            <View style={styles.countBadge}>
                                <Text style={styles.countText}>{visibleJourneys.length}</Text>
                            </View>
                        </View>

                        <View style={styles.journeyGrid}>
                            {visibleJourneys.map((journey) => {
                                const journeyQuests = quests.filter((quest) => quest.journeyId === journey.id);

                                const completedQuestCount = journeyQuests.filter((quest) => quest.status === "completed").length;

                                return (
                                    <WorkJourneyCard
                                        key={journey.id}
                                        title={journey.title}
                                        assetId={journey.assetId}
                                        completedQuestCount={completedQuestCount}
                                        totalQuestCount={journeyQuests.length}
                                        onPress={() => {
                                            console.log("Open Journey:", journey.title);
                                        }}
                                    />
                                );
                            })}
                        </View>
                    </View>
                )}
            </ScrollView>
            <CreateWorkQuestModal
                visible={isCreateQuestVisible}
                journeys={journeys}
                onClose={() => setIsCreateQuestVisible(false)}
                onCreate={handleCreateQuest}
            />
            <CreateWorkJourneyModal visible={isCreateJourneyVisible} onClose={() => setIsCreateJourneyVisible(false)} onCreate={handleCreateJourney} />
            <WorkQuestActionsModal
                quest={selectedQuest}
                journeys={journeys}
                onClose={() => setSelectedQuest(null)}
                onAssignJourney={handleAssignQuestJourney}
                onToggleComplete={handleToggleQuestComplete}
                onDelete={handleDeleteQuest}
            />
        </AppScreenBackground>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: "transparent",
        },

        content: {
            width: "100%",
            maxWidth: 1180,
            alignSelf: "center",

            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xl,
            paddingBottom: 100,
        },

        brand: {
            fontSize: 12,
            fontWeight: "900",
            letterSpacing: 1,

            color: colours.primary,
        },

        title: {
            marginTop: spacing.xs,

            fontSize: 32,
            lineHeight: 40,
            fontWeight: "900",

            color: colours.text,
        },

        subtitle: {
            marginTop: spacing.xs,

            fontSize: 15,
            lineHeight: 22,

            color: colours.textMuted,
        },

        questSection: {
            gap: spacing.md,
            marginTop: spacing.xl,
        },

        sectionHeader: {
            flexDirection: "row",
            alignItems: "center",

            gap: spacing.sm,
        },

        sectionTitle: {
            fontSize: 13,
            fontWeight: "900",
            letterSpacing: 0.7,

            color: colours.text,
        },

        countBadge: {
            minWidth: 26,
            height: 26,

            alignItems: "center",
            justifyContent: "center",

            paddingHorizontal: 7,

            borderRadius: radius.pill,

            backgroundColor: colours.primarySoft,
        },

        countText: {
            fontSize: 12,
            fontWeight: "800",

            color: colours.primary,
        },

        questList: {
            gap: spacing.sm,
        },
        journeySection: {
            gap: spacing.md,
            marginTop: spacing.xl,
        },

        journeyGrid: {
            flexDirection: "row",
            flexWrap: "wrap",

            gap: spacing.md,
        },
        searchContainer: {
            marginTop: spacing.md,
        },

        searchInput: {
            minHeight: 48,

            paddingHorizontal: spacing.md,
            paddingVertical: 12,

            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.md,

            backgroundColor: colours.surface,

            fontSize: 15,
            color: colours.text,
        },
    });
}
