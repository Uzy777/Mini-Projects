import { useEffect, useMemo, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { AlertTriangle, X } from "lucide-react-native";

import { AppButton } from "@/components/ui/AppButton";
import { KeyboardAwareView } from "@/components/ui/KeyboardAwareLayout";
import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

const CONFIRMATION_TEXT = "DELETE";

type DeleteAccountModalProps = {
    visible: boolean;
    accountEmail?: string;
    isDeleting: boolean;
    errorMessage: string | null;
    onClose: () => void;
    onConfirm: () => void;
};

export function DeleteAccountModal({
    visible,
    accountEmail,
    isDeleting,
    errorMessage,
    onClose,
    onConfirm,
}: DeleteAccountModalProps) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const [confirmation, setConfirmation] = useState("");

    useEffect(() => {
        if (!visible) {
            setConfirmation("");
        }
    }, [visible]);

    const canDelete = confirmation.trim() === CONFIRMATION_TEXT && !isDeleting;

    function handleClose() {
        if (!isDeleting) {
            onClose();
        }
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={handleClose}
        >
            <KeyboardAwareView style={styles.overlay}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close delete account confirmation"
                    style={StyleSheet.absoluteFill}
                    onPress={handleClose}
                />

                <View accessibilityViewIsModal style={styles.card}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Close"
                        disabled={isDeleting}
                        onPress={handleClose}
                        style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
                    >
                        <X size={19} color={colours.textMuted} />
                    </Pressable>

                    <ScrollView
                        contentContainerStyle={styles.cardContent}
                        keyboardDismissMode="on-drag"
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.iconContainer}>
                            <AlertTriangle size={28} color={colours.danger} />
                        </View>

                        <Text style={styles.title}>Delete your account?</Text>
                        <Text style={styles.description}>
                            Your account and all associated data will be permanently deleted. This includes your tasks, projects,
                            Focus history, XP, profile, and preferences.
                        </Text>

                        {accountEmail ? <Text style={styles.accountEmail}>{accountEmail}</Text> : null}

                        <View style={styles.warningBox}>
                            <Text style={styles.warningTitle}>This cannot be undone.</Text>
                            <Text style={styles.warningText}>You will be signed out immediately and this data cannot be recovered.</Text>
                        </View>

                        <Text style={styles.inputLabel}>
                            Type <Text style={styles.confirmationWord}>{CONFIRMATION_TEXT}</Text> to confirm
                        </Text>
                        <TextInput
                            accessibilityLabel="Type DELETE to confirm account deletion"
                            value={confirmation}
                            onChangeText={setConfirmation}
                            editable={!isDeleting}
                            autoCapitalize="characters"
                            autoCorrect={false}
                            maxLength={CONFIRMATION_TEXT.length}
                            placeholder={CONFIRMATION_TEXT}
                            placeholderTextColor={colours.textMuted}
                            returnKeyType="done"
                            onSubmitEditing={() => canDelete && onConfirm()}
                            style={styles.input}
                        />

                        {errorMessage ? (
                            <View accessibilityRole="alert" style={styles.errorBox}>
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                        ) : null}

                        <View style={styles.actions}>
                            <AppButton
                                label="Cancel"
                                variant="secondary"
                                disabled={isDeleting}
                                onPress={handleClose}
                                style={styles.actionButton}
                            />
                            <AppButton
                                label="Delete account"
                                variant="danger"
                                disabled={!canDelete}
                                loading={isDeleting}
                                onPress={onConfirm}
                                style={styles.actionButton}
                            />
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAwareView>
        </Modal>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        overlay: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: spacing.lg,
            backgroundColor: "rgba(0, 0, 0, 0.58)",
        },
        card: {
            width: "100%",
            maxWidth: 460,
            maxHeight: "95%",
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },
        cardContent: {
            padding: spacing.lg,
        },
        closeButton: {
            position: "absolute",
            zIndex: 1,
            top: spacing.md,
            right: spacing.md,
            width: 36,
            height: 36,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
        },
        closeButtonPressed: {
            backgroundColor: colours.background,
        },
        iconContainer: {
            width: 56,
            height: 56,
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "center",
            borderRadius: radius.pill,
            backgroundColor: colours.dangerSoft,
        },
        title: {
            marginTop: spacing.md,
            fontSize: 23,
            fontWeight: "800",
            textAlign: "center",
            color: colours.text,
        },
        description: {
            marginTop: spacing.sm,
            fontSize: 14,
            lineHeight: 21,
            textAlign: "center",
            color: colours.textMuted,
        },
        accountEmail: {
            marginTop: spacing.sm,
            fontSize: 13,
            fontWeight: "700",
            textAlign: "center",
            color: colours.text,
        },
        warningBox: {
            marginTop: spacing.lg,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colours.danger,
            borderRadius: radius.md,
            backgroundColor: colours.dangerSoft,
        },
        warningTitle: {
            fontSize: 14,
            fontWeight: "800",
            color: colours.danger,
        },
        warningText: {
            marginTop: spacing.xs,
            fontSize: 13,
            lineHeight: 19,
            color: colours.text,
        },
        inputLabel: {
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
            fontSize: 13,
            fontWeight: "600",
            color: colours.text,
        },
        confirmationWord: {
            fontWeight: "900",
            color: colours.danger,
        },
        input: {
            minHeight: 46,
            paddingHorizontal: spacing.md,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,
            fontSize: 15,
            fontWeight: "700",
            letterSpacing: 1,
            color: colours.text,
            backgroundColor: colours.background,
        },
        errorBox: {
            marginTop: spacing.md,
            padding: spacing.sm,
            borderRadius: radius.sm,
            backgroundColor: colours.dangerSoft,
        },
        errorText: {
            fontSize: 13,
            lineHeight: 18,
            color: colours.danger,
        },
        actions: {
            flexDirection: "row",
            gap: spacing.sm,
            marginTop: spacing.lg,
        },
        actionButton: {
            flex: 1,
        },
    });
}
