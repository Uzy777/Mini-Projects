import { useMemo, useState, type ReactNode } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
    ArrowRight,
    Award,
    BarChart3,
    Check,
    CheckCircle2,
    ChevronLeft,
    ListChecks,
    LockKeyhole,
    Mail,
    ShieldCheck,
    Sparkles,
    Target,
    Timer,
    Trophy,
    UserRound,
    type LucideIcon,
} from "lucide-react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, useReducedMotion } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthInput } from "@/components/auth/AuthInput";
import { FocusTimerDisplay } from "@/components/focus/FocusTimerDisplay";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import type { AppColours } from "@/constants/appearanceColours";
import { AUTH_COLOURS } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { ANIMAL_RANK_IMAGES } from "@/constants/rankImages";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { signUpWithEmail } from "@/services/auth/authService";
import { saveTimerPreferences } from "@/services/storage/timerPreferencesStorage";
import { getUsernameValidationMessage } from "@/utils/usernameValidation";

const STAGES = ["welcome", "discover", "profile", "email", "password", "confirm"] as const;
type OnboardingStage = typeof STAGES[number];

const FOCUS_OPTIONS = [
    { minutes: 15, label: "Light start" },
    { minutes: 25, label: "Balanced" },
    { minutes: 45, label: "Deep dive" },
] as const;

const VALUE_POINTS: { icon: LucideIcon; label: string }[] = [
    { icon: Target, label: "Choose one clear next step" },
    { icon: Trophy, label: "Turn focused time into progress" },
    { icon: Sparkles, label: "Build ranks, streaks and momentum" },
];

const RANK_PREVIEW_ITEMS = [
    { id: "ant", name: "Ant" },
    { id: "bumblebee", name: "Bumblebee" },
    { id: "mouse", name: "Mouse" },
] as const;

const STAGE_LABELS: Record<OnboardingStage, string> = {
    welcome: "WELCOME",
    discover: "A QUICK TOUR",
    profile: "YOUR SETUP",
    email: "CREATE ACCOUNT",
    password: "CREATE ACCOUNT",
    confirm: "CREATE ACCOUNT",
};

