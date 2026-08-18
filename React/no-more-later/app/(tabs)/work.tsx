import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Folder } from "lucide-react-native";

import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";
import { CreateWorkQuestModal } from "@/components/work/CreateWorkQuestModal";
import { WorkJourneyCard } from "@/components/work/WorkJourneyCard";
import { WorkQuestCard } from "@/components/work/WorkQuestCard";
import { WorkQuickActions } from "@/components/work/WorkQuickActions";
import { WorkToolbar, type WorkViewFilter } from "@/components/work/WorkToolbar";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { CreateWorkJourneyModal } from "@/components/work/CreateWorkJourneyModal";
import type { WorkAssetId, WorkJourney, WorkQuest } from "@/types/work";

const exampleQuests: WorkQuest[] = [
    {
        id: "auth",
        title: "Finish authentication screen",
        status: "active",
        journeyId: "portfolio",
        assetId: "laptop",
    },
    {
        id: "iam",
        title: "Revise IAM policies",
        status: "active",
        journeyId: "aws",
        assetId: "cloud",
    },
    {
        id: "clean-desk",
        title: "Clean the desk",
        status: "active",
        assetId: "home",
    },
    {
        id: "projects-section",
        title: "Build projects section",
        status: "completed",
        journeyId: "portfolio",
        assetId: "laptop",
    },
    {
        id: "dark-mode",
        title: "Add dark mode",
        status: "completed",
        journeyId: "portfolio",
        assetId: "creative",
    },
];

const exampleJourneys: WorkJourney[] = [
    {
        id: "portfolio",
        title: "Portfolio Website",
        status: "active",
    },
    {
        id: "aws",
        title: "AWS Certification",
        status: "active",
    },
    {
        id: "fitness",
        title: "Health & Fitness",
        status: "active",
    },
];

export default function WorkScreen() {
    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    const [selectedFilter, setSelectedFilter] = useState<WorkViewFilter>("all");

    const [quests, setQuests] = useState<WorkQuest[]>(exampleQuests);
    const [journeys, setJourneys] = useState<WorkJourney[]>(exampleJourneys);

    const [isCreateJourneyVisible, setIsCreateJourneyVisible] = useState(false);

    const [isCreateQuestVisible, setIsCreateQuestVisible] = useState(false);

    const activeQuests = quests.filter((quest) => quest.status === "active");

    function handleSearch() {
        console.log("Search");
    }

    function handleStatusFilter() {
        console.log("Status filter");
    }

    function handleNewQuest() {
        setIsCreateQuestVisible(true);
    }

    function handleNewJourney() {
        setIsCreateJourneyVisible(true);
    }

    function handleQuickStart() {
        console.log("Quick Start");
    }

    function handleCreateQuest(title: string, assetId: WorkAssetId, journeyId?: string) {
        const newQuest: WorkQuest = {
            id: Date.now().toString(),
            title,
            status: "active",
            assetId,
            ...(journeyId ? { journeyId } : {}),
        };

        setQuests((currentQuests) => [newQuest, ...currentQuests]);

        setIsCreateQuestVisible(false);
    }

    function handleCreateJourney(title: string) {
        const newJourney: WorkJourney = {
            id: Date.now().toString(),
            title,
            status: "active",
        };

        setJourneys((currentJourneys) => [newJourney, ...currentJourneys]);

        setIsCreateJourneyVisible(false);
    }

    function getJourneyName(journeyId?: string) {
        if (!journeyId) {
            return undefined;
        }

        return journeys.find((journey) => journey.id === journeyId)?.title;
    }

    return (
        <AppScreenBackground>
            <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.brand}>NO MORE LATER</Text>

                <Text style={styles.title}>Journeys & Quests</Text>

                <Text style={styles.subtitle}>Everything you want to get done.</Text>

                <WorkQuickActions onNewQuest={handleNewQuest} onNewJourney={handleNewJourney} onQuickStart={handleQuickStart} />

                <WorkToolbar selectedFilter={selectedFilter} onSelectFilter={setSelectedFilter} onSearch={handleSearch} onStatusFilter={handleStatusFilter} />

                <View style={styles.questSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>ACTIVE QUESTS</Text>

                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{activeQuests.length}</Text>
                        </View>
                    </View>

                    <View style={styles.questList}>
                        {activeQuests.map((quest) => (
                            <WorkQuestCard
                                key={quest.id}
                                title={quest.title}
                                assetId={quest.assetId}
                                journeyName={getJourneyName(quest.journeyId)}
                                onFocus={() => {
                                    console.log("Focus:", quest.title);
                                }}
                                onMore={() => {
                                    console.log("More:", quest.title);
                                }}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.journeySection}>
                    <View style={styles.sectionHeader}>
                        <Folder size={19} color={colours.primary} />

                        <Text style={styles.sectionTitle}>JOURNEYS</Text>

                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{journeys.length}</Text>
                        </View>
                    </View>

                    <View style={styles.journeyGrid}>
                        {journeys.map((journey) => {
                            const journeyQuests = quests.filter((quest) => quest.journeyId === journey.id);

                            const completedQuestCount = journeyQuests.filter((quest) => quest.status === "completed").length;

                            return (
                                <WorkJourneyCard
                                    key={journey.id}
                                    title={journey.title}
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
            </ScrollView>
            <CreateWorkQuestModal
                visible={isCreateQuestVisible}
                journeys={journeys}
                onClose={() => setIsCreateQuestVisible(false)}
                onCreate={handleCreateQuest}
            />
            <CreateWorkJourneyModal visible={isCreateJourneyVisible} onClose={() => setIsCreateJourneyVisible(false)} onCreate={handleCreateJourney} />
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
    });
}
