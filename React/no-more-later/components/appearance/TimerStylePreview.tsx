import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, Mask } from "react-native-svg";

import { radius } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import type { TimerStyleId } from "@/types/appearance";

const PREVIEW_RING_SIZE = 76;
const PREVIEW_RING_RADIUS = 32;
const PREVIEW_CIRCUMFERENCE = 2 * Math.PI * PREVIEW_RING_RADIUS;

export function TimerStylePreview({ timerStyle }: { timerStyle: TimerStyleId }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);

    if (timerStyle === "minimal") {
        return (
            <View style={styles.preview}>
                <Text style={styles.largeTime}>25:00</Text>
                <View style={styles.lineTrack}><View style={[styles.lineFill, { width: "68%" }]} /></View>
            </View>
        );
    }

    if (timerStyle === "soft") {
        const softArcLength = PREVIEW_CIRCUMFERENCE * 0.76;

        return (
            <View style={styles.preview}>
                <View style={styles.softDial}>
                    <Svg width={PREVIEW_RING_SIZE} height={PREVIEW_RING_SIZE} style={StyleSheet.absoluteFillObject}>
                        <Defs>
                            <Mask id="soft-preview-mask">
                                <Circle
                                    cx={38}
                                    cy={38}
                                    r={PREVIEW_RING_RADIUS}
                                    fill="none"
                                    stroke="#ffffff"
                                    strokeWidth={7}
                                    strokeDasharray={`${softArcLength} ${PREVIEW_CIRCUMFERENCE}`}
                                    strokeLinecap="round"
                                    rotation="133"
                                    origin="38, 38"
                                />
                            </Mask>
                        </Defs>
                        <Circle
                            cx={38}
                            cy={38}
                            r={PREVIEW_RING_RADIUS}
                            fill="none"
                            stroke={colours.primarySoft}
                            strokeWidth={7}
                            strokeDasharray={`${softArcLength} ${PREVIEW_CIRCUMFERENCE}`}
                            strokeLinecap="round"
                            rotation="133"
                            origin="38, 38"
                        />
                        <Circle
                            mask="url(#soft-preview-mask)"
                            cx={38}
                            cy={38}
                            r={PREVIEW_RING_RADIUS}
                            fill="none"
                            stroke={colours.primary}
                            strokeWidth={7}
                            strokeDasharray={`${softArcLength * 0.68} ${PREVIEW_CIRCUMFERENCE}`}
                            strokeLinecap="round"
                            rotation="133"
                            origin="38, 38"
                        />
                    </Svg>
                    <View style={styles.softPreviewFace}>
                        <Text style={styles.time}>25:00</Text>
                    </View>
                </View>
            </View>
        );
    }

    if (timerStyle === "blocks") {
        return (
            <View style={styles.preview}>
                <View style={styles.digitalCard}>
                    <Text style={styles.digitalEyebrow}>DIGITAL FOCUS</Text>
                    <View style={styles.digitalPreviewRow}>
                        <View style={styles.digitalPreviewTile}>
                            <Text style={styles.digitalTime}>25</Text>
                            <Text style={styles.digitalUnit}>MIN</Text>
                        </View>
                        <Text style={styles.digitalColon}>:</Text>
                        <View style={styles.digitalPreviewTile}>
                            <Text style={styles.digitalTime}>00</Text>
                            <Text style={styles.digitalUnit}>SEC</Text>
                        </View>
                    </View>
                    <View style={styles.blockRow}>
                        {Array.from({ length: 10 }, (_, index) => <View key={index} style={[styles.block, index > 6 && styles.blockInactive]} />)}
                    </View>
                </View>
            </View>
        );
    }

    const isSegmented = timerStyle === "segmented";
    const isConcentric = timerStyle === "concentric";

    if (isSegmented) {
        const segmentStep = PREVIEW_CIRCUMFERENCE / 36;
        const segmentLength = segmentStep * 0.58;
        const segmentGap = segmentStep - segmentLength;

        return (
            <View style={styles.preview}>
                <View style={[styles.ringPreview, styles.segmentedBackground]}>
                    <Svg width={PREVIEW_RING_SIZE} height={PREVIEW_RING_SIZE} style={StyleSheet.absoluteFillObject}>
                        <Defs>
                            <Mask id="segmented-preview-mask">
                                <Circle
                                    cx={38}
                                    cy={38}
                                    r={PREVIEW_RING_RADIUS}
                                    fill="none"
                                    stroke="#ffffff"
                                    strokeWidth={6}
                                    strokeDasharray={`${segmentLength} ${segmentGap}`}
                                    strokeLinecap="round"
                                />
                            </Mask>
                        </Defs>
                        <Circle
                            cx={38}
                            cy={38}
                            r={PREVIEW_RING_RADIUS}
                            fill="none"
                            stroke={colours.primarySoft}
                            strokeWidth={6}
                            strokeDasharray={`${segmentLength} ${segmentGap}`}
                            strokeLinecap="round"
                        />
                        <Circle
                            mask="url(#segmented-preview-mask)"
                            cx={38}
                            cy={38}
                            r={PREVIEW_RING_RADIUS}
                            fill="none"
                            stroke={colours.primary}
                            strokeWidth={6}
                            strokeDasharray={`${PREVIEW_CIRCUMFERENCE * 0.68} ${PREVIEW_CIRCUMFERENCE}`}
                            strokeLinecap="round"
                            rotation="-90"
                            origin="38, 38"
                        />
                        <Circle cx={38} cy={38} r={23} fill="none" stroke={colours.primaryBorder} strokeWidth={1} />
                    </Svg>
                    <View style={styles.segmentedPreviewCore}>
                        <Text style={styles.time}>25:00</Text>
                        <Text style={styles.segmentedPreviewLabel}>PRECISION</Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.preview}>
            <View style={[styles.ringPreview, isConcentric && styles.concentricBackground]}>
                <Svg width={76} height={76} style={StyleSheet.absoluteFillObject}>
                    <Circle cx={38} cy={38} r={32} fill="none" stroke={colours.primarySoft} strokeWidth={isConcentric ? 4 : 6} />
                    <Circle cx={38} cy={38} r={32} fill="none" stroke={colours.primary} strokeWidth={isConcentric ? 4 : 6} strokeDasharray="138 64" strokeLinecap="round" rotation="-90" origin="38, 38" />
                    {isConcentric ? <Circle cx={38} cy={38} r={24} fill="none" stroke={colours.primaryMuted} strokeWidth={1.5} /> : null}
                </Svg>
                <Text style={styles.time}>25:00</Text>
            </View>
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        preview: {
            height: 112,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.md,
            backgroundColor: colours.background,
        },
        ringPreview: {
            width: 76,
            height: 76,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
        },
        concentricBackground: {
            backgroundColor: colours.primarySubtle,
        },
        time: {
            fontSize: 14,
            fontWeight: "900",
            fontVariant: ["tabular-nums"],
            color: colours.text,
        },
        largeTime: {
            fontSize: 24,
            lineHeight: 30,
            fontWeight: "800",
            fontVariant: ["tabular-nums"],
            letterSpacing: -1,
            color: colours.text,
        },
        lineTrack: {
            width: "68%",
            height: 4,
            marginTop: 10,
            overflow: "hidden",
            borderRadius: radius.pill,
            backgroundColor: colours.primarySoft,
        },
        lineFill: {
            height: "100%",
            borderRadius: radius.pill,
            backgroundColor: colours.primary,
        },
        softDial: {
            width: 78,
            height: 78,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
        },
        softPreviewFace: {
            width: 52,
            height: 52,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.pill,
            backgroundColor: colours.primarySubtle,
        },
        digitalCard: {
            width: "82%",
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.md,
            backgroundColor: colours.primarySubtle,
        },
        digitalEyebrow: {
            fontSize: 6,
            fontWeight: "900",
            letterSpacing: 0.8,
            color: colours.primaryStrong,
        },
        digitalPreviewRow: {
            width: "100%",
            marginTop: 5,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
        },
        digitalPreviewTile: {
            flex: 1,
            minHeight: 38,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.sm,
            backgroundColor: colours.surface,
        },
        digitalTime: {
            fontSize: 16,
            lineHeight: 18,
            fontWeight: "900",
            fontVariant: ["tabular-nums"],
            color: colours.text,
        },
        digitalUnit: {
            marginTop: 1,
            fontSize: 5,
            fontWeight: "900",
            letterSpacing: 0.7,
            color: colours.textMuted,
        },
        digitalColon: {
            fontSize: 14,
            fontWeight: "900",
            color: colours.primary,
        },
        blockRow: {
            width: "100%",
            flexDirection: "row",
            gap: 2,
            marginTop: 6,
        },
        block: {
            flex: 1,
            height: 3,
            borderRadius: radius.sm,
            backgroundColor: colours.primary,
        },
        blockInactive: {
            backgroundColor: colours.primarySoft,
        },
        segmentedBackground: {
            backgroundColor: colours.primarySubtle,
        },
        segmentedPreviewCore: {
            width: 48,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.pill,
            backgroundColor: colours.surface,
        },
        segmentedPreviewLabel: {
            marginTop: 1,
            fontSize: 5,
            fontWeight: "900",
            letterSpacing: 0.6,
            color: colours.primaryStrong,
        },
    });
}
