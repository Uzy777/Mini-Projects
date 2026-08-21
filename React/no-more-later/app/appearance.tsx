import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Check, Image, LockKeyhole, Palette, SunMoon, Timer } from "lucide-react-native";

import { ACCENT_COLOUR_OPTIONS, COLOUR_MODE_OPTIONS, BACKDROP_OPTIONS, TIMER_STYLE_OPTIONS } from "@/constants/appearance";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { useMemo, useState } from "react";
import type { AppColours } from "@/constants/appearanceColours";
import { usePremium } from "@/contexts/PremiumContext";
import { PremiumUpsellModal } from "@/components/premium/PremiumUpsellModal";
import type { AccentColourId, ColourMode, BackdropId, TimerStyleId } from "@/types/appearance";
import { AppBackdrop } from "@/components/appearance/AppBackdrop";
import { TimerStylePreview } from "@/components/appearance/TimerStylePreview";

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
      }
    | {
          type: "backdrop";
          id: BackdropId;
          label: string;
      }
    | {
          type: "timer";
          id: TimerStyleId;
          label: string;
      };

export default function AppearanceScreen() {
    const router = useRouter();

    const { colourMode, accentColour, backdrop, timerStyle, colours, setColourMode, setAccentColour, setBackdrop, setTimerStyle } = useAppearance();
    const [requestedPremiumFeature, setRequestedPremiumFeature] = useState<RequestedPremiumFeature | null>(null);
    const { hasPremium } = usePremium();

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
                <View style={styles.sectionHeading}>
                    <View style={styles.sectionIcon}>
                        <SunMoon size={18} color={colours.primary} />
                    </View>
                    <View style={styles.sectionHeadingCopy}>
                        <Text style={styles.sectionTitle}>Colour mode</Text>
                        <Text style={styles.sectionDescription}>Choose how light and dark surfaces behave.</Text>
                    </View>
                </View>

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
                <View style={styles.sectionHeading}>
                    <View style={styles.sectionIcon}>
                        <Palette size={18} color={colours.primary} />
                    </View>
                    <View style={styles.sectionHeadingCopy}>
                        <Text style={styles.sectionTitle}>Accent colour</Text>
                        <Text style={styles.sectionDescription}>Set the colour used for actions, progress and highlights.</Text>
                    </View>
                </View>

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

            <View style={styles.section}>
                <View style={styles.sectionHeading}>
                    <View style={styles.sectionIcon}>
                        <Timer size={18} color={colours.primary} />
                    </View>
                    <View style={styles.sectionHeadingCopy}>
                        <Text style={styles.sectionTitle}>Timer style</Text>
                        <Text style={styles.sectionDescription}>Choose the timer face used for Quick Focus, breaks and Tasks.</Text>
                    </View>
                </View>

                <View style={styles.timerStyleGrid}>
                    {TIMER_STYLE_OPTIONS.map((option) => {
                        const isSelected = option.id === timerStyle;
                        const isLocked = option.requiresPremium && !hasPremium;

                        return (
                            <Pressable
                                key={option.id}
                                accessibilityRole="radio"
                                accessibilityState={{ checked: isSelected, disabled: isLocked }}
                                accessibilityLabel={`${option.name} timer style${isLocked ? ", Premium" : ""}`}
                                style={({ pressed }) => [
                                    styles.timerStyleOption,
                                    isSelected && styles.timerStyleOptionSelected,
                                    isLocked && styles.timerStyleOptionLocked,
                                    pressed && styles.timerStyleOptionPressed,
                                ]}
                                onPress={() => {
                                    if (isLocked) {
                                        setRequestedPremiumFeature({ type: "timer", id: option.id, label: `${option.name} timer style` });
                                        return;
                                    }

                                    setTimerStyle(option.id);
                                }}
                            >
                                <View style={styles.timerPreviewWrap}>
                                    <TimerStylePreview timerStyle={option.id} />
                                    {isLocked ? (
                                        <View style={styles.timerLock}>
                                            <LockKeyhole size={15} strokeWidth={2.5} color={colours.onPrimary} />
                                        </View>
                                    ) : isSelected ? (
                                        <View style={styles.timerCheck}>
                                            <Check size={13} strokeWidth={3} color={colours.onPrimary} />
                                        </View>
                                    ) : null}
                                </View>

                                <View style={styles.timerStyleDetails}>
                                    <Text style={[styles.timerStyleName, isSelected && styles.timerStyleNameSelected]}>{option.name}</Text>
                                    {/* <Text style={styles.timerStyleDescription}>{option.description}</Text> */}
                                    {/* <Text style={[styles.timerStyleAccess, !option.requiresPremium && styles.timerStyleIncluded]}>{option.requiresPremium ? "Premium" : "Included"}</Text> */}
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            <PremiumUpsellModal
                visible={requestedPremiumFeature !== null}
                requestedFeature={requestedPremiumFeature?.label ?? null}
                onClose={() => {
                    setRequestedPremiumFeature(null);
                }}
                onUnlock={() => {
                    setRequestedPremiumFeature(null);
                    router.push("/premium");
                }}
            />

            <View style={styles.section}>
                <View style={styles.sectionHeading}>
                    <View style={styles.sectionIcon}>
                        <Image size={18} color={colours.primary} />
                    </View>
                    <View style={styles.sectionHeadingCopy}>
                        <Text style={styles.sectionTitle}>Backdrop</Text>
                        <Text style={styles.sectionDescription}>Add subtle scenery behind the app’s content.</Text>
                    </View>
                </View>

                <View style={styles.backdropGrid}>
                    {BACKDROP_OPTIONS.map((option) => {
                        const isLocked = option.requiresPremium && !hasPremium;

                        const isSelected = option.id === backdrop;

                        return (
                            <Pressable
                                key={option.id}
                                style={({ pressed }) => [
                                    styles.backdropOption,

                                    isSelected && styles.backdropOptionSelected,

                                    isLocked && styles.backdropOptionLocked,

                                    pressed && !isLocked && styles.backdropOptionPressed,
                                ]}
                                onPress={() => {
                                    if (isLocked) {
                                        setRequestedPremiumFeature({
                                            type: "backdrop",
                                            id: option.id,
                                            label: `${option.name} backdrop`,
                                        });

                                        return;
                                    }

                                    setBackdrop(option.id);
                                }}
                            >
                                <View style={[styles.backdropPreview, isSelected && styles.backdropPreviewSelected]}>
                                    <AppBackdrop backdropOverride={option.id} preview />

                                    {isLocked && (
                                        <View style={styles.backdropLock}>
                                            <LockKeyhole size={16} strokeWidth={2.5} color="#ffffff" />
                                        </View>
                                    )}

                                    {isSelected && !isLocked && (
                                        <View style={styles.backdropCheck}>
                                            <Check size={13} strokeWidth={3} color="#ffffff" />
                                        </View>
                                    )}
                                </View>

                                <Text style={[styles.backdropName, isSelected && styles.backdropNameSelected]}>{option.name}</Text>

                                {isLocked && <Text style={styles.backdropPremiumLabel}>Premium</Text>}
                            </Pressable>
                        );
                    })}
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

        sectionHeading: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            marginBottom: spacing.md,
        },

        sectionIcon: {
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.md,
            backgroundColor: colours.primarySoft,
        },

        sectionHeadingCopy: {
            flex: 1,
        },

        sectionTitle: {
            fontSize: 16,
            fontWeight: "800",
            color: colours.text,
        },

        sectionDescription: {
            marginTop: 2,
            fontSize: 12,
            lineHeight: 17,
            color: colours.textMuted,
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

        timerStyleGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.md,
        },

        timerStyleOption: {
            width: "47%",
            gap: spacing.sm,
            padding: spacing.sm,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },

        timerStyleOptionSelected: {
            borderColor: colours.primary,
            backgroundColor: colours.primarySubtle,
        },

        timerStyleOptionLocked: {
            opacity: 0.78,
        },

        timerStyleOptionPressed: {
            transform: [{ scale: 0.985 }],
        },

        timerPreviewWrap: {
            position: "relative",
        },

        timerLock: {
            position: "absolute",
            top: spacing.sm,
            right: spacing.sm,
            width: 28,
            height: 28,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
            backgroundColor: colours.primaryStrong,
        },

        timerCheck: {
            position: "absolute",
            top: spacing.sm,
            right: spacing.sm,
            width: 26,
            height: 26,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
            backgroundColor: colours.primary,
        },

        timerStyleDetails: {
            // minHeight: 76,
        },

        timerStyleName: {
            fontSize: 14,
            fontWeight: "800",
            color: colours.text,
            textAlign: "center",
        },

        timerStyleNameSelected: {
            color: colours.primaryStrong,
        },

        timerStyleDescription: {
            marginTop: 3,
            fontSize: 11,
            lineHeight: 16,
            color: colours.textMuted,
        },

        timerStyleAccess: {
            marginTop: spacing.xs,
            fontSize: 9,
            fontWeight: "800",
            letterSpacing: 0.5,
            textTransform: "uppercase",
            color: colours.primary,
        },

        timerStyleIncluded: {
            color: colours.success,
        },

        backdropCard: {
            overflow: "hidden",

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,

            backgroundColor: colours.surface,
        },

        backdropRow: {
            flexDirection: "row",
            alignItems: "center",

            gap: spacing.md,

            padding: spacing.md,
        },

        backdropDetails: {
            flex: 1,

            gap: spacing.xs,
        },

        backdropDescription: {
            fontSize: 12,
            lineHeight: 17,

            color: colours.textMuted,
        },
        backdropSectionDescription: {
            marginTop: -spacing.xs,

            fontSize: 12,
            lineHeight: 18,

            color: colours.textMuted,
        },

        backdropGrid: {
            flexDirection: "row",
            flexWrap: "wrap",

            gap: spacing.md,
        },

        backdropOption: {
            width: "47%",

            gap: spacing.sm,

            padding: spacing.sm,

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,

            backgroundColor: colours.surface,
        },

        backdropOptionSelected: {
            borderColor: colours.primary,
            backgroundColor: colours.primarySoft,
        },

        backdropOptionPressed: {
            opacity: 0.75,
        },

        backdropPreview: {
            position: "relative",

            height: 90,

            overflow: "hidden",

            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,

            backgroundColor: colours.background,
        },

        backdropPreviewSelected: {
            borderColor: colours.primaryBorder,
        },

        backdropCheck: {
            position: "absolute",

            top: spacing.sm,
            right: spacing.sm,

            width: 24,
            height: 24,

            alignItems: "center",
            justifyContent: "center",

            borderRadius: radius.pill,

            backgroundColor: colours.primary,
        },

        backdropName: {
            fontSize: 13,
            fontWeight: "700",
            textAlign: "center",

            color: colours.textMuted,
        },

        backdropNameSelected: {
            color: colours.primary,
        },
        backdropOptionLocked: {
            opacity: 0.7,
        },

        backdropLock: {
            position: "absolute",

            top: spacing.sm,
            right: spacing.sm,

            width: 28,
            height: 28,

            alignItems: "center",
            justifyContent: "center",

            borderRadius: radius.pill,

            backgroundColor: "rgba(0, 0, 0, 0.45)",
        },

        backdropPremiumLabel: {
            marginTop: -spacing.xs,

            fontSize: 9,
            fontWeight: "700",
            textAlign: "center",

            color: colours.textMuted,
        },
    });
}
