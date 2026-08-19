import { useMemo, useState, useCallback } from "react";
import { ScrollView, StyleSheet, Text, View, TextInput, Pressable } from "react-native";

import { Folder, FolderPlus, ListTodo } from "lucide-react-native";

import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";
import { CreateWorkQuestModal } from "@/components/work/CreateWorkQuestModal";
import { WorkJourneyCard } from "@/components/work/WorkJourneyCard";
import { WorkQuestCard } from "@/components/work/WorkQuestCard";
import { WorkQuickActions } from "@/components/work/WorkQuickActions";

import type { AppColours } from "@/constants/appearanceColours";
import { layout, radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { CreateWorkJourneyModal } from "@/components/work/CreateWorkJourneyModal";
import type { WorkAssetId, WorkJourney, WorkQuest, WorkStatus } from "@/types/work";
import { WorkToolbar, type WorkStatusFilter, type WorkViewFilter } from "@/components/work/WorkToolbar";
import { WorkQuestActionsModal } from "@/components/work/WorkQuestActionsModal";
import { confirmDelete } from "@/utils/confirmDelete";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { syncJourneyStatusFromQuests } from "@/services/journeyStatusService";
import {
    createRemoteWorkJourney,
    createRemoteWorkQuest,
    deleteRemoteWorkJourney,
    getRemoteWorkJourneys,
    getRemoteWorkQuests,
    updateRemoteWorkQuestJourney,
} from "@/services/work/workService";
import { deleteRemoteQuest, updateRemoteQuestStatus } from "@/services/quests/questService";
import { getActiveFocusSession } from "@/services/storage/activeFocusSessionStorage";
import { showMessage } from "@/utils/showMessage";
import { WorkJourneyActionsModal } from "@/components/work/WorkJourneyActionsModal";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function WorkScreen() {
    const { colours } = useAppearance();
    const { session } = useAuth();

    const router = useRouter();

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
    const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);
    const selectedJourney = journeys.find((journey) => journey.id === selectedJourneyId);
    const [journeyForActions, setJourneyForActions] = useState<WorkJourney | null>(null);

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
        }, [session]),
    );

    const visibleQuests = quests.filter((quest) => {
        if (quest.status !== statusFilter) {
            return false;
        }

        if (selectedJourneyId && quest.journeyId !== selectedJourneyId) {
            return false;
        }

        if (selectedFilter === "journeys" && !quest.journeyId) {
            return false;
        }

        if (selectedFilter === "standalone" && quest.journeyId) {
            return false;
        }

        if (normalisedSearchQuery) {
            const journeyName = getJourneyName(quest.journeyId);

            const matchesQuestTitle = quest.title.toLowerCase().includes(normalisedSearchQuery);

            const matchesJourneyTitle = journeyName?.toLowerCase().includes(normalisedSearchQuery) ?? false;

            if (!matchesQuestTitle && !matchesJourneyTitle) {
                return false;
            }
        }

        return true;
    });

    const emptyQuestMessage = (() => {
        if (normalisedSearchQuery) {
            return "No Quests match your search.";
        }

        if (selectedJourney) {
            return statusFilter === "active" ? "No active Quests in this Journey." : "No completed Quests in this Journey.";
        }

        if (selectedFilter === "standalone") {
            return statusFilter === "active" ? "No standalone Quests yet." : "No completed standalone Quests.";
        }

        if (selectedFilter === "journeys") {
            return statusFilter === "active" ? "No active Journey Quests." : "No completed Journey Quests.";
        }

        return statusFilter === "active" ? "No active Quests yet." : "No completed Quests yet.";
    })();

    const visibleJourneys = journeys.filter((journey) => {
        if (journey.status !== statusFilter) {
            return false;
        }

        if (normalisedSearchQuery && !journey.title.toLowerCase().includes(normalisedSearchQuery)) {
            return false;
        }

        return true;
    });

    const emptyJourneyMessage = statusFilter === "active" ? "No active Journeys yet." : "No completed Journeys yet.";

    const showJourneys = selectedFilter === "all" || selectedFilter === "journeys";

    function handleOpenJourney(journeyId: string) {
        setSelectedJourneyId(journeyId);
        setSelectedFilter("journeys");
    }

    function handleCloseJourney() {
        setSelectedJourneyId(null);
        setSelectedFilter("all");
    }

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
        const nextQuest = quests.find((quest) => {
            if (quest.status !== "active") {
                return false;
            }

            if (selectedJourneyId && quest.journeyId !== selectedJourneyId) {
                return false;
            }

            return true;
        });

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

    async function handleToggleQuestComplete() {
        if (!selectedQuest) {
            return;
        }

        const questToUpdate = selectedQuest;

        const nextStatus: WorkStatus = questToUpdate.status === "completed" ? "active" : "completed";

        try {
            const { error } = await updateRemoteQuestStatus(questToUpdate.id, nextStatus);

            if (error) {
                console.error("Failed to update Work Quest status:", error);

                return;
            }

            const updatedQuests: WorkQuest[] = quests.map((quest) => {
                if (quest.id !== questToUpdate.id) {
                    return quest;
                }

                return {
                    ...quest,
                    status: nextStatus,
                };
            });

            setQuests(updatedQuests);

            if (questToUpdate.journeyId) {
                const journeyQuests = updatedQuests.filter((quest) => quest.journeyId === questToUpdate.journeyId);

                const updatedJourneyStatus = await syncJourneyStatusFromQuests(questToUpdate.journeyId, journeyQuests);

                setJourneys((currentJourneys) =>
                    currentJourneys.map((journey) => {
                        if (journey.id !== questToUpdate.journeyId) {
                            return journey;
                        }

                        return {
                            ...journey,
                            status: updatedJourneyStatus,
                        };
                    }),
                );
            }

            setSelectedQuest(null);
        } catch (error) {
            console.error("Failed to update Work Quest:", error);
        }
    }

    async function handleAssignQuestJourney(journeyId?: string) {
        if (!selectedQuest) {
            return;
        }

        const questToMove = selectedQuest;
        const previousJourneyId = questToMove.journeyId;

        // Nothing is actually changing.
        if (previousJourneyId === journeyId) {
            setSelectedQuest(null);
            return;
        }

        try {
            const { data, error } = await updateRemoteWorkQuestJourney(questToMove.id, journeyId);

            if (error || !data) {
                console.error("Failed to move Work Quest:", error);

                return;
            }

            const updatedQuests: WorkQuest[] = quests.map((quest) => (quest.id === data.id ? data : quest));

            setQuests(updatedQuests);

            // Recalculate the Journey the Quest moved OUT of.
            if (previousJourneyId) {
                const previousJourneyQuests = updatedQuests.filter((quest) => quest.journeyId === previousJourneyId);

                const previousJourneyStatus = await syncJourneyStatusFromQuests(previousJourneyId, previousJourneyQuests);

                setJourneys((currentJourneys) =>
                    currentJourneys.map((journey) =>
                        journey.id === previousJourneyId
                            ? {
                                  ...journey,
                                  status: previousJourneyStatus,
                              }
                            : journey,
                    ),
                );
            }

            // Recalculate the Journey the Quest moved INTO.
            if (journeyId) {
                const newJourneyQuests = updatedQuests.filter((quest) => quest.journeyId === journeyId);

                const newJourneyStatus = await syncJourneyStatusFromQuests(journeyId, newJourneyQuests);

                setJourneys((currentJourneys) =>
                    currentJourneys.map((journey) =>
                        journey.id === journeyId
                            ? {
                                  ...journey,
                                  status: newJourneyStatus,
                              }
                            : journey,
                    ),
                );
            }

            setSelectedQuest(null);
        } catch (error) {
            console.error("Failed to move Work Quest:", error);
        }
    }

    async function handleDeleteQuest() {
        if (!selectedQuest) {
            return;
        }

        const questToDelete = selectedQuest;

        try {
            const activeSession = await getActiveFocusSession();

            const questHasActiveSession = activeSession?.questId === questToDelete.id;

            if (questHasActiveSession) {
                showMessage("Quest has an active session", `End or review the Focus Session for "${questToDelete.title}" before deleting this Quest.`);

                return;
            }

            setSelectedQuest(null);

            confirmDelete({
                title: "Delete Quest?",
                message: `Are you sure you want to delete "${questToDelete.title}"?`,
                onConfirm: () => {
                    void deleteWorkQuest(questToDelete);
                },
            });
        } catch (error) {
            console.error("Failed to check active Focus Session:", error);

            showMessage("Quest could not be deleted", "The active Focus Session could not be checked. Please try again.");
        }
    }

    async function deleteWorkQuest(questToDelete: WorkQuest) {
        try {
            const { error } = await deleteRemoteQuest(questToDelete.id);

            if (error) {
                console.error("Failed to delete Work Quest:", error);

                return;
            }

            const updatedQuests = quests.filter((quest) => quest.id !== questToDelete.id);

            setQuests(updatedQuests);

            if (questToDelete.journeyId) {
                const journeyQuests = updatedQuests.filter((quest) => quest.journeyId === questToDelete.journeyId);

                const updatedJourneyStatus = await syncJourneyStatusFromQuests(questToDelete.journeyId, journeyQuests);

                setJourneys((currentJourneys) =>
                    currentJourneys.map((journey) => {
                        if (journey.id !== questToDelete.journeyId) {
                            return journey;
                        }

                        return {
                            ...journey,
                            status: updatedJourneyStatus,
                        };
                    }),
                );
            }
        } catch (error) {
            console.error("Failed to delete Work Quest:", error);
        }
    }

    function handleDeleteJourney() {
        if (!journeyForActions) {
            return;
        }

        const journeyToDelete = journeyForActions;

        setJourneyForActions(null);

        confirmDelete({
            title: "Delete Journey?",
            message: `Delete "${journeyToDelete.title}"? Its Quests will be kept and moved to No Journey.`,
            onConfirm: () => {
                void deleteWorkJourney(journeyToDelete);
            },
        });
    }

    async function deleteWorkJourney(journeyToDelete: WorkJourney) {
        try {
            const { error } = await deleteRemoteWorkJourney(journeyToDelete.id);

            if (error) {
                console.error("Failed to delete Work Journey:", error);

                return;
            }

            setJourneys((currentJourneys) => currentJourneys.filter((journey) => journey.id !== journeyToDelete.id));

            setQuests((currentQuests) =>
                currentQuests.map((quest) => {
                    if (quest.journeyId !== journeyToDelete.id) {
                        return quest;
                    }

                    const { journeyId: _journeyId, ...standaloneQuest } = quest;

                    return standaloneQuest;
                }),
            );

            if (selectedJourneyId === journeyToDelete.id) {
                setSelectedJourneyId(null);
                setSelectedFilter("all");
            }
        } catch (error) {
            console.error("Failed to delete Work Journey:", error);
        }
    }

    function getJourneyName(journeyId?: string) {
        if (!journeyId) {
            return undefined;
        }

        return journeys.find((journey) => journey.id === journeyId)?.title;
    }

    function handleFocusQuest(quest: WorkQuest) {
        router.push({
            pathname: "/focus/[questId]",
            params: {
                questId: quest.id,
                questTitle: quest.title,
                source: "work",
                ...(quest.journeyId
                    ? {
                          journeyId: quest.journeyId,
                      }
                    : {}),
            },
        });
    }

    return (
        <AppScreenBackground>
            <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <ScreenHeader title="Journeys & Quests" subtitle="Plan the work, keep Journeys optional, and focus on the next useful Quest." />

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

                {selectedJourney && (
                    <View style={styles.openJourneyHeader}>
                        <View style={styles.openJourneyTitleSection}>
                            <Folder size={18} color={colours.primary} />

                            <Text style={styles.openJourneyTitle}>{selectedJourney.title}</Text>
                        </View>

                        <Pressable onPress={handleCloseJourney} style={styles.backToJourneysButton}>
                            <Text style={styles.backToJourneysText}>All Journeys</Text>
                        </Pressable>
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
                        {visibleQuests.length > 0 ? (
                            visibleQuests.map((quest) => (
                                <WorkQuestCard
                                    key={quest.id}
                                    title={quest.title}
                                    journeyName={getJourneyName(quest.journeyId)}
                                    assetId={quest.assetId}
                                    onFocus={() => handleFocusQuest(quest)}
                                    onMore={() => setSelectedQuest(quest)}
                                />
                            ))
                        ) : (
                            <EmptyState
                                icon={<ListTodo size={22} color={colours.primaryStrong} />}
                                title={emptyQuestMessage}
                                description={statusFilter === "active" ? "Create a small, clear Quest and start when you are ready." : "Completed Quests will stay available here for reference."}
                                actionLabel={statusFilter === "active" ? "Create Quest" : undefined}
                                onAction={statusFilter === "active" ? handleNewQuest : undefined}
                            />
                        )}
                    </View>
                </View>

                {showJourneys && !selectedJourneyId && (
                    <View style={styles.journeySection}>
                        <View style={styles.sectionHeader}>
                            <Folder size={19} color={colours.primary} />

                            <Text style={styles.sectionTitle}>{statusFilter === "active" ? "JOURNEYS" : "COMPLETED JOURNEYS"}</Text>
                            <View style={styles.countBadge}>
                                <Text style={styles.countText}>{visibleJourneys.length}</Text>
                            </View>
                        </View>

                        {visibleJourneys.length > 0 ? (
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
                                            onPress={() => handleOpenJourney(journey.id)}
                                            onMore={() => setJourneyForActions(journey)}
                                        />
                                    );
                                })}
                            </View>
                        ) : (
                            <EmptyState
                                icon={<FolderPlus size={22} color={colours.primaryStrong} />}
                                title={emptyJourneyMessage}
                                description="Journeys are optional folders for Quests that belong together."
                                actionLabel={statusFilter === "active" ? "Create Journey" : undefined}
                                onAction={statusFilter === "active" ? handleNewJourney : undefined}
                            />
                        )}
                    </View>
                )}
            </ScrollView>
            <CreateWorkQuestModal
                visible={isCreateQuestVisible}
                journeys={journeys}
                initialJourneyId={selectedJourneyId ?? undefined}
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

            <WorkJourneyActionsModal journey={journeyForActions} onClose={() => setJourneyForActions(null)} onDelete={handleDeleteJourney} />
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
            maxWidth: layout.contentMaxWidth,
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

        openJourneyHeader: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.md,
            marginBottom: spacing.md,
        },

        openJourneyTitleSection: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
        },

        openJourneyTitle: {
            fontSize: 20,
            fontWeight: "800",
            color: colours.text,
        },

        backToJourneysButton: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.pill,
            backgroundColor: colours.surface,
        },

        backToJourneysText: {
            fontSize: 13,
            fontWeight: "700",
            color: colours.text,
        },
    });
}