export default function OnboardingScreen() {
    const colours = AUTH_COLOURS;
    const { width } = useWindowDimensions();
    const isWide = width >= 880;
    const styles = useMemo(() => createStyles(colours, isWide), [colours, isWide]);
    const reduceMotion = useReducedMotion();
    const router = useRouter();
    const { completeOnboarding } = useOnboarding();

    const [stage, setStage] = useState<OnboardingStage>("welcome");
    const [displayName, setDisplayName] = useState("");
    const [focusMinutes, setFocusMinutes] = useState(25);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [validationMessage, setValidationMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const stageIndex = STAGES.indexOf(stage);
    const progress = ((stageIndex + 1) / STAGES.length) * 100;

    function moveTo(nextStage: OnboardingStage) {
        setValidationMessage("");
        setStage(nextStage);
    }

    async function goToSignIn() {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            await completeOnboarding();
            router.replace("/sign-in");
        } catch (error) {
            console.error("Failed to finish onboarding:", error);
            setValidationMessage("Could not continue. Try again.");
            setIsSubmitting(false);
        }
    }

    function continueFromProfile() {
        const message = getUsernameValidationMessage(displayName);
        if (message) {
            setValidationMessage(message);
            return;
        }
        moveTo("email");
    }

    function continueFromEmail() {
        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail || !trimmedEmail.includes("@")) {
            setValidationMessage("Enter a valid email address.");
            return;
        }
        setEmail(trimmedEmail);
        moveTo("password");
    }

    function continueFromPassword() {
        if (password.length < 8) {
            setValidationMessage("Password must be at least 8 characters.");
            return;
        }
        moveTo("confirm");
    }

    function goBack() {
        if (stageIndex > 0) moveTo(STAGES[stageIndex - 1]);
    }

    async function createAccount() {
        if (isSubmitting) return;

        const trimmedEmail = email.trim().toLowerCase();
        const trimmedDisplayName = displayName.trim();
        const usernameMessage = getUsernameValidationMessage(trimmedDisplayName);

        if (usernameMessage) {
            setValidationMessage(usernameMessage);
            setStage("profile");
            return;
        }
        if (!trimmedEmail || !trimmedEmail.includes("@")) {
            setValidationMessage("Enter a valid email address.");
            setStage("email");
            return;
        }
        if (password.length < 8) {
            setValidationMessage("Password must be at least 8 characters.");
            setStage("password");
            return;
        }
        if (password !== confirmPassword) {
            setValidationMessage("Passwords do not match.");
            return;
        }

        setValidationMessage("");
        setIsSubmitting(true);

        try {
            const { data, error } = await signUpWithEmail(trimmedEmail, password, trimmedDisplayName);
            if (error) {
                setValidationMessage(error.message);
                return;
            }

            try {
                await saveTimerPreferences({ focus: focusMinutes, break: 5 });
            } catch (storageError) {
                console.error("Failed to save the onboarding timer preference:", storageError);
            }

            await completeOnboarding();
            if (data.session) {
                router.replace("/");
            } else {
                router.replace({
                    pathname: "/sign-in",
                    params: { notice: "Account created. Check your email to confirm it, then sign in." },
                });
            }
        } catch (error) {
            console.error("Onboarding sign up failed:", error);
            setValidationMessage("Could not create your account. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView
                    style={styles.screen}
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View pointerEvents="none" style={styles.glowOne} />
                    <View pointerEvents="none" style={styles.glowTwo} />

                    <View style={styles.shell}>
                        {isWide ? (
                            <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(480)} style={styles.heroPanel}>
                                <BrandMark styles={styles} colours={colours} />
                                <View style={styles.heroCopy}>
                                    <Text style={styles.eyebrow}>FOCUS THAT FEELS ACHIEVABLE</Text>
                                    <Text style={styles.heroTitle}>Make now easier than later.</Text>
                                    <Text style={styles.heroDescription}>Choose what matters, give it your attention, and watch small sessions turn into real momentum.</Text>
                                </View>
                                <View style={styles.desktopTimerPreview}><DefaultTimerPreview size={218} /></View>
                                <View style={styles.valueList}>
                                    {VALUE_POINTS.map(({ icon: Icon, label }) => (
                                        <View key={label} style={styles.valueRow}>
                                            <View style={styles.valueIcon}><Icon size={14} strokeWidth={2.5} color={colours.primaryStrong} /></View>
                                            <Text style={styles.valueText}>{label}</Text>
                                        </View>
                                    ))}
                                </View>
                            </Animated.View>
                        ) : null}

                        <Animated.View entering={reduceMotion ? undefined : FadeInUp.delay(80).duration(450)} style={styles.setupPanel}>
                            {!isWide ? <BrandMark styles={styles} colours={colours} compact /> : null}

                            <View style={styles.progressHeader}>
                                {stageIndex > 0 ? (
                                    <AnimatedPressable accessibilityRole="button" accessibilityLabel="Go back" haptic="light" onPress={goBack} style={styles.backButton}>
                                        <ChevronLeft size={18} strokeWidth={2.4} color={colours.text} />
                                    </AnimatedPressable>
                                ) : null}
                                <View style={styles.progressCopy}>
                                    <Text style={styles.progressStage}>{STAGE_LABELS[stage]}</Text>
                                    <Text style={styles.progressCount}>Step {stageIndex + 1} of {STAGES.length}</Text>
                                </View>
                            </View>
                            <View accessibilityLabel={`Onboarding step ${stageIndex + 1} of ${STAGES.length}`} style={styles.progressTrack}>
                                <View style={[styles.progressFill, { width: `${progress}%` }]} />
                            </View>

                            <Animated.View key={stage} entering={reduceMotion ? undefined : FadeInUp.duration(240)} exiting={reduceMotion ? undefined : FadeOut.duration(100)} style={styles.stepContent}>
                                {stage === "welcome" ? <WelcomeStep styles={styles} isWide={isWide} onCreate={() => moveTo("discover")} onSignIn={goToSignIn} /> : null}
                                {stage === "discover" ? <DiscoverStep styles={styles} colours={colours} onContinue={() => moveTo("profile")} /> : null}
                                {stage === "profile" ? <ProfileStep styles={styles} colours={colours} displayName={displayName} setDisplayName={setDisplayName} focusMinutes={focusMinutes} setFocusMinutes={setFocusMinutes} onContinue={continueFromProfile} /> : null}
                                {stage === "email" ? <EmailStep styles={styles} colours={colours} email={email} setEmail={setEmail} onContinue={continueFromEmail} /> : null}
                                {stage === "password" ? <PasswordStep styles={styles} colours={colours} password={password} setPassword={setPassword} onContinue={continueFromPassword} /> : null}
                                {stage === "confirm" ? <ConfirmStep styles={styles} colours={colours} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} displayName={displayName.trim()} focusMinutes={focusMinutes} isSubmitting={isSubmitting} onSubmit={createAccount} /> : null}

                                {validationMessage ? (
                                    <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(180)} style={styles.errorBox}>
                                        <Text style={styles.errorText}>{validationMessage}</Text>
                                    </Animated.View>
                                ) : null}
                            </Animated.View>
                        </Animated.View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

