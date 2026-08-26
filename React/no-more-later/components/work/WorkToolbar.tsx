import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Search } from "lucide-react-native";

import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

export type WorkViewFilter = "all" | "journeys" | "standalone";
export type WorkStatusFilter = "active" | "completed";

type WorkToolbarProps = {
    selectedFilter: WorkViewFilter;
    statusFilter: WorkStatusFilter;
    isSearchVisible: boolean;
    onSelectFilter: (filter: WorkViewFilter) => void;
    onSearch: () => void;
    onSelectStatus: (status: WorkStatusFilter) => void;
};

const filters: { label: string; value: WorkViewFilter }[] = [
    { label: "All work", value: "all" },
    { label: "In Journeys", value: "journeys" },
    { label: "Standalone", value: "standalone" },
];

export function WorkToolbar({ selectedFilter, statusFilter, isSearchVisible, onSelectFilter, onSearch, onSelectStatus }: WorkToolbarProps) {
    const { width } = useWindowDimensions();
    const { colours } = useAppearance();
    const isMobile = width < 700;
    const styles = useMemo(() => createStyles(colours, isMobile), [colours, isMobile]);

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <SegmentedControl
                    value={statusFilter}
                    onChange={onSelectStatus}
                    style={styles.statusControl}
                    options={[
                        { value: "active", label: "Active" },
                        { value: "completed", label: "Completed" },
                    ]}
                />

                <AnimatedPressable
                    accessibilityLabel={isSearchVisible ? "Close work search" : "Search work"}
                    onPress={onSearch}
                    style={[styles.searchButton, isSearchVisible && styles.activeSearchButton]}
                >
                    <Search size={17} color={isSearchVisible ? colours.primaryStrong : colours.textMuted} />
                    <Text style={[styles.searchText, isSearchVisible && styles.activeSearchText]}>{isSearchVisible ? "Close" : "Search"}</Text>
                </AnimatedPressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                {filters.map((filter) => {
                    const isSelected = selectedFilter === filter.value;
                    return (
                        <AnimatedPressable
                            key={filter.value}
                            style={[styles.filterButton, isSelected && styles.filterButtonSelected]}
                            onPress={() => onSelectFilter(filter.value)}
                        >
                            <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>{filter.label}</Text>
                        </AnimatedPressable>
                    );
                })}
            </ScrollView>
        </View>
    );
}

function createStyles(colours: AppColours, isMobile: boolean) {
    return StyleSheet.create({
        container: {
            marginTop: spacing.md,
            padding: spacing.sm,
            gap: spacing.sm,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },
        topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
        statusControl: {
            flex: isMobile ? 1 : undefined,
            width: isMobile ? undefined : 232,
        },
        searchButton: {
            minHeight: 42,
            paddingHorizontal: spacing.md,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,
            backgroundColor: colours.surface,
        },
        activeSearchButton: { borderColor: colours.primaryBorder, backgroundColor: colours.primarySubtle },
        searchText: { fontSize: 12, fontWeight: "700", color: colours.textMuted },
        activeSearchText: { color: colours.primaryStrong },
        filterContainer: { gap: spacing.xs },
        filterButton: { minHeight: 36, justifyContent: "center", paddingHorizontal: spacing.md, borderRadius: radius.pill },
        filterButtonSelected: { backgroundColor: colours.primary },
        filterText: { fontSize: 12, fontWeight: "700", color: colours.textMuted },
        filterTextSelected: { color: colours.onPrimary },
    });
}
