import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { Filter, Search } from "lucide-react-native";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

export type WorkViewFilter = "all" | "quests" | "journeys" | "standalone";

export type WorkStatusFilter = "active" | "completed";

type WorkToolbarProps = {
    selectedFilter: WorkViewFilter;
    statusFilter: WorkStatusFilter;
    onSelectFilter: (filter: WorkViewFilter) => void;
    onSearch: () => void;
    onStatusFilter: () => void;
};

const filters: {
    label: string;
    value: WorkViewFilter;
}[] = [
    {
        label: "All",
        value: "all",
    },
    {
        label: "My Quests",
        value: "quests",
    },
    {
        label: "By Journey",
        value: "journeys",
    },
    {
        label: "No Journey",
        value: "standalone",
    },
];

export function WorkToolbar({ selectedFilter, statusFilter, onSelectFilter, onSearch, onStatusFilter }: WorkToolbarProps) {
    const { width } = useWindowDimensions();
    const { colours } = useAppearance();

    const isMobile = width < 700;

    const styles = useMemo(() => createStyles(colours, isMobile), [colours, isMobile]);

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                {filters.map((filter) => {
                    const isSelected = selectedFilter === filter.value;

                    return (
                        <Pressable
                            key={filter.value}
                            style={[styles.filterButton, isSelected && styles.filterButtonSelected]}
                            onPress={() => onSelectFilter(filter.value)}
                        >
                            <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>{filter.label}</Text>
                        </Pressable>
                    );
                })}
            </ScrollView>

            <View style={styles.actions}>
                <Pressable style={styles.actionButton} onPress={onSearch}>
                    <Search size={18} color={colours.textMuted} />

                    <Text style={styles.actionText}>Search</Text>
                </Pressable>

                <Pressable style={styles.actionButton} onPress={onStatusFilter}>
                    <Filter size={18} color={colours.textMuted} />
                    <Text style={styles.actionText}>{statusFilter === "active" ? "Active" : "Completed"}</Text>{" "}
                </Pressable>
            </View>
        </View>
    );
}

function createStyles(colours: AppColours, isMobile: boolean) {
    return StyleSheet.create({
        container: {
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "stretch" : "center",
            justifyContent: "space-between",

            gap: spacing.md,
            marginTop: spacing.lg,
        },

        filterContainer: {
            gap: spacing.sm,
        },

        filterButton: {
            minHeight: 44,

            justifyContent: "center",

            paddingHorizontal: spacing.lg,

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,

            backgroundColor: colours.surface,
        },

        filterButtonSelected: {
            borderColor: colours.primary,
            backgroundColor: colours.primary,
        },

        filterText: {
            fontSize: 13,
            fontWeight: "700",

            color: colours.text,
        },

        filterTextSelected: {
            color: colours.surface,
        },

        actions: {
            flexDirection: "row",
            gap: spacing.sm,
        },

        actionButton: {
            flex: isMobile ? 1 : undefined,

            minHeight: 44,

            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",

            gap: spacing.sm,
            paddingHorizontal: spacing.md,

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,

            backgroundColor: colours.surface,
        },

        actionText: {
            fontSize: 13,
            fontWeight: "700",

            color: colours.textMuted,
        },
    });
}