type StepStyles = ReturnType<typeof createStyles>;

function BrandMark({ styles, colours, compact = false }: { styles: StepStyles; colours: AppColours; compact?: boolean }) {
    return (
        <View style={[styles.brandRow, compact && styles.brandRowCompact]}>
            <View style={[styles.brandMark, compact && styles.brandMarkCompact]}>
                <Timer size={compact ? 18 : 22} strokeWidth={2.5} color={colours.onPrimary} />
            </View>
            <Text style={styles.brandName}>NO MORE LATER</Text>
        </View>
    );
}

function DefaultTimerPreview({ size }: { size: number }) {
    return <FocusTimerDisplay seconds={1500} totalSeconds={1500} label="" hint="" timerStyleOverride="orbit" sizeOverride={size} preview />;
}

function WelcomeStep({ styles, isWide, onCreate, onSignIn }: { styles: StepStyles; isWide: boolean; onCreate: () => void; onSignIn: () => void }) {
    return (
        <>
            <View style={styles.stepHeader}>
                <Text style={styles.stepEyebrow}>A FRESH START</Text>
                <Text style={styles.stepTitle}>{isWide ? "Ready when you are." : "Make now easier than later."}</Text>
                <Text style={styles.stepDescription}>A calmer way to focus on what matters and see your effort turn into momentum.</Text>
            </View>
            {!isWide ? <View style={styles.mobileTimerPreview}><DefaultTimerPreview size={184} /></View> : null}
            <View style={styles.actions}>
                <PrimaryButton label="Show me around" onPress={onCreate} styles={styles} />
                <AnimatedPressable accessibilityRole="button" haptic="none" onPress={onSignIn} style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>I already have an account</Text>
                </AnimatedPressable>
            </View>
        </>
    );
}

