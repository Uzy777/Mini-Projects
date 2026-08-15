import { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { colours, radius, spacing } from "@/constants/design";
import { getFocusRank } from "@/utils/rank";
import { getRankImage } from "@/utils/rankImage";

type LevelUpCelebrationProps = {
    previousLevel: number;
    newLevel: number;
    earnedXp: number;
    onContinue: () => void;
};

type RankMedallionProps = {
    level: number;
};

function RankMedallion({ level }: RankMedallionProps) {
    const rank = getFocusRank(level);

    if (!rank) {
        return null;
    }

    const image = getRankImage(rank.id);

    const totalRankSteps = rank.maximumLevel !== null ? rank.maximumLevel - rank.minimumLevel : 0;

    const completedRankSteps = level - rank.minimumLevel;

    return (
        <View style={styles.badgeContainer}>
            <View style={styles.imageFrame}>
                <Animated.Image source={image} style={styles.image} resizeMode="contain" />
            </View>

            {totalRankSteps > 0 && (
                <View style={styles.rankTray}>
                    {Array.from({ length: totalRankSteps }).map((_, index) => {
                        const isCompleted = index < completedRankSteps;

                        return (
                            <View key={index} style={styles.rankDiamondSlot}>
                                <View style={[styles.staticRankDiamond, isCompleted ? styles.staticRankDiamondCompleted : styles.staticRankDiamondRemaining]} />
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
}

export function LevelUpCelebration({ previousLevel, newLevel, earnedXp, onContinue }: LevelUpCelebrationProps) {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.9)).current;

    const previousRank = getFocusRank(previousLevel);
    const newRank = getFocusRank(newLevel);

    const rankChanged = previousRank !== null && newRank !== null && previousRank.id !== newRank.id;

    const previousRankOpacity = useRef(new Animated.Value(1)).current;
    const previousRankScale = useRef(new Animated.Value(1)).current;

    const newRankOpacity = useRef(new Animated.Value(rankChanged ? 0 : 1)).current;

    const newRankScale = useRef(new Animated.Value(rankChanged ? 0.8 : 1)).current;

    const totalRankSteps = newRank?.maximumLevel !== null && newRank ? newRank.maximumLevel - newRank.minimumLevel : 0;

    const previousCompletedSteps = previousRank?.id === newRank?.id ? previousLevel - (previousRank?.minimumLevel ?? previousLevel) : 0;

    const newCompletedSteps = newRank ? newLevel - newRank.minimumLevel : 0;

    const diamondAnimations = useRef(
        Array.from({ length: totalRankSteps }, (_, index) => {
            return new Animated.Value(index < previousCompletedSteps ? 1 : 0);
        }),
    ).current;

    useEffect(() => {
        const newlyCompletedDiamondAnimations = diamondAnimations.slice(previousCompletedSteps, newCompletedSteps).map((diamondAnimation) =>
            Animated.spring(diamondAnimation, {
                toValue: 1,
                friction: 5,
                tension: 120,
                useNativeDriver: true,
            }),
        );

        const rankTransitionAnimations = rankChanged
            ? [
                  Animated.parallel([
                      Animated.timing(previousRankOpacity, {
                          toValue: 0,
                          duration: 250,
                          useNativeDriver: true,
                      }),

                      Animated.timing(previousRankScale, {
                          toValue: 0.75,
                          duration: 250,
                          useNativeDriver: true,
                      }),
                  ]),

                  Animated.parallel([
                      Animated.timing(newRankOpacity, {
                          toValue: 1,
                          duration: 250,
                          useNativeDriver: true,
                      }),

                      Animated.spring(newRankScale, {
                          toValue: 1,
                          friction: 5,
                          tension: 100,
                          useNativeDriver: true,
                      }),
                  ]),
              ]
            : [];

        Animated.sequence([
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),

                Animated.spring(scale, {
                    toValue: 1,
                    friction: 7,
                    tension: 80,
                    useNativeDriver: true,
                }),
            ]),

            Animated.delay(350),

            ...rankTransitionAnimations,

            Animated.delay(200),

            ...newlyCompletedDiamondAnimations,
        ]).start();
    }, [diamondAnimations, newCompletedSteps, opacity, previousCompletedSteps, scale]);

    if (!newRank) {
        return null;
    }

    const newRankImage = getRankImage(newRank.id);

    const previousRankImage = previousRank ? getRankImage(previousRank.id) : null;

    return (
        <Modal transparent animationType="none" statusBarTranslucent onRequestClose={onContinue}>
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.card,
                        {
                            opacity,
                            transform: [{ scale }],
                        },
                    ]}
                >
                    <Text style={styles.label}>{rankChanged ? "NEW FOCUS RANK" : "LEVEL UP"}</Text>

                    {rankChanged ? (
                        <View style={styles.rankTransitionStage}>
                            <Animated.View
                                style={[
                                    styles.rankTransitionMedallion,
                                    {
                                        opacity: previousRankOpacity,
                                        transform: [{ scale: previousRankScale }],
                                    },
                                ]}
                            >
                                <RankMedallion level={previousLevel} />
                            </Animated.View>

                            <Animated.View
                                style={[
                                    styles.rankTransitionMedallion,
                                    {
                                        opacity: newRankOpacity,
                                        transform: [{ scale: newRankScale }],
                                    },
                                ]}
                            >
                                <RankMedallion level={newLevel} />
                            </Animated.View>
                        </View>
                    ) : (
                        <View style={styles.badgeContainer}>
                            <View style={styles.imageFrame}>
                                <Animated.Image source={newRankImage} style={styles.image} resizeMode="contain" />
                            </View>

                            {totalRankSteps > 0 && (
                                <View style={styles.rankTray}>
                                    {Array.from({ length: totalRankSteps }).map((_, index) => {
                                        const isCompleted = index < newCompletedSteps;

                                        const animatedScale = diamondAnimations[index]?.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.3, 1],
                                        });

                                        return (
                                            <View key={index} style={styles.rankDiamondSlot}>
                                                <View style={styles.rankDiamondRemaining} />

                                                {isCompleted && (
                                                    <Animated.View
                                                        style={[
                                                            styles.rankDiamondCompleted,
                                                            {
                                                                opacity: diamondAnimations[index],
                                                                transform: [{ rotate: "45deg" }, { scale: animatedScale }],
                                                            },
                                                        ]}
                                                    />
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    )}

                    {rankChanged && previousRank ? (
                        <View style={styles.rankTextStage}>
                            <Animated.View
                                style={[
                                    styles.rankTextLayer,
                                    {
                                        opacity: previousRankOpacity,
                                        transform: [{ scale: previousRankScale }],
                                    },
                                ]}
                            >
                                <Text style={styles.level}>Level {previousLevel}</Text>
                                <Text style={styles.rankName}>{previousRank.name}</Text>
                            </Animated.View>

                            <Animated.View
                                style={[
                                    styles.rankTextLayer,
                                    {
                                        opacity: newRankOpacity,
                                        transform: [{ scale: newRankScale }],
                                    },
                                ]}
                            >
                                <Text style={styles.level}>Level {newLevel}</Text>
                                <Text style={styles.rankName}>{newRank.name}</Text>
                            </Animated.View>
                        </View>
                    ) : (
                        <View style={styles.standardRankText}>
                            <Text style={styles.level}>Level {newLevel}</Text>
                            <Text style={styles.rankName}>{newRank.name}</Text>
                        </View>
                    )}

                    <View style={styles.rewardBadge}>
                        <Text style={styles.rewardText}>+{earnedXp} XP</Text>
                    </View>

                    <Pressable style={({ pressed }) => [styles.continueButton, pressed && styles.continueButtonPressed]} onPress={onContinue}>
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </Pressable>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.lg,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
    },

    card: {
        width: "100%",
        maxWidth: 420,

        alignItems: "center",

        padding: spacing.xl,

        borderWidth: 1,
        borderColor: colours.primaryBorder,
        borderRadius: radius.lg,

        backgroundColor: colours.surface,
    },

    label: {
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 1,
        color: colours.primary,
    },

    level: {
        fontSize: 30,
        fontWeight: "800",
        color: colours.text,
    },

    rankName: {
        marginTop: spacing.xs,
        fontSize: 17,
        fontWeight: "700",
        color: colours.textMuted,
    },

    rewardBadge: {
        marginTop: spacing.md,

        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,

        borderRadius: radius.pill,

        backgroundColor: colours.primarySoft,
    },

    rewardText: {
        fontSize: 14,
        fontWeight: "800",

        color: colours.primary,
    },

    continueButton: {
        width: "100%",

        marginTop: spacing.xl,
        paddingVertical: 14,

        alignItems: "center",

        borderRadius: radius.md,
        backgroundColor: colours.primary,
    },

    continueButtonPressed: {
        backgroundColor: colours.primaryPressed,
    },

    continueButtonText: {
        fontSize: 15,
        fontWeight: "700",

        color: colours.surface,
    },
    badgeContainer: {
        width: 132,
        height: 146,

        marginTop: spacing.lg,

        position: "relative",
        alignItems: "center",
    },

    imageFrame: {
        width: 132,
        height: 132,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 2,
        borderColor: colours.primary,
        borderRadius: radius.pill,

        backgroundColor: colours.primarySoft,
        overflow: "hidden",
    },

    image: {
        width: 98,
        height: 98,
    },

    rankTray: {
        position: "absolute",
        top: 116,

        minHeight: 28,
        paddingHorizontal: spacing.sm,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        borderWidth: 2,
        borderColor: colours.primary,
        borderRadius: radius.pill,

        backgroundColor: colours.surface,
    },

    rankDiamondSlot: {
        width: 17,
        height: 17,

        position: "relative",

        alignItems: "center",
        justifyContent: "center",
    },

    rankDiamondRemaining: {
        width: 9,
        height: 9,

        position: "absolute",

        borderWidth: 1,
        borderColor: colours.primaryBorder,

        backgroundColor: colours.surface,

        transform: [{ rotate: "45deg" }],
    },

    rankDiamondCompleted: {
        width: 9,
        height: 9,

        position: "absolute",

        borderWidth: 1,
        borderColor: colours.primary,

        backgroundColor: colours.primary,
    },
    absoluteImage: {
        position: "absolute",
    },
    staticRankDiamond: {
        width: 9,
        height: 9,
        transform: [{ rotate: "45deg" }],
    },

    staticRankDiamondCompleted: {
        borderWidth: 1,
        borderColor: colours.primary,
        backgroundColor: colours.primary,
    },

    staticRankDiamondRemaining: {
        borderWidth: 1,
        borderColor: colours.primaryBorder,
        backgroundColor: colours.surface,
    },
    rankTransitionStage: {
        width: 132,
        height: 146,

        marginTop: spacing.lg,

        position: "relative",
    },

    rankTransitionMedallion: {
        position: "absolute",
        top: 0,
        left: 0,
    },
    rankTextStage: {
        width: "100%",
        height: 70,

        marginTop: spacing.lg,

        position: "relative",
        alignItems: "center",
    },

    rankTextLayer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,

        alignItems: "center",
    },
    standardRankText: {
        marginTop: spacing.lg,
        alignItems: "center",
    },
});
