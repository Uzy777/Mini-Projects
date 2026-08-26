import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { radius } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { AppColours } from "@/constants/appearanceColours";
import type { TimerStyleId } from "@/types/appearance";

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
        return (
            <View style={styles.preview}>
                <View style={styles.flipPreviewCard}>
                    <Text style={styles.flipPreviewEyebrow}>FLIP CLOCK</Text>
                    <View style={styles.flipPreviewRow}>
                        {["2", "5", "0", "0"].map((digit, index) => (
                            <View key={index} style={styles.flipPreviewGroup}>
                                {index === 2 ? <Text style={styles.flipPreviewColon}>:</Text> : null}
                                <View style={styles.flipPreviewDigit}>
                                    <Text style={styles.flipPreviewNumber}>{digit}</Text>
                                </View>
                            </View>
                        ))}
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
        return (
            <View style={styles.preview}>
                <View style={styles.pulsePreviewCard}>
                    <View style={styles.pulsePreviewHeader}>
                        <Text style={styles.pulsePreviewEyebrow}>FOCUS PULSE</Text>
                        <Text style={styles.pulsePreviewPercent}>68%</Text>
                    </View>
                    <Text style={styles.pulsePreviewTime}>25:00</Text>
                    <View style={styles.pulsePreviewWave}>
                        {[7, 12, 19, 28, 20, 14, 24, 31, 22, 15, 9].map((height, index) => (
                            <View key={index} style={[styles.pulsePreviewBar, { height }, index > 6 && styles.pulsePreviewBarInactive]} />
                        ))}
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
        flipPreviewCard: {
            width: "84%",
            paddingHorizontal: 9,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.md,
            backgroundColor: colours.primarySubtle,
        },
        flipPreviewEyebrow: {
            fontSize: 5,
            fontWeight: "900",
            letterSpacing: 0.8,
            color: colours.primaryStrong,
        },
        flipPreviewRow: {
            marginTop: 6,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
        },
        flipPreviewGroup: {
            flexDirection: "row",
            alignItems: "center",
            gap: 3,
        },
        flipPreviewDigit: {
            width: 29,
            height: 43,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.sm,
            backgroundColor: colours.surface,
        },
        flipPreviewNumber: {
            fontSize: 26,
            lineHeight: 31,
            fontWeight: "900",
            fontVariant: ["tabular-nums"],
            color: colours.text,
        },
        flipPreviewColon: {
            fontSize: 16,
            fontWeight: "900",
            color: colours.primary,
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
        pulsePreviewCard: {
            width: "84%",
            minHeight: 90,
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.md,
            backgroundColor: colours.primarySubtle,
        },
        pulsePreviewHeader: {
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        pulsePreviewEyebrow: {
            fontSize: 5,
            fontWeight: "900",
            letterSpacing: 0.7,
            color: colours.primaryStrong,
        },
        pulsePreviewPercent: {
            fontSize: 6,
            fontWeight: "900",
            color: colours.primaryStrong,
        },
        pulsePreviewTime: {
            marginTop: 2,
            fontSize: 20,
            lineHeight: 24,
            fontWeight: "900",
            fontVariant: ["tabular-nums"],
            color: colours.text,
        },
        pulsePreviewWave: {
            height: 32,
            marginTop: 3,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 3,
        },
        pulsePreviewBar: {
            flex: 1,
            maxWidth: 7,
            borderRadius: radius.pill,
            backgroundColor: colours.primary,
        },
        pulsePreviewBarInactive: {
            backgroundColor: colours.primarySoft,
        },
    });
}