function DiscoverStep({ styles, colours, onContinue }: { styles: StepStyles; colours: AppColours; onContinue: () => void }) {
    return (
        <>
            <View style={styles.stepHeader}>
                <Text style={styles.stepEyebrow}>BUILT AROUND YOUR MOMENTUM</Text>
                <Text style={styles.stepTitle}>Everything has a purpose.</Text>
                <Text style={styles.stepDescription}>Three simple views keep the next action and your progress easy to understand.</Text>
            </View>
            <View style={styles.previewStack}>
                <FeaturePreview icon={ListChecks} label="TASKS" title="Know what comes next" styles={styles} colours={colours}>
                    <View style={styles.taskPreviewRow}>
                        <View style={styles.taskPreviewCheck}><Check size={10} strokeWidth={3} color={colours.primaryStrong} /></View>
                        <View style={styles.taskPreviewCopy}>
                            <View style={[styles.skeletonLine, styles.skeletonLineLong]} />
                            <Text style={styles.previewFinePrint}>25m focused · progress saved</Text>
                        </View>
                    </View>
                </FeaturePreview>
                <FeaturePreview icon={BarChart3} label="PROGRESS" title="See consistency at a glance" styles={styles} colours={colours}>
                    <View style={styles.chartPreview}>
                        {[38, 56, 30, 72, 48, 88, 64].map((height, index) => <View key={`${height}-${index}`} style={[styles.chartBar, index === 5 && styles.chartBarToday, { height: `${height}%` }]} />)}
                    </View>
                </FeaturePreview>
                <FeaturePreview icon={Award} label="FOCUS RANKS" title="Let focused minutes add up" styles={styles} colours={colours}>
                    <View style={styles.rankPreviewRow}>
                        {RANK_PREVIEW_ITEMS.map((rank, index) => (
                            <View key={rank.id} style={styles.rankPreviewItem}>
                                <View style={[styles.rankImageShell, index === 1 && styles.rankImageShellActive]}><Image source={ANIMAL_RANK_IMAGES[rank.id]} contentFit="contain" style={styles.rankImage} /></View>
                                <Text style={[styles.rankPreviewName, index === 1 && styles.rankPreviewNameActive]}>{rank.name}</Text>
                            </View>
                        ))}
                    </View>
                </FeaturePreview>
            </View>
            <PrimaryButton label="Set up my focus" onPress={onContinue} styles={styles} />
        </>
    );
}

function FeaturePreview({ icon: Icon, label, title, styles, colours, children }: { icon: LucideIcon; label: string; title: string; styles: StepStyles; colours: AppColours; children: ReactNode }) {
    return (
        <View style={styles.featurePreview}>
            <View style={styles.featurePreviewHeading}>
                <View style={styles.featurePreviewIcon}><Icon size={15} strokeWidth={2.4} color={colours.primaryStrong} /></View>
                <View style={styles.featurePreviewCopy}><Text style={styles.featurePreviewLabel}>{label}</Text><Text style={styles.featurePreviewTitle}>{title}</Text></View>
            </View>
            <View style={styles.featurePreviewVisual}>{children}</View>
        </View>
    );
}

function ProfileStep({ styles, colours, displayName, setDisplayName, focusMinutes, setFocusMinutes, onContinue }: { styles: StepStyles; colours: AppColours; displayName: string; setDisplayName: (value: string) => void; focusMinutes: number; setFocusMinutes: (value: number) => void; onContinue: () => void }) {
    return (
        <>
            <View style={styles.stepHeader}><Text style={styles.stepEyebrow}>MAKE IT YOURS</Text><Text style={styles.stepTitle}>Choose your starting rhythm.</Text><Text style={styles.stepDescription}>Tell us what to call you and pick a realistic first Focus Timer.</Text></View>
            <AuthInput label="DISPLAY NAME" value={displayName} onChangeText={setDisplayName} placeholder="How should we call you?" colours={colours} icon={UserRound} required autoCapitalize="words" autoCorrect={false} maxLength={40} />
            <View style={styles.nameNote}><UserRound size={14} color={colours.primaryStrong} /><Text style={styles.nameNoteText}>Shown on leaderboards. You can change it once later, so choose carefully.</Text></View>
            <View style={styles.durationSection}>
                <View><Text style={styles.fieldLabel}>STARTER FOCUS TIMER</Text><Text style={styles.fieldHint}>You can adjust this whenever you start a session.</Text></View>
                <View style={styles.durationOptions}>
                    {FOCUS_OPTIONS.map((option) => {
                        const isSelected = focusMinutes === option.minutes;
                        return (
                            <AnimatedPressable key={option.minutes} accessibilityRole="radio" accessibilityState={{ checked: isSelected }} haptic="selection" onPress={() => setFocusMinutes(option.minutes)} style={[styles.durationOption, isSelected && styles.durationOptionSelected]}>
                                <Text style={[styles.durationMinutes, isSelected && styles.durationMinutesSelected]}>{option.minutes}</Text><Text style={[styles.durationUnit, isSelected && styles.durationUnitSelected]}>min</Text><Text style={[styles.durationLabel, isSelected && styles.durationLabelSelected]}>{option.label}</Text>
                                {isSelected ? <View style={styles.durationCheck}><Check size={11} strokeWidth={3} color={colours.onPrimary} /></View> : null}
                            </AnimatedPressable>
                        );
                    })}
                </View>
            </View>
            <PrimaryButton label="Continue" onPress={onContinue} styles={styles} />
        </>
    );
}

