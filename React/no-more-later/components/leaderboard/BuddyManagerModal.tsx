import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { AlertTriangle, Check, UserMinus, UsersRound, X } from "lucide-react-native";
import Animated, { FadeIn, FadeInUp, useReducedMotion } from "react-native-reanimated";

import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { AppButton } from "@/components/ui/AppButton";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import { getMyBuddies, removeBuddy, type Buddy } from "@/services/leaderboard/leaderboardService";

type BuddyManagerModalProps = {
    visible: boolean;
    onClose: () => void;
    onBuddiesChanged: () => void | Promise<void>;
};

export function BuddyManagerModal({ visible, onClose, onBuddiesChanged }: BuddyManagerModalProps) {
    const { colours } = useAppearance();
    const { width, height } = useWindowDimensions();
    const reduceMotion = useReducedMotion();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const isCompact = width < 620;
    const [buddies, setBuddies] = useState<Buddy[]>([]);
    const [selectedBuddy, setSelectedBuddy] = useState<Buddy | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [removedName, setRemovedName] = useState<string | null>(null);

    useEffect(() => {
        if (!visible) return;

        let active = true;
        setIsLoading(true);
        setErrorMessage(null);
        setRemovedName(null);
        getMyBuddies()
            .then((values) => { if (active) setBuddies(values); })
            .catch((error) => {
                console.error("Failed to load buddies:", error);
                if (active) setErrorMessage("Your buddies could not be loaded. Try again in a moment.");
            })
            .finally(() => { if (active) setIsLoading(false); });

        return () => { active = false; };
    }, [visible]);

    async function confirmRemoval() {
        if (!selectedBuddy || isRemoving) return;

        setIsRemoving(true);
        setErrorMessage(null);
        try {
            await removeBuddy(selectedBuddy.user_id);
            setBuddies((current) => current.filter((buddy) => buddy.user_id !== selectedBuddy.user_id));
            setRemovedName(selectedBuddy.display_name);
            setSelectedBuddy(null);
            await onBuddiesChanged();
        } catch (error) {
            console.error("Failed to remove buddy:", error);
            setErrorMessage("This buddy could not be removed. Refresh and try again.");
            setSelectedBuddy(null);
        } finally {
            setIsRemoving(false);
        }
    }

    return (
        <>
            <Modal transparent visible={visible} animationType={reduceMotion ? "none" : "fade"} statusBarTranslucent onRequestClose={onClose}>
                <View style={[styles.backdrop, isCompact && styles.backdropCompact]}>
                    <Pressable accessibilityRole="button" accessibilityLabel="Close buddy management" onPress={onClose} style={StyleSheet.absoluteFill} />
                    <Animated.View
                        accessibilityViewIsModal
                        entering={reduceMotion ? undefined : FadeInUp.duration(220)}
                        style={[styles.sheet, isCompact && styles.sheetCompact, { maxHeight: Math.max(380, height - (isCompact ? 20 : 80)) }]}
                    >
                        <View style={[styles.header, isCompact && styles.headerCompact]}>
                            <View style={styles.headerIcon}><UsersRound size={21} color={colours.primaryStrong} /></View>
                            <View style={styles.headerCopy}>
                                <Text style={styles.eyebrow}>YOUR CIRCLE</Text>
                                <Text style={styles.title}>Manage buddies</Text>
                                <Text style={styles.subtitle}>{buddies.length} active {buddies.length === 1 ? "buddy" : "buddies"}</Text>
                            </View>
                            <AnimatedPressable accessibilityLabel="Close buddy management" haptic="none" onPress={onClose} style={styles.closeButton}>
                                <X size={19} color={colours.textMuted} />
                            </AnimatedPressable>
                        </View>

                        {removedName ? (
                            <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(180)} style={styles.successNotice}>
                                <Check size={15} color={colours.success} />
                                <Text style={styles.successText}>{removedName} was removed from your buddy circle.</Text>
                            </Animated.View>
                        ) : null}

                        {errorMessage ? <Text accessibilityRole="alert" style={styles.errorText}>{errorMessage}</Text> : null}

                        {isLoading ? (
                            <View style={styles.loadingState}>
                                <ActivityIndicator color={colours.primary} />
                                <Text style={styles.helperText}>Loading your buddy circle…</Text>
                            </View>
                        ) : buddies.length === 0 ? (
                            <View style={styles.emptyState}>
                                <View style={styles.emptyIcon}><UsersRound size={25} color={colours.primaryStrong} /></View>
                                <Text style={styles.emptyTitle}>No active buddies</Text>
                                <Text style={styles.helperText}>Use Invite or add on the Buddies leaderboard to connect with someone.</Text>
                            </View>
                        ) : (
                            <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
                                <Text style={styles.listHint}>Removing someone hides both of you from each other’s buddy leaderboard. You can reconnect later with a new invite.</Text>
                                {buddies.map((buddy) => (
                                    <View key={buddy.user_id} style={[styles.buddyRow, isCompact && styles.buddyRowCompact]}>
                                        <View style={styles.avatar}><Text style={styles.avatarText}>{getInitials(buddy.display_name)}</Text></View>
                                        <View style={styles.buddyCopy}>
                                            <Text numberOfLines={1} style={styles.buddyName}>{buddy.display_name}</Text>
                                            <Text style={styles.buddyMeta}>Connected {formatConnectionDate(buddy.connected_at)}</Text>
                                        </View>
                                        <AnimatedPressable
                                            accessibilityRole="button"
                                            accessibilityLabel={`Remove ${buddy.display_name} from buddies`}
                                            haptic="selection"
                                            onPress={() => { setRemovedName(null); setSelectedBuddy(buddy); }}
                                            style={styles.removeButton}
                                        >
                                            <UserMinus size={16} color={colours.danger} />
                                            <Text style={styles.removeButtonText}>Remove</Text>
                                        </AnimatedPressable>
                                    </View>
                                ))}
                            </ScrollView>
                        )}
                    </Animated.View>
                </View>
            </Modal>

            <RemoveBuddyConfirmationModal
                buddy={selectedBuddy}
                visible={selectedBuddy !== null}
                isRemoving={isRemoving}
                onClose={() => { if (!isRemoving) setSelectedBuddy(null); }}
                onConfirm={() => void confirmRemoval()}
            />
        </>
    );
}

