import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ChevronLeft, ChevronRight, Image as ImageIcon, MoonStar, Palette, Sparkles, Timer } from "lucide-react-native";
import Animated, { FadeIn, FadeOut, useReducedMotion } from "react-native-reanimated";

import { AppBackdrop } from "@/components/appearance/AppBackdrop";
import { TimerStylePreview } from "@/components/appearance/TimerStylePreview";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import type { AppColours } from "@/constants/appearanceColours";
import { ACCENT_COLOUR_OPTIONS } from "@/constants/appearance";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

const SHOWCASE_SLIDES = [
    { id: "backdrops", eyebrow: "ATMOSPHERE", title: "A space that feels worth returning to", description: "Choose from nine illustrated backdrops that add calm scenery without distracting from your work.", icon: ImageIcon },
    { id: "timers", eyebrow: "FOCUS FACES", title: "Make every minute feel intentional", description: "Switch between Minimal, Segments, Soft Dial, Blocks and Concentric across Focus and break timers.", icon: Timer },
    { id: "accents", eyebrow: "COLOUR STUDIO", title: "Set the tone with one tap", description: "Bring actions, progress and highlights to life with five additional Premium accent palettes.", icon: Palette },
    { id: "modes", eyebrow: "DAY TO NIGHT", title: "Comfortable in every environment", description: "Follow your device automatically or settle into Dark and true-black AMOLED appearances.", icon: MoonStar },
] as const;

const PREMIUM_ACCENTS = ACCENT_COLOUR_OPTIONS.filter((option) => option.requiresPremium);

export function PremiumFeatureShowcase() {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const reduceMotion = useReducedMotion();
    const [activeIndex, setActiveIndex] = useState(0);
    const activeSlide = SHOWCASE_SLIDES[activeIndex];
    const ActiveIcon = activeSlide.icon;

    useEffect(() => {
        if (reduceMotion) return;

        const timer = setTimeout(() => {
            setActiveIndex((current) => (current + 1) % SHOWCASE_SLIDES.length);
        }, 5200);

        return () => clearTimeout(timer);
    }, [activeIndex, reduceMotion]);

    return (
        <View style={styles.showcase}>
            <View style={styles.showcaseHeading}>
                <View>
                    <Text style={styles.sectionEyebrow}>SEE PREMIUM IN ACTION</Text>
                    <Text style={styles.sectionTitle}>Built to feel like your space</Text>
                </View>
                <View style={styles.counterBadge}>
                    <Sparkles size={13} color={colours.primaryStrong} />
                    <Text style={styles.counterText}>{activeIndex + 1} / {SHOWCASE_SLIDES.length}</Text>
                </View>
            </View>

            <View style={styles.stage}>
                <Animated.View key={activeSlide.id} entering={reduceMotion ? undefined : FadeIn.duration(320)} exiting={reduceMotion ? undefined : FadeOut.duration(180)} style={styles.slide}>
                    <View style={styles.previewPanel}>{renderPreview(activeSlide.id, styles, colours)}</View>
                    <View style={styles.slideCopy}>
                        <View style={styles.slideEyebrowRow}>
                            <View style={styles.slideIcon}><ActiveIcon size={17} color={colours.primaryStrong} /></View>
                            <Text style={styles.slideEyebrow}>{activeSlide.eyebrow}</Text>
                        </View>
                        <Text style={styles.slideTitle}>{activeSlide.title}</Text>
                        <Text style={styles.slideDescription}>{activeSlide.description}</Text>
                    </View>
                </Animated.View>
            </View>

            <View style={styles.controls}>
                <AnimatedPressable accessibilityLabel="Show previous Premium feature" accessibilityRole="button" onPress={() => setActiveIndex((current) => (current - 1 + SHOWCASE_SLIDES.length) % SHOWCASE_SLIDES.length)} style={styles.arrowButton}>
                    <ChevronLeft size={18} color={colours.text} />
                </AnimatedPressable>
                <View accessibilityRole="tablist" style={styles.dots}>
                    {SHOWCASE_SLIDES.map((slide, index) => {
                        const isActive = index === activeIndex;
                        return (
                            <AnimatedPressable key={slide.id} accessibilityRole="tab" accessibilityLabel={`Show ${slide.eyebrow.toLowerCase()} preview`} accessibilityState={{ selected: isActive }} haptic="none" onPress={() => setActiveIndex(index)} style={[styles.dot, isActive && styles.dotActive]} />
                        );
                    })}
                </View>
                <AnimatedPressable accessibilityLabel="Show next Premium feature" accessibilityRole="button" onPress={() => setActiveIndex((current) => (current + 1) % SHOWCASE_SLIDES.length)} style={styles.arrowButton}>
                    <ChevronRight size={18} color={colours.text} />
                </AnimatedPressable>
            </View>
        </View>
    );
}