function EmailStep({ styles, colours, email, setEmail, onContinue }: { styles: StepStyles; colours: AppColours; email: string; setEmail: (value: string) => void; onContinue: () => void }) {
    return <><AccountStepHeader styles={styles} icon={Mail} title="Where should your progress live?" description="Use the email you want connected to No More Later." /><AuthInput label="EMAIL" value={email} onChangeText={setEmail} placeholder="you@example.com" colours={colours} icon={Mail} required keyboardType="email-address" autoCapitalize="none" autoCorrect={false} /><InfoNote styles={styles} colours={colours} icon={ShieldCheck} text="Your email is used for your secure account and sign-in." /><PrimaryButton label="Continue" onPress={onContinue} styles={styles} /></>;
}

function PasswordStep({ styles, colours, password, setPassword, onContinue }: { styles: StepStyles; colours: AppColours; password: string; setPassword: (value: string) => void; onContinue: () => void }) {
    return <><AccountStepHeader styles={styles} icon={LockKeyhole} title="Keep your progress secure." description="Choose a password that is memorable to you and difficult for others to guess." /><AuthInput label="PASSWORD" value={password} onChangeText={setPassword} placeholder="At least 8 characters" colours={colours} icon={LockKeyhole} required secureTextEntry autoCapitalize="none" autoCorrect={false} /><View style={styles.requirementList}><RequirementRow styles={styles} colours={colours} complete={password.length >= 8} text="At least 8 characters" /><RequirementRow styles={styles} colours={colours} complete={password.length > 0 && /[A-Za-z]/.test(password)} text="Contains a letter" /><RequirementRow styles={styles} colours={colours} complete={password.length > 0 && /[^A-Za-z]/.test(password)} text="Add a number or symbol for extra strength" optional /></View><PrimaryButton label="Continue" onPress={onContinue} styles={styles} /></>;
}

function ConfirmStep({ styles, colours, confirmPassword, setConfirmPassword, displayName, focusMinutes, isSubmitting, onSubmit }: { styles: StepStyles; colours: AppColours; confirmPassword: string; setConfirmPassword: (value: string) => void; displayName: string; focusMinutes: number; isSubmitting: boolean; onSubmit: () => void }) {
    return (
        <>
            <AccountStepHeader styles={styles} icon={CheckCircle2} title="One last check." description="Confirm your password, then your setup is complete." />
            <View style={styles.setupSummary}><View style={styles.summaryAvatar}><Text style={styles.summaryAvatarText}>{displayName.charAt(0).toUpperCase()}</Text></View><View style={styles.summaryCopy}><Text numberOfLines={1} style={styles.summaryName}>{displayName}</Text><Text style={styles.summaryDetail}>{focusMinutes}-minute starter timer</Text></View><View style={styles.summaryReady}><Check size={14} strokeWidth={3} color={colours.success} /></View></View>
            <AuthInput label="CONFIRM PASSWORD" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Enter your password again" colours={colours} icon={LockKeyhole} required secureTextEntry autoCapitalize="none" autoCorrect={false} />
            <PrimaryButton label={isSubmitting ? "Creating your space..." : "Create account & start"} disabled={isSubmitting} onPress={onSubmit} styles={styles} />
            <Text style={styles.privacyNote}>Your Focus Sessions, streaks and progress will be kept with your account.</Text>
        </>
    );
}