function RemoveBuddyConfirmationModal({ buddy, visible, isRemoving, onClose, onConfirm }: { buddy: Buddy | null; visible: boolean; isRemoving: boolean; onClose: () => void; onConfirm: () => void }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <Modal transparent visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <View style={styles.confirmBackdrop}>
                <Pressable accessibilityRole="button" accessibilityLabel="Cancel removing buddy" disabled={isRemoving} onPress={onClose} style={StyleSheet.absoluteFill} />
                <View accessibilityViewIsModal style={styles.confirmCard}>
                    <View style={styles.warningIcon}><AlertTriangle size={27} color={colours.danger} /></View>
                    <Text style={styles.confirmTitle}>Remove {buddy?.display_name ?? "this buddy"}?</Text>
                    <Text style={styles.confirmText}>You will disappear from each other’s buddy leaderboard. Your current shared invite is also retired so it cannot be reused.</Text>
                    <Text style={styles.reconnectText}>You can reconnect later using a newly generated invite.</Text>
                    <View style={styles.confirmActions}>
                        <AppButton label="Keep buddy" variant="secondary" disabled={isRemoving} onPress={onClose} style={styles.confirmAction} />
                        <AppButton label="Remove buddy" variant="danger" loading={isRemoving} disabled={isRemoving} onPress={onConfirm} style={styles.confirmAction} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

function getInitials(displayName: string): string {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "B";
}

function formatConnectionDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "recently";
    return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        backdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, backgroundColor: "rgba(4, 6, 14, 0.72)" },
        backdropCompact: { padding: spacing.sm },
        sheet: { width: "100%", maxWidth: 680, overflow: "hidden", borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.xl, backgroundColor: colours.surface, shadowColor: "#000", shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.28, shadowRadius: 34, elevation: 24 },
        sheetCompact: { borderRadius: radius.lg },
        header: { padding: spacing.lg, flexDirection: "row", alignItems: "center", gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colours.border, backgroundColor: colours.primarySubtle },
        headerCompact: { padding: spacing.md },
        headerIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: radius.md, backgroundColor: colours.primarySoft },
        headerCopy: { minWidth: 0, flex: 1 },
        eyebrow: { fontSize: 8, fontWeight: "900", letterSpacing: 0.9, color: colours.primaryStrong },
        title: { marginTop: 2, fontSize: 20, fontWeight: "900", color: colours.text },
        subtitle: { marginTop: 2, fontSize: 10, color: colours.textMuted },
        closeButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colours.border, borderRadius: radius.pill, backgroundColor: colours.surface },
        successNotice: { marginHorizontal: spacing.lg, marginTop: spacing.md, padding: spacing.sm, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, borderRadius: radius.sm, backgroundColor: colours.successSoft },
        successText: { minWidth: 0, flexShrink: 1, fontSize: 11, fontWeight: "700", color: colours.success },
        errorText: { marginHorizontal: spacing.lg, marginTop: spacing.md, fontSize: 11, lineHeight: 17, textAlign: "center", color: colours.danger },
        loadingState: { minHeight: 280, alignItems: "center", justifyContent: "center", gap: spacing.sm },
        emptyState: { minHeight: 300, padding: spacing.xl, alignItems: "center", justifyContent: "center" },
        emptyIcon: { width: 58, height: 58, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.primarySoft },
        emptyTitle: { marginTop: spacing.md, fontSize: 19, fontWeight: "900", color: colours.text },
        helperText: { maxWidth: 340, marginTop: spacing.xs, fontSize: 12, lineHeight: 18, textAlign: "center", color: colours.textMuted },
        list: { padding: spacing.lg, gap: spacing.sm },
        listHint: { marginBottom: spacing.sm, fontSize: 11, lineHeight: 17, color: colours.textMuted },
        buddyRow: { minHeight: 72, padding: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.md, borderWidth: 1, borderColor: colours.border, borderRadius: radius.md, backgroundColor: colours.background },
        buddyRowCompact: { padding: spacing.sm, gap: spacing.sm },
        avatar: { width: 43, height: 43, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.primarySoft },
        avatarText: { fontSize: 13, fontWeight: "900", color: colours.primaryStrong },
        buddyCopy: { minWidth: 0, flex: 1 },
        buddyName: { fontSize: 14, fontWeight: "900", color: colours.text },
        buddyMeta: { marginTop: 3, fontSize: 9, color: colours.textMuted },
        removeButton: { minHeight: 38, paddingHorizontal: spacing.sm, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, borderWidth: 1, borderColor: colours.danger, borderRadius: radius.sm, backgroundColor: colours.surface },
        removeButtonText: { fontSize: 10, fontWeight: "900", color: colours.danger },
        confirmBackdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, backgroundColor: "rgba(4, 6, 14, 0.8)" },
        confirmCard: { width: "100%", maxWidth: 440, padding: spacing.lg, alignItems: "center", borderWidth: 1, borderColor: colours.danger, borderRadius: radius.lg, backgroundColor: colours.surface },
        warningIcon: { width: 56, height: 56, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.dangerSoft },
        confirmTitle: { marginTop: spacing.md, fontSize: 21, fontWeight: "900", textAlign: "center", color: colours.text },
        confirmText: { marginTop: spacing.sm, fontSize: 13, lineHeight: 20, textAlign: "center", color: colours.textMuted },
        reconnectText: { marginTop: spacing.sm, fontSize: 11, fontWeight: "700", textAlign: "center", color: colours.text },
        confirmActions: { width: "100%", marginTop: spacing.lg, flexDirection: "row", gap: spacing.sm },
        confirmAction: { flex: 1 },
    });
}
