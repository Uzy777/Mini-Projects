import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { Check } from "lucide-react-native";

import { ACCENT_COLOUR_OPTIONS, COLOUR_MODE_OPTIONS } from "@/constants/appearance";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { useMemo } from "react";
import type { AppColours } from "@/constants/appearanceColours";

export default function AppearanceScreen() {
    const { colourMode, accentColour, colours, setColourMode, setAccentColour } = useAppearance();

    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            <Stack.Screen options={{ title: "Appearance" }} />

            <View style={styles.header}>
                <Text style={styles.label}>APPEARANCE</Text>

                <Text style={styles.title}>Make it yours</Text>

                <Text style={styles.description}>Choose how No More Later looks and feels.</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionLabel}>COLOUR MODE</Text>

                <View style={styles.modeCard}>
                    {COLOUR_MODE_OPTIONS.map((option, index) => {
                        const isSelected = option.id === colourMode;

                        return (
                            <View key={option.id}>
                                <Pressable style={({ pressed }) => [styles.modeRow, pressed && styles.optionPressed]} onPress={() => setColourMode(option.id)}>
                                    <View style={[styles.radio, isSelected && styles.radioSelected]}>{isSelected && <View style={styles.radioDot} />}</View>

                                    <View style={styles.modeDetails}>
                                        <Text style={styles.modeName}>{option.name}</Text>

                                        <Text style={styles.modeDescription}>{option.description}</Text>
                                    </View>
                                </Pressable>

                                {index < COLOUR_MODE_OPTIONS.length - 1 && <View style={styles.divider} />}
                            </View>
                        );
                    })}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionLabel}>ACCENT COLOUR</Text>

                <View style={styles.accentCard}>
                    <View style={styles.accentGrid}>
                        {ACCENT_COLOUR_OPTIONS.map((option) => {
                            const isSelected = option.id === accentColour;

                            return (
                                <Pressable
                                    key={option.id}
                                    style={({ pressed }) => [styles.accentOption, pressed && styles.accentOptionPressed]}
                                    onPress={() => setAccentColour(option.id)}
                                >
                                    <View
                                        style={[
                                            styles.accentSelectionRing,
                                            isSelected && {
                                                borderColor: option.previewColour,
                                            },
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.accentSwatch,
                                                {
                                                    backgroundColor: option.previewColour,
                                                },
                                            ]}
                                        >
                                            {isSelected && <Check size={16} strokeWidth={3} color="#ffffff" />}
                                        </View>
                                    </View>

                                    <Text style={[styles.accentName, isSelected && styles.accentNameSelected]}>{option.name}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: colours.background,
        },

        contentContainer: {
            width: "100%",
            maxWidth: 640,
            alignSelf: "center",
            padding: spacing.lg,
            paddingBottom: 48,
        },

        header: {
            marginBottom: spacing.xl,
        },

        label: {
            fontSize: 12,
            fontWeight: "800",
            letterSpacing: 0.8,
            color: colours.primary,
        },

        title: {
            marginTop: spacing.sm,
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

        section: {
            marginBottom: spacing.xl,
        },

        sectionLabel: {
            marginBottom: spacing.sm,
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 0.8,
            color: colours.textMuted,
        },

        modeCard: {
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
            overflow: "hidden",
        },

        modeRow: {
            minHeight: 68,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
        },

        radio: {
            width: 20,
            height: 20,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: colours.border,
            borderRadius: radius.pill,
        },

        radioSelected: {
            borderColor: colours.primary,
        },

        radioDot: {
            width: 10,
            height: 10,
            borderRadius: radius.pill,
            backgroundColor: colours.primary,
        },

        modeDetails: {
            flex: 1,
        },

        modeName: {
            fontSize: 15,
            fontWeight: "700",
            color: colours.text,
        },

        modeDescription: {
            marginTop: 2,
            fontSize: 12,
            color: colours.textMuted,
        },

        divider: {
            height: 1,
            marginLeft: 52,
            backgroundColor: colours.border,
        },

        accentCard: {
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },

        accentGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            rowGap: spacing.lg,
        },

        accentOption: {
            width: "33.333%",
            alignItems: "center",
        },

        accentSelectionRing: {
            width: 48,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: "transparent",
            borderRadius: radius.pill,
        },

        accentSwatch: {
            width: 38,
            height: 38,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
        },

        accentName: {
            marginTop: spacing.xs,
            fontSize: 12,
            fontWeight: "600",
            color: colours.textMuted,
        },

        accentNameSelected: {
            fontWeight: "700",
            color: colours.text,
        },
        optionPressed: {
            backgroundColor: colours.primarySoft,
        },

        accentOptionPressed: {
            opacity: 0.7,
        },
    });
}
