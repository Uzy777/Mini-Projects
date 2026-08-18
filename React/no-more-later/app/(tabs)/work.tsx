import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AppScreenBackground } from "@/components/appearance/AppScreenBackground";
import type { AppColours } from "@/constants/appearanceColours";
import { spacing, radius } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { WorkQuickActions } from "@/components/work/WorkQuickActions";
import { WorkToolbar, type WorkViewFilter } from "@/components/work/WorkToolbar";
import { WorkQuestCard } from "@/components/work/WorkQuestCard";

export default function WorkScreen() {
    const exampleQuests = [
        {
            id: "1",
            title: "Finish authentication screen",
            journeyName: "Portfolio Website",
        },
        {
            id: "2",
            title: "Revise IAM policies",
            journeyName: "AWS Certification",
        },
        {
            id: "3",
            title: "Clean the desk",
        },
    ];

    const [selectedFilter, setSelectedFilter] = useState<WorkViewFilter>("all");

    const { colours } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    function handleSearch() {
        console.log("Search");
    }

    function handleStatusFilter() {
        console.log("Status filter");
    }

    function handleNewQuest() {
        console.log("New Quest");
    }

    function handleNewJourney() {
        console.log("New Journey");
    }

    function handleQuickStart() {
        console.log("Quick Start");
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
                            <Text style={styles.countText}>{exampleQuests.length}</Text>
                        </View>
                    </View>

                    <View style={styles.questList}>
                        {exampleQuests.map((quest) => (
                            <WorkQuestCard
                                key={quest.id}
                                title={quest.title}
                                journeyName={quest.journeyName}
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
            </ScrollView>
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
    });
}