function AccountStepHeader({ styles, icon: Icon, title, description }: { styles: StepStyles; icon: LucideIcon; title: string; description: string }) {
    return <View style={styles.accountHeader}><View style={styles.accountHeaderIcon}><Icon size={21} strokeWidth={2.3} color={AUTH_COLOURS.primaryStrong} /></View><View style={styles.stepHeader}><Text style={styles.stepEyebrow}>SAVE YOUR PROGRESS</Text><Text style={styles.stepTitle}>{title}</Text><Text style={styles.stepDescription}>{description}</Text></View></View>;
}

function InfoNote({ styles, colours, icon: Icon, text }: { styles: StepStyles; colours: AppColours; icon: LucideIcon; text: string }) {
    return <View style={styles.infoNote}><Icon size={15} strokeWidth={2.3} color={colours.primaryStrong} /><Text style={styles.infoNoteText}>{text}</Text></View>;
}

function RequirementRow({ styles, colours, complete, text, optional = false }: { styles: StepStyles; colours: AppColours; complete: boolean; text: string; optional?: boolean }) {
    return <View style={styles.requirementRow}><View style={[styles.requirementIcon, complete && styles.requirementIconComplete]}>{complete ? <Check size={11} strokeWidth={3} color={colours.onPrimary} /> : null}</View><Text style={[styles.requirementText, complete && styles.requirementTextComplete]}>{text}{optional ? " (recommended)" : ""}</Text></View>;
}

function PrimaryButton({ label, onPress, disabled = false, styles }: { label: string; onPress: () => void; disabled?: boolean; styles: StepStyles }) {
    return <AnimatedPressable accessibilityRole="button" disabled={disabled} haptic="light" pressedScale={0.98} onPress={onPress} style={[styles.primaryButton, disabled && styles.primaryButtonDisabled]}><Text style={styles.primaryButtonText}>{label}</Text>{!disabled ? <ArrowRight size={18} strokeWidth={2.5} color="#ffffff" /> : null}</AnimatedPressable>;
}

