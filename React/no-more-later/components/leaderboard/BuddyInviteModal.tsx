import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { Check, Link2, QrCode, Send, UserPlus, UsersRound, X } from "lucide-react-native";
import Animated, { FadeIn, FadeInUp, ZoomIn, useReducedMotion } from "react-native-reanimated";
import QRCode from "react-native-qrcode-svg";

import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import {
    acceptBuddyInvite,
    createBuddyInvite,
    normalizeBuddyCode,
    previewBuddyInvite,
    type BuddyInvite,
    type BuddyInvitePreview,
} from "@/services/leaderboard/leaderboardService";

type InviteMode = "share" | "join";

type BuddyInviteModalProps = {
    visible: boolean;
    incomingCode?: string | null;
    onClose: () => void;
    onBuddyAdded: () => void | Promise<void>;
};

export function BuddyInviteModal({ visible, incomingCode, onClose, onBuddyAdded }: BuddyInviteModalProps) {
    const { colours } = useAppearance();
    const { width, height } = useWindowDimensions();
    const reduceMotion = useReducedMotion();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const isCompact = width < 620;
    const isNarrow = width < 390;
    const [mode, setMode] = useState<InviteMode>("share");
    const [invite, setInvite] = useState<BuddyInvite | null>(null);
    const [code, setCode] = useState("");
    const [preview, setPreview] = useState<BuddyInvitePreview | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [shareFeedback, setShareFeedback] = useState<string | null>(null);
    const [addedBuddyName, setAddedBuddyName] = useState<string | null>(null);

    useEffect(() => {
        if (!visible) return;

        let active = true;
        const normalizedIncomingCode = normalizeBuddyCode(incomingCode ?? "");
        setErrorMessage(null);
        setShareFeedback(null);
        setAddedBuddyName(null);
        setPreview(null);

        if (normalizedIncomingCode) {
            setMode("join");
            setCode(normalizedIncomingCode);
            setIsLoading(true);
            previewBuddyInvite(normalizedIncomingCode)
                .then((value) => { if (active) setPreview(value); })
                .catch((error) => { if (active) setErrorMessage(getInviteErrorMessage(error)); })
                .finally(() => { if (active) setIsLoading(false); });
        } else {
            setMode("share");
            setCode("");
            setIsLoading(true);
            createBuddyInvite()
                .then((value) => { if (active) setInvite(value); })
                .catch((error) => { if (active) setErrorMessage(getInviteErrorMessage(error)); })
                .finally(() => { if (active) setIsLoading(false); });
        }

        return () => { active = false; };
    }, [incomingCode, visible]);

    const appInviteLink = invite ? buildBuddyAppLink(invite.code) : "";
    const qrInviteLink = invite ? buildAndroidIntentLink(invite.code) : "";
    const webInviteLink = invite ? buildShareableWebLink(invite.code) : null;

    function changeMode(nextMode: InviteMode) {
        setMode(nextMode);
        setErrorMessage(null);
        setShareFeedback(null);
        setPreview(null);
        setAddedBuddyName(null);

        if (nextMode === "share" && !invite) {
            setIsLoading(true);
            createBuddyInvite()
                .then(setInvite)
                .catch((error) => setErrorMessage(getInviteErrorMessage(error)))
                .finally(() => setIsLoading(false));
        }
    }

    async function shareInvite() {
        if (!invite) return;

        const message = [
            "Add me as a buddy on No More Later.",
            `Code: ${invite.code}`,
            `Open the installed app: ${appInviteLink}`,
            webInviteLink ? `Open on web: ${webInviteLink}` : null,
        ].filter(Boolean).join("\n\n");
        setShareFeedback(null);

        try {
            if (Platform.OS === "web") {
                if (typeof navigator !== "undefined" && navigator.share) {
                    await navigator.share({ title: "No More Later buddy invite", text: message });
                    setShareFeedback("Invite shared");
                } else if (typeof navigator !== "undefined" && navigator.clipboard) {
                    await navigator.clipboard.writeText(message);
                    setShareFeedback("Invite copied to clipboard");
                } else {
                    setShareFeedback("Select and share the code above");
                }
            } else {
                await Share.share({ title: "No More Later buddy invite", message });
            }
        } catch (error) {
            if (isShareCancellation(error)) return;
            setErrorMessage("The invite could not be shared. Your code is still ready to copy manually.");
        }
    }

    async function checkCode() {
        const normalizedCode = normalizeBuddyCode(code);
        setCode(normalizedCode);
        setPreview(null);
        setAddedBuddyName(null);
        setErrorMessage(null);

        if (normalizedCode.length !== 8) {
            setErrorMessage("Enter the complete 8-character buddy code.");
            return;
        }

        setIsLoading(true);
        try {
            setPreview(await previewBuddyInvite(normalizedCode));
        } catch (error) {
            setErrorMessage(getInviteErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    }

    async function acceptInvite() {
        if (!preview || isAccepting) return;

        setIsAccepting(true);
        setErrorMessage(null);
        try {
            const buddy = await acceptBuddyInvite(preview.code);
            setAddedBuddyName(buddy.display_name);
            await onBuddyAdded();
        } catch (error) {
            setErrorMessage(getInviteErrorMessage(error));
        } finally {
            setIsAccepting(false);
        }
    }

    return (
        <Modal transparent visible={visible} animationType={reduceMotion ? "none" : "fade"} statusBarTranslucent onRequestClose={onClose}>
            <View style={[styles.backdrop, isCompact && styles.backdropCompact]}>
                <Pressable accessibilityRole="button" accessibilityLabel="Close buddy invite" onPress={onClose} style={StyleSheet.absoluteFill} />
                <Animated.View
                    entering={reduceMotion ? undefined : FadeInUp.duration(220)}
                    style={[styles.sheet, isCompact && styles.sheetCompact, { maxHeight: Math.max(420, height - (isCompact ? 20 : 80)) }]}
                >
                    <View style={[styles.header, isCompact && styles.headerCompact]}>
                        <View style={styles.headerIcon}><UsersRound size={21} color={colours.primaryStrong} /></View>
                        <View style={styles.headerCopy}>
                            <Text style={styles.eyebrow}>BUDDY CIRCLE</Text>
                            <Text style={styles.title}>Focus better together</Text>
                        </View>
                        <AnimatedPressable accessibilityLabel="Close buddy invite" haptic="none" onPress={onClose} style={styles.closeButton}>
                            <X size={19} color={colours.textMuted} />
                        </AnimatedPressable>
                    </View>

                    {addedBuddyName ? (
                        <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(180)} style={styles.successState}>
                            <Animated.View entering={reduceMotion ? undefined : ZoomIn.duration(220)} style={styles.successIcon}>
                                <Check size={36} strokeWidth={3} color="#ffffff" />
                            </Animated.View>
                            <Text style={styles.successTitle}>Buddy added</Text>
                            <Text style={styles.successText}>{addedBuddyName} is now in your buddy circle. You can see each other’s real names and focus stats in the Buddies leaderboard.</Text>
                            <AnimatedPressable accessibilityRole="button" onPress={onClose} style={styles.primaryButton}>
                                <Text style={styles.primaryButtonText}>View buddy leaderboard</Text>
                            </AnimatedPressable>
                        </Animated.View>
                    ) : (
                        <ScrollView
                            style={styles.bodyScroll}
                            contentContainerStyle={[styles.body, isCompact && styles.bodyCompact]}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View accessibilityRole="tablist" style={styles.modeControl}>
                                <ModeButton label="Share mine" icon={QrCode} selected={mode === "share"} onPress={() => changeMode("share")} />
                                <ModeButton label="Enter code" icon={UserPlus} selected={mode === "join"} onPress={() => changeMode("join")} />
                            </View>

                            {isLoading ? (
                                <View style={styles.loadingState}>
                                    <ActivityIndicator color={colours.primary} />
                                    <Text style={styles.helperText}>{mode === "share" ? "Creating your secure invite…" : "Checking the invite…"}</Text>
                                </View>
                            ) : mode === "share" && invite ? (
                                <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(180)} style={[styles.inviteLayout, isCompact && styles.inviteLayoutCompact]}>
                                    <View style={[styles.qrCard, isNarrow && styles.qrCardNarrow]}>
                                        <QRCode value={qrInviteLink} size={isNarrow ? 122 : isCompact ? 138 : 174} color="#111827" backgroundColor="#ffffff" quietZone={8} />
                                    </View>
                                    <View style={[styles.shareCopy, isCompact && styles.shareCopyCompact]}>
                                        <Text style={styles.sectionTitle}>Scan or share your invite</Text>
                                        <Text style={styles.helperText}>Scan to open the installed Android app, or enter the code anywhere. It can be shared until {formatExpiry(invite.expires_at)}.</Text>
                                        <View style={[styles.codeCard, isNarrow && styles.codeCardNarrow]}>
                                            <Text selectable style={[styles.codeText, isNarrow && styles.codeTextNarrow]}>{invite.code}</Text>
                                            <Text style={styles.codeLabel}>BUDDY CODE</Text>
                                        </View>
                                        <AnimatedPressable accessibilityRole="button" onPress={() => void shareInvite()} style={styles.primaryButton}>
                                            <Send size={17} color="#ffffff" />
                                            <Text style={styles.primaryButtonText}>Share invite</Text>
                                        </AnimatedPressable>
                                        {shareFeedback ? <Text style={styles.feedbackText}>{shareFeedback}</Text> : null}
                                    </View>
                                </Animated.View>
                            ) : mode === "join" ? (
                                <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(180)} style={styles.joinSection}>
                                    <View style={styles.joinIntroIcon}><Link2 size={24} color={colours.primaryStrong} /></View>
                                    <Text style={styles.sectionTitle}>{preview ? `Add ${preview.display_name}?` : "Enter a buddy code"}</Text>
                                    <Text style={styles.helperText}>{preview ? "Accepting connects both buddy leaderboards and shares your real leaderboard names with each other." : "Paste or type the 8-character code from your friend’s invite."}</Text>

                                    {!preview ? (
                                        <>
                                            <TextInput
                                                accessibilityLabel="Buddy invite code"
                                                autoCapitalize="characters"
                                                autoCorrect={false}
                                                maxLength={8}
                                                onChangeText={(value) => { setCode(normalizeBuddyCode(value)); setErrorMessage(null); }}
                                                onSubmitEditing={() => void checkCode()}
                                                placeholder="AB12CD34"
                                                placeholderTextColor={colours.textMuted}
                                                returnKeyType="done"
                                                style={styles.codeInput}
                                                value={code}
                                            />
                                            <AnimatedPressable accessibilityRole="button" disabled={code.length !== 8} onPress={() => void checkCode()} style={[styles.primaryButton, code.length !== 8 && styles.buttonDisabled]}>
                                                <UserPlus size={17} color="#ffffff" />
                                                <Text style={styles.primaryButtonText}>Check invite</Text>
                                            </AnimatedPressable>
                                        </>
                                    ) : (
                                        <View style={styles.previewCard}>
                                            <View style={styles.previewAvatar}><UsersRound size={24} color={colours.primaryStrong} /></View>
                                            <View style={styles.previewCopy}>
                                                <Text numberOfLines={1} style={styles.previewName}>{preview.display_name}</Text>
                                                <Text style={styles.previewMeta}>Invite verified · expires {formatExpiry(preview.expires_at)}</Text>
                                            </View>
                                            <Check size={18} color={colours.success} />
                                        </View>
                                    )}

                                    {preview ? (
                                        <View style={styles.buttonRow}>
                                            <AnimatedPressable accessibilityRole="button" disabled={isAccepting} onPress={() => { setPreview(null); setErrorMessage(null); }} style={styles.secondaryButton}>
                                                <Text style={styles.secondaryButtonText}>Use another</Text>
                                            </AnimatedPressable>
                                            <AnimatedPressable accessibilityRole="button" disabled={isAccepting} onPress={() => void acceptInvite()} style={styles.primaryButton}>
                                                {isAccepting ? <ActivityIndicator size="small" color="#ffffff" /> : <UserPlus size={17} color="#ffffff" />}
                                                <Text style={styles.primaryButtonText}>{isAccepting ? "Adding…" : "Add buddy"}</Text>
                                            </AnimatedPressable>
                                        </View>
                                    ) : null}
                                </Animated.View>
                            ) : null}

                            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                        </ScrollView>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
}

function ModeButton({ label, icon: Icon, selected, onPress }: { label: string; icon: typeof QrCode; selected: boolean; onPress: () => void }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <AnimatedPressable accessibilityRole="tab" accessibilityState={{ selected }} haptic="selection" onPress={onPress} style={[styles.modeButton, selected && styles.modeButtonSelected]}>
            <Icon size={16} color={selected ? colours.primaryStrong : colours.textMuted} />
            <Text style={[styles.modeButtonText, selected && styles.modeButtonTextSelected]}>{label}</Text>
        </AnimatedPressable>
    );
}

function buildBuddyAppLink(code: string): string {
    return `nomorelater://leaderboard?buddyCode=${encodeURIComponent(code)}`;
}

function buildAndroidIntentLink(code: string): string {
    return `intent://leaderboard?buddyCode=${encodeURIComponent(code)}#Intent;scheme=nomorelater;package=com.uzy777.nomorelater;end`;
}

function buildShareableWebLink(code: string): string | null {
    if (Platform.OS !== "web" || typeof window === "undefined") return null;

    const hostname = window.location.hostname.toLowerCase();
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0") return null;

    return `${window.location.origin}/leaderboard?buddyCode=${encodeURIComponent(code)}`;
}

function formatExpiry(value: string): string {
    return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" }).format(new Date(value));
}

function getInviteErrorMessage(error: unknown): string {
    const message = typeof error === "object" && error && "message" in error ? String(error.message) : "";
    if (/own buddy invite/i.test(message)) return "This is your own invite. Share it with someone else instead.";
    if (/code not found/i.test(message)) return "No active invite matches that code. Check each character and try again.";
    if (/has expired/i.test(message)) return "This invite has expired. Ask your buddy to open the invite screen and share a new code.";
    if (/no longer available/i.test(message)) return "This buddy account is no longer available.";
    if (/function .*buddy_invite.*does not exist/i.test(message)) return "The latest buddy database migration has not been deployed yet.";
    return "The buddy invite could not be loaded. Check your connection and try again.";
}

function isShareCancellation(error: unknown): boolean {
    const message = typeof error === "object" && error && "message" in error ? String(error.message) : "";
    return /cancel|abort/i.test(message);
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        backdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, backgroundColor: "rgba(4, 6, 14, 0.72)" },
        backdropCompact: { padding: spacing.sm },
        sheet: { width: "100%", maxWidth: 720, overflow: "hidden", borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.xl, backgroundColor: colours.surface, shadowColor: "#000", shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.28, shadowRadius: 34, elevation: 24 },
        sheetCompact: { borderRadius: radius.lg },
        header: { padding: spacing.lg, flexDirection: "row", alignItems: "center", gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colours.border, backgroundColor: colours.primarySubtle },
        headerCompact: { padding: spacing.md, gap: spacing.sm },
        headerIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: radius.md, backgroundColor: colours.primarySoft },
        headerCopy: { minWidth: 0, flex: 1 },
        eyebrow: { fontSize: 8, fontWeight: "900", letterSpacing: 0.9, color: colours.primaryStrong },
        title: { marginTop: 3, fontSize: 20, fontWeight: "900", color: colours.text },
        closeButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colours.border, borderRadius: radius.pill, backgroundColor: colours.surface },
        bodyScroll: { minHeight: 0 },
        body: { padding: spacing.lg, gap: spacing.lg },
        bodyCompact: { padding: spacing.md, gap: spacing.md },
        modeControl: { flexDirection: "row", padding: 4, borderWidth: 1, borderColor: colours.border, borderRadius: radius.md, backgroundColor: colours.background },
        modeButton: { flex: 1, minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, borderRadius: radius.sm },
        modeButtonSelected: { backgroundColor: colours.surface },
        modeButtonText: { fontSize: 13, fontWeight: "800", color: colours.textMuted },
        modeButtonTextSelected: { color: colours.primaryStrong },
        loadingState: { minHeight: 250, alignItems: "center", justifyContent: "center", gap: spacing.sm },
        inviteLayout: { flexDirection: "row", alignItems: "center", gap: spacing.xl },
        inviteLayoutCompact: { flexDirection: "column", gap: spacing.sm },
        qrCard: { padding: spacing.sm, alignSelf: "center", borderWidth: 1, borderColor: colours.border, borderRadius: radius.lg, backgroundColor: "#ffffff" },
        qrCardNarrow: { padding: spacing.xs, borderRadius: radius.md },
        shareCopy: { minWidth: 0, flex: 1, alignSelf: "stretch", justifyContent: "center" },
        shareCopyCompact: { width: "100%", flex: 0 },
        sectionTitle: { fontSize: 19, fontWeight: "900", textAlign: "center", color: colours.text },
        helperText: { marginTop: spacing.xs, fontSize: 12, lineHeight: 18, textAlign: "center", color: colours.textMuted },
        codeCard: { marginTop: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, alignItems: "center", borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.md, backgroundColor: colours.primarySubtle },
        codeCardNarrow: { marginTop: spacing.sm, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm },
        codeText: { fontSize: 25, fontWeight: "900", letterSpacing: 4, color: colours.primaryStrong },
        codeTextNarrow: { fontSize: 21, letterSpacing: 2.5 },
        codeLabel: { marginTop: 4, fontSize: 8, fontWeight: "900", letterSpacing: 1, color: colours.textMuted },
        primaryButton: { minHeight: 46, marginTop: spacing.md, paddingHorizontal: spacing.lg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, borderRadius: radius.md, backgroundColor: colours.primary },
        primaryButtonText: { fontSize: 14, fontWeight: "900", color: "#ffffff" },
        buttonDisabled: { opacity: 0.45 },
        feedbackText: { marginTop: spacing.sm, fontSize: 11, fontWeight: "700", textAlign: "center", color: colours.success },
        joinSection: { width: "100%", maxWidth: 500, minHeight: 250, alignSelf: "center", alignItems: "stretch" },
        joinIntroIcon: { width: 50, height: 50, marginBottom: spacing.sm, alignSelf: "center", alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.primarySoft },
        codeInput: { marginTop: spacing.lg, minHeight: 54, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.md, fontSize: 20, fontWeight: "900", letterSpacing: 3, textAlign: "center", color: colours.text, backgroundColor: colours.background },
        previewCard: { marginTop: spacing.lg, padding: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.md, borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.md, backgroundColor: colours.primarySubtle },
        previewAvatar: { width: 46, height: 46, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.primarySoft },
        previewCopy: { minWidth: 0, flex: 1 },
        previewName: { fontSize: 16, fontWeight: "900", color: colours.text },
        previewMeta: { marginTop: 3, fontSize: 10, color: colours.textMuted },
        buttonRow: { flexDirection: "row", gap: spacing.sm },
        secondaryButton: { minHeight: 46, marginTop: spacing.md, paddingHorizontal: spacing.lg, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colours.border, borderRadius: radius.md, backgroundColor: colours.surface },
        secondaryButtonText: { fontSize: 13, fontWeight: "800", color: colours.text },
        errorText: { fontSize: 11, lineHeight: 17, textAlign: "center", color: colours.danger },
        successState: { minHeight: 380, padding: spacing.xl, alignItems: "center", justifyContent: "center" },
        successIcon: { width: 78, height: 78, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.success },
        successTitle: { marginTop: spacing.lg, fontSize: 24, fontWeight: "900", color: colours.text },
        successText: { maxWidth: 430, marginTop: spacing.sm, fontSize: 13, lineHeight: 20, textAlign: "center", color: colours.textMuted },
    });
}