function renderPreview(slideId: (typeof SHOWCASE_SLIDES)[number]["id"], styles: ReturnType<typeof createStyles>, colours: AppColours) {
    if (slideId === "backdrops") {
        return (
            <View style={styles.backdropPreview}>
                <AppBackdrop backdropOverride="mountains" preview />
                <View style={styles.backdropUiCard}>
                    <View style={styles.backdropUiTop}><View style={styles.backdropUiDot} /><Text style={styles.backdropUiLabel}>TODAY&apos;S FOCUS</Text></View>
                    <Text style={styles.backdropUiTitle}>One meaningful thing</Text>
                    <View style={styles.backdropUiProgress}><View style={styles.backdropUiProgressFill} /></View>
                </View>
                <View style={styles.previewBadge}><Text style={styles.previewBadgeText}>Mountains</Text></View>
            </View>
        );
    }

    if (slideId === "timers") {
        return (
            <View style={styles.timerPreview}>
                <View style={styles.timerPreviewCard}><TimerStylePreview timerStyle="concentric" /></View>
                <View style={styles.timerNames}>
                    {["Minimal", "Segments", "Soft", "Blocks", "Rings"].map((name, index) => (
                        <View key={name} style={[styles.timerNameChip, index === 4 && styles.timerNameChipActive]}><Text style={[styles.timerNameText, index === 4 && styles.timerNameTextActive]}>{name}</Text></View>
                    ))}
                </View>
            </View>
        );
    }

    if (slideId === "accents") {
        return (
            <View style={styles.accentPreview}>
                <View style={styles.accentMockCard}>
                    <View style={styles.accentMockHeader}>
                        <View style={styles.accentMockIcon}><Sparkles size={16} color={colours.onPrimary} /></View>
                        <View style={styles.accentMockCopy}><View style={styles.accentMockTitle} /><View style={styles.accentMockSubtitle} /></View>
                    </View>
                    <View style={styles.accentMockTrack}><View style={styles.accentMockFill} /></View>
                </View>
                <View style={styles.swatchRow}>
                    {PREMIUM_ACCENTS.map((option) => (
                        <View key={option.id} style={styles.swatchItem}><View style={[styles.swatch, { backgroundColor: option.previewColour }]} /><Text style={styles.swatchName}>{option.name}</Text></View>
                    ))}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.modePreview}>
            {[
                { name: "System", background: "#f0f1f5", surface: "#ffffff", text: "#292929" },
                { name: "Dark", background: "#111318", surface: "#1a1d23", text: "#f5f5f5" },
                { name: "AMOLED", background: "#000000", surface: "#0a0a0a", text: "#f5f5f5" },
            ].map((mode) => (
                <View key={mode.name} style={styles.modeItem}>
                    <View style={[styles.modePhone, { backgroundColor: mode.background }]}>
                        <View style={[styles.modePhoneBar, { backgroundColor: mode.surface }]} />
                        <View style={[styles.modePhoneCard, { backgroundColor: mode.surface }]}><View style={[styles.modePhoneTitle, { backgroundColor: mode.text }]} /><View style={styles.modePhoneAccent} /></View>
                    </View>
                    <Text style={styles.modeName}>{mode.name}</Text>
                </View>
            ))}
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        showcase: { gap: spacing.md },
        showcaseHeading: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: spacing.md },
        sectionEyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.1, color: colours.primaryStrong },
        sectionTitle: { marginTop: 5, fontSize: 22, lineHeight: 28, fontWeight: "900", letterSpacing: -0.4, color: colours.text },
        counterBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.pill, backgroundColor: colours.primarySoft },
        counterText: { fontSize: 10, fontWeight: "900", color: colours.primaryStrong },
        stage: { minHeight: 390, overflow: "hidden", borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.xl, backgroundColor: colours.surface },
        slide: { flex: 1 },
        previewPanel: { height: 224, overflow: "hidden", borderBottomWidth: 1, borderBottomColor: colours.border, backgroundColor: colours.primarySubtle },
        slideCopy: { gap: spacing.sm, padding: spacing.lg },
        slideEyebrowRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
        slideIcon: { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: radius.md, backgroundColor: colours.primarySoft },
        slideEyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1, color: colours.primaryStrong },
        slideTitle: { fontSize: 20, lineHeight: 25, fontWeight: "900", letterSpacing: -0.35, color: colours.text },
        slideDescription: { fontSize: 13, lineHeight: 20, color: colours.textMuted },
        controls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
        arrowButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colours.border, borderRadius: radius.pill, backgroundColor: colours.surface },
        dots: { flexDirection: "row", alignItems: "center", gap: 7 },
        dot: { width: 8, height: 8, borderRadius: radius.pill, backgroundColor: colours.border },
        dotActive: { width: 25, backgroundColor: colours.primary },
        backdropPreview: { flex: 1, justifyContent: "center", padding: spacing.lg },
        backdropUiCard: { width: "78%", maxWidth: 360, alignSelf: "center", gap: spacing.sm, padding: spacing.md, borderWidth: 1, borderColor: "rgba(255,255,255,0.72)", borderRadius: radius.lg, backgroundColor: "rgba(255,255,255,0.88)" },
        backdropUiTop: { flexDirection: "row", alignItems: "center", gap: 6 },
        backdropUiDot: { width: 7, height: 7, borderRadius: radius.pill, backgroundColor: colours.primary },
        backdropUiLabel: { fontSize: 8, fontWeight: "900", letterSpacing: 0.9, color: "#545b6a" },
        backdropUiTitle: { fontSize: 17, fontWeight: "900", color: "#18181b" },
        backdropUiProgress: { height: 6, overflow: "hidden", borderRadius: radius.pill, backgroundColor: "rgba(79,70,229,0.14)" },
        backdropUiProgressFill: { width: "64%", height: "100%", borderRadius: radius.pill, backgroundColor: colours.primary },
        previewBadge: { position: "absolute", right: spacing.md, bottom: spacing.md, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: "rgba(10,10,20,0.72)" },
        previewBadgeText: { fontSize: 10, fontWeight: "800", color: "#ffffff" },
        timerPreview: { flex: 1, justifyContent: "center", gap: spacing.md, padding: spacing.lg },
        timerPreviewCard: { width: "58%", minWidth: 180, maxWidth: 320, alignSelf: "center" },
        timerNames: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: 6 },
        timerNameChip: { paddingHorizontal: 9, paddingVertical: 5, borderWidth: 1, borderColor: colours.border, borderRadius: radius.pill, backgroundColor: colours.surface },
        timerNameChipActive: { borderColor: colours.primaryBorder, backgroundColor: colours.primarySoft },
        timerNameText: { fontSize: 9, fontWeight: "700", color: colours.textMuted },
        timerNameTextActive: { color: colours.primaryStrong },
        accentPreview: { flex: 1, justifyContent: "center", gap: spacing.lg, padding: spacing.lg },
        accentMockCard: { width: "76%", maxWidth: 350, alignSelf: "center", gap: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colours.primaryBorder, borderRadius: radius.lg, backgroundColor: colours.surface },
        accentMockHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
        accentMockIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: radius.md, backgroundColor: colours.primary },
        accentMockCopy: { flex: 1, gap: 6 },
        accentMockTitle: { width: "58%", height: 8, borderRadius: radius.pill, backgroundColor: colours.text },
        accentMockSubtitle: { width: "82%", height: 6, borderRadius: radius.pill, backgroundColor: colours.border },
        accentMockTrack: { height: 7, overflow: "hidden", borderRadius: radius.pill, backgroundColor: colours.primarySoft },
        accentMockFill: { width: "72%", height: "100%", borderRadius: radius.pill, backgroundColor: colours.primary },
        swatchRow: { flexDirection: "row", justifyContent: "center", gap: spacing.sm },
        swatchItem: { alignItems: "center", gap: 5 },
        swatch: { width: 27, height: 27, borderWidth: 3, borderColor: colours.surface, borderRadius: radius.pill },
        swatchName: { fontSize: 8, fontWeight: "700", color: colours.textMuted },
        modePreview: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.lg },
        modeItem: { flex: 1, maxWidth: 140, alignItems: "center", gap: spacing.sm },
        modePhone: { width: "100%", aspectRatio: 0.72, gap: 8, padding: 8, borderWidth: 1, borderColor: colours.border, borderRadius: radius.lg },
        modePhoneBar: { height: 14, borderRadius: radius.sm },
        modePhoneCard: { flex: 1, justifyContent: "space-between", padding: 8, borderRadius: radius.md },
        modePhoneTitle: { width: "58%", height: 5, borderRadius: radius.pill, opacity: 0.72 },
        modePhoneAccent: { width: "100%", height: 9, borderRadius: radius.pill, backgroundColor: colours.primary },
        modeName: { fontSize: 10, fontWeight: "800", color: colours.text },
    });
}
