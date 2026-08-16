import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { Check, LockKeyhole } from "lucide-react-native";

import { ACCENT_COLOUR_OPTIONS, COLOUR_MODE_OPTIONS } from "@/constants/appearance";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { useMemo, useState } from "react";
import type { AppColours } from "@/constants/appearanceColours";
import { usePremium } from "@/contexts/PremiumContext";
import { PremiumUpsellModal } from "@/components/premium/PremiumUpsellModal";
import type { AccentColourId, ColourMode } from "@/types/appearance";

type RequestedPremiumFeature =
    | {
          type: "mode";
          id: ColourMode;
          label: string;
      }
    | {
          type: "accent";
          id: AccentColourId;
          label: string;
      };

export default function AppearanceScreen() {
    const { colourMode, accentColour, colours, setColourMode, setAccentColour } = useAppearance();
    const [requestedPremiumFeature, setRequestedPremiumFeature] = useState<RequestedPremiumFeature | null>(null);
    const { hasPremium, setDevelopmentPremium } = usePremium();

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
                        const isLocked = option.requiresPremium && !hasPremium;

                        return (
                            <View key={option.id}>
                                <Pressable
                                    style={({ pressed }) => [styles.modeRow, isLocked && styles.lockedOption, pressed && !isLocked && styles.optionPressed]}
                                    onPress={() => {
                                        if (isLocked) {
                                            const label =
                                                option.id === "system" ? "System appearance" : option.id === "amoled" ? "AMOLED mode" : `${option.name} mode`;

                                            setRequestedPremiumFeature({
                                                type: "mode",
                                                id: option.id,
                                                label,
                                            });

                                            return;
                                        }

                                        setColourMode(option.id);
                                    }}
                                >
                                    <View style={[styles.radio, isSelected && styles.radioSelected]}>{isSelected && <View style={styles.radioDot} />}</View>
                                    <View style={styles.modeDetails}>
                                        <Text style={styles.modeName}>{option.name}</Text>

                                        <Text style={styles.modeDescription}>{option.description}</Text>
                                    </View>
                                    {isLocked && (
                                        <View style={styles.lockBadge}>
                                            <LockKeyhole size={14} color={colours.textMuted} />

                                            <Text style={styles.lockText}>Premium</Text>
                                        </View>
                                    )}
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
                            const isLocked = option.requiresPremium && !hasPremium;

                            return (
                                <Pressable
                                    key={option.id}
                                    style={({ pressed }) => [
                                        styles.accentOption,
                                        isLocked && styles.lockedAccentOption,
                                        pressed && !isLocked && styles.accentOptionPressed,
                                    ]}
                                    onPress={() => {
                                        if (isLocked) {
                                            setRequestedPremiumFeature({
                                                type: "accent",
                                                id: option.id,
                                                label: `${option.name} accent`,
                                            });

                                            return;
                                        }

                                        setAccentColour(option.id);
                                    }}
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
                                            {isLocked ? (
                                                <View style={styles.accentLock}>
                                                    <LockKeyhole size={15} strokeWidth={2.5} color="#ffffff" />
                                                </View>
                                            ) : (
                                                isSelected && <Check size={16} strokeWidth={3} color="#ffffff" />
                                            )}
                                        </View>
                                    </View>

                                    <Text style={[styles.accentName, isSelected && styles.accentNameSelected]}>{option.name}</Text>

                                    {isLocked && <Text style={styles.premiumAccentLabel}>Premium</Text>}
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            </View>
            {__DEV__ && (
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>DEVELOPMENT</Text>

                    <View style={styles.developmentCard}>
                        <View style={styles.developmentDetails}>
                            <Text style={styles.developmentTitle}>Premium status</Text>

                            <Text style={styles.developmentDescription}>Simulate free and Premium users while developing.</Text>
                        </View>

                        <View style={styles.developmentButtons}>
                            <Pressable
                                style={[styles.developmentButton, !hasPremium && styles.developmentButtonSelected]}
                                onPress={() => setDevelopmentPremium(false)}
                            >
                                <Text style={[styles.developmentButtonText, !hasPremium && styles.developmentButtonTextSelected]}>Free</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.developmentButton, hasPremium && styles.developmentButtonSelected]}
                                onPress={() => setDevelopmentPremium(true)}
                            >
                                <Text style={[styles.developmentButtonText, hasPremium && styles.developmentButtonTextSelected]}>Premium</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            )}

            <PremiumUpsellModal
                visible={requestedPremiumFeature !== null}
                requestedFeature={requestedPremiumFeature?.label ?? null}
                onClose={() => {
                    setRequestedPremiumFeature(null);
                }}
                onUnlock={() => {
                    if (!requestedPremiumFeature) {
                        return;
                    }

                    setDevelopmentPremium(true);

                    if (requestedPremiumFeature.type === "mode") {
                        setColourMode(requestedPremiumFeature.id);
                    } else {
                        setAccentColour(requestedPremiumFeature.id);
                    }

                    setRequestedPremiumFeature(null);
                }}
            />
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

        lockedOption: {
            opacity: 0.6,
        },

        lockBadge: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.xs,

            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,

            borderRadius: radius.pill,

            backgroundColor: colours.background,
        },

        lockText: {
            fontSize: 10,
            fontWeight: "700",

            color: colours.textMuted,
        },

        lockedAccentOption: {
            opacity: 0.65,
        },

        accentLock: {
            width: 26,
            height: 26,

            alignItems: "center",
            justifyContent: "center",

            borderRadius: radius.pill,

            backgroundColor: "rgba(0, 0, 0, 0.28)",
        },

        premiumAccentLabel: {
            marginTop: 2,

            fontSize: 9,
            fontWeight: "700",

            color: colours.textMuted,
        },

        developmentCard: {
            gap: spacing.md,

            padding: spacing.md,

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,

            backgroundColor: colours.surface,
        },

        developmentDetails: {
            gap: spacing.xs,
        },

        developmentTitle: {
            fontSize: 15,
            fontWeight: "700",

            color: colours.text,
        },

        developmentDescription: {
            fontSize: 12,
            lineHeight: 18,

            color: colours.textMuted,
        },

        developmentButtons: {
            flexDirection: "row",
            gap: spacing.sm,
        },

        developmentButton: {
            flex: 1,

            alignItems: "center",
            justifyContent: "center",

            minHeight: 40,

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,

            backgroundColor: colours.background,
        },

        developmentButtonSelected: {
            borderColor: colours.primary,
            backgroundColor: colours.primarySoft,
        },

        developmentButtonText: {
            fontSize: 13,
            fontWeight: "700",

            color: colours.textMuted,
        },

        developmentButtonTextSelected: {
            color: colours.primary,
        },
    });
}