function createStyles(colours: AppColours, isWide: boolean) {
    return StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: colours.background },
        keyboardView: { flex: 1 },
        screen: { flex: 1, backgroundColor: colours.background },
        contentContainer: { flexGrow: 1, justifyContent: "center", paddingHorizontal: isWide ? spacing.xl : spacing.sm, paddingVertical: isWide ? spacing.xl : spacing.sm },
        glowOne: { position: "absolute", top: -170, left: -120, width: 420, height: 420, borderRadius: radius.pill, backgroundColor: colours.primarySoft, opacity: 0.85 },
        glowTwo: { position: "absolute", right: -150, bottom: -190, width: 410, height: 410, borderRadius: radius.pill, backgroundColor: colours.primarySubtle },
        shell: { width: "100%", maxWidth: 1080, minHeight: isWide ? 680 : undefined, alignSelf: "center", flexDirection: isWide ? "row" : "column", overflow: "hidden", borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: isWide ? radius.xl : radius.lg, backgroundColor: colours.surface, shadowColor: "#171348", shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.1, shadowRadius: 34, elevation: 8 },
        heroPanel: { flex: 1.05, minWidth: 0, padding: spacing.xxl, backgroundColor: colours.primarySubtle },
        brandRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
        brandRowCompact: { paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colours.border },
        brandMark: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: radius.md, backgroundColor: colours.primary, transform: [{ rotate: "-4deg" }] },
        brandMarkCompact: { width: 36, height: 36, borderRadius: radius.sm },
        brandName: { fontSize: 12, fontWeight: "900", letterSpacing: 1.1, color: colours.primaryStrong },
        heroCopy: { maxWidth: 470, marginTop: spacing.xl, gap: spacing.sm },
        eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.1, color: colours.primaryStrong },
        heroTitle: { maxWidth: 470, fontSize: 42, lineHeight: 48, fontWeight: "900", letterSpacing: -1.1, color: colours.text },
        heroDescription: { maxWidth: 450, fontSize: 15, lineHeight: 23, color: colours.textMuted },
        desktopTimerPreview: { alignItems: "center", justifyContent: "center", marginTop: spacing.lg },
        mobileTimerPreview: { minHeight: 200, alignItems: "center", justifyContent: "center", marginVertical: -spacing.sm },
        valueList: { gap: spacing.sm, marginTop: spacing.md },
        valueRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
        valueIcon: { width: 27, height: 27, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.pill, backgroundColor: colours.surface },
        valueText: { flex: 1, fontSize: 12, fontWeight: "700", color: colours.text },
        setupPanel: { width: isWide ? 470 : "100%", minWidth: 0, padding: isWide ? spacing.xl : 12, backgroundColor: colours.surface },
        progressHeader: { minHeight: isWide ? 40 : 36, flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: isWide ? 0 : spacing.xs },
        backButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colours.border, borderRadius: radius.pill, backgroundColor: colours.background },
        progressCopy: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
        progressStage: { fontSize: 10, fontWeight: "900", letterSpacing: 0.9, color: colours.primaryStrong },
        progressCount: { fontSize: 10, fontWeight: "700", color: colours.textMuted },
        progressTrack: { height: 4, marginTop: isWide ? spacing.sm : spacing.xs, overflow: "hidden", borderRadius: radius.pill, backgroundColor: colours.border },
        progressFill: { height: "100%", borderRadius: radius.pill, backgroundColor: colours.primary },
        stepContent: { flex: 1, justifyContent: "center", gap: isWide ? spacing.lg : 12, paddingTop: isWide ? spacing.lg : 12, paddingBottom: isWide ? spacing.md : 0 },
        stepHeader: { gap: spacing.sm },
        stepEyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1, color: colours.primaryStrong },
        stepTitle: { fontSize: isWide ? 30 : 25, lineHeight: isWide ? 36 : 30, fontWeight: "900", letterSpacing: -0.6, color: colours.text },
        stepDescription: { fontSize: 13, lineHeight: 19, color: colours.textMuted },
        actions: { gap: spacing.sm },
        primaryButton: { minHeight: isWide ? 52 : 46, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.md, backgroundColor: colours.primary },
        primaryButtonDisabled: { opacity: 0.58 },
        primaryButtonText: { fontSize: 15, fontWeight: "900", color: colours.onPrimary },
        secondaryButton: { minHeight: isWide ? 50 : 44, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.md, backgroundColor: colours.primarySubtle },
        secondaryButtonText: { fontSize: 14, fontWeight: "800", color: colours.primaryStrong },
        previewStack: { gap: spacing.sm },
        featurePreview: { flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: isWide ? 98 : 88, padding: spacing.md, borderWidth: 1, borderColor: colours.border, borderRadius: radius.md, backgroundColor: colours.background },
        featurePreviewHeading: { width: "47%", minWidth: 0, flexDirection: "row", alignItems: "center", gap: spacing.sm },
        featurePreviewIcon: { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: radius.sm, backgroundColor: colours.primarySoft },
        featurePreviewCopy: { minWidth: 0, flex: 1 },
        featurePreviewLabel: { fontSize: 8, fontWeight: "900", letterSpacing: 0.7, color: colours.primaryStrong },
        featurePreviewTitle: { marginTop: 2, fontSize: 11, lineHeight: 15, fontWeight: "800", color: colours.text },
        featurePreviewVisual: { minWidth: 0, flex: 1, alignItems: "stretch", justifyContent: "center" },
        taskPreviewRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
        taskPreviewCheck: { width: 22, height: 22, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.sm, backgroundColor: colours.primarySoft },
        taskPreviewCopy: { minWidth: 0, flex: 1 },
        skeletonLine: { height: 6, borderRadius: radius.pill, backgroundColor: colours.primaryMuted },
        skeletonLineLong: { width: "78%" },
        previewFinePrint: { marginTop: 5, fontSize: 8, color: colours.textMuted },
        chartPreview: { height: 50, flexDirection: "row", alignItems: "flex-end", gap: 4, paddingHorizontal: spacing.xs, borderBottomWidth: 1, borderBottomColor: colours.border },
        chartBar: { flex: 1, minHeight: 4, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: colours.primaryMuted },
        chartBarToday: { backgroundColor: colours.primary },
        rankPreviewRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-around", gap: spacing.xs },
        rankPreviewItem: { minWidth: 0, flex: 1, alignItems: "center" },
        rankImageShell: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colours.border, borderRadius: radius.pill, backgroundColor: colours.surface },
        rankImageShellActive: { borderWidth: 2, borderColor: colours.primary, backgroundColor: colours.primarySoft },
        rankImage: { width: 31, height: 31 },
        rankPreviewName: { maxWidth: "100%", marginTop: 3, fontSize: 7, fontWeight: "700", color: colours.textMuted },
        rankPreviewNameActive: { color: colours.primaryStrong },
        nameNote: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginTop: -spacing.sm, padding: spacing.sm, borderRadius: radius.sm, backgroundColor: colours.primarySubtle },
        nameNoteText: { flex: 1, fontSize: 11, lineHeight: 16, color: colours.textMuted },
        durationSection: { gap: spacing.md },
        fieldLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 0.8, color: colours.textMuted },
        fieldHint: { marginTop: spacing.xs, fontSize: 11, color: colours.textMuted },
        durationOptions: { flexDirection: "row", gap: spacing.sm },
        durationOption: { minWidth: 0, flex: 1, position: "relative", alignItems: "center", paddingHorizontal: spacing.xs, paddingVertical: spacing.md, borderWidth: 1, borderColor: colours.border, borderRadius: radius.md, backgroundColor: colours.background },
        durationOptionSelected: { borderColor: colours.primary, backgroundColor: colours.primarySoft },
        durationMinutes: { fontSize: 23, fontWeight: "900", color: colours.text },
        durationMinutesSelected: { color: colours.primaryStrong },
        durationUnit: { marginTop: -3, fontSize: 9, fontWeight: "800", letterSpacing: 0.5, color: colours.textMuted },
        durationUnitSelected: { color: colours.primaryStrong },
        durationLabel: { marginTop: spacing.sm, textAlign: "center", fontSize: 9, fontWeight: "700", color: colours.textMuted },
        durationLabelSelected: { color: colours.primaryStrong },
        durationCheck: { position: "absolute", top: 7, right: 7, width: 18, height: 18, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.primary },
        accountHeader: { gap: spacing.md },
        accountHeaderIcon: { width: 46, height: 46, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.md, backgroundColor: colours.primarySoft },
        infoNote: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colours.primarySubtle },
        infoNoteText: { flex: 1, fontSize: 11, lineHeight: 16, color: colours.textMuted },
        requirementList: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colours.background },
        requirementRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
        requirementIcon: { width: 18, height: 18, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colours.border, borderRadius: radius.pill, backgroundColor: colours.surface },
        requirementIconComplete: { borderColor: colours.primary, backgroundColor: colours.primary },
        requirementText: { flex: 1, fontSize: 11, color: colours.textMuted },
        requirementTextComplete: { color: colours.text },
        setupSummary: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.md, backgroundColor: colours.primarySubtle },
        summaryAvatar: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.primary },
        summaryAvatarText: { fontSize: 17, fontWeight: "900", color: colours.onPrimary },
        summaryCopy: { minWidth: 0, flex: 1 },
        summaryName: { fontSize: 14, fontWeight: "900", color: colours.text },
        summaryDetail: { marginTop: 2, fontSize: 11, color: colours.textMuted },
        summaryReady: { width: 28, height: 28, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: colours.successSoft },
        privacyNote: { marginTop: -spacing.sm, textAlign: "center", fontSize: 10, lineHeight: 15, color: colours.textMuted },
        errorBox: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colours.dangerSoft },
        errorText: { fontSize: 13, lineHeight: 19, color: colours.danger },
    });
}
