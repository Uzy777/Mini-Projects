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
                <View style={styles.marker} />
                <Text style={styles.largeTime}>25:00</Text>
                <View style={styles.lineTrack}><View style={[styles.lineFill, { width: "68%" }]} /></View>
            </View>
        );
    }

    if (timerStyle === "soft") {
        return (
            <View style={styles.preview}>
                <View style={styles.softDial}>
                    <View style={styles.softMarker} />
                    <Text style={styles.time}>25:00</Text>
                </View>
            </View>
        );
    }

    if (timerStyle === "blocks") {
        return (
            <View style={styles.preview}>
                <View style={styles.digitalCard}>
                    <Text style={styles.digitalTime}>25:00</Text>
                    <View style={styles.blockRow}>
                        {Array.from({ length: 8 }, (_, index) => <View key={index} style={[styles.block, index > 5 && styles.blockInactive]} />)}
                    </View>
                </View>
            </View>
        );
    }

    const isSegmented = timerStyle === "segmented";
    const isConcentric = timerStyle === "concentric";

    return (
        <View style={styles.preview}>
            <View style={[styles.ringPreview, isConcentric && styles.concentricBackground]}>
                <Svg width={76} height={76} style={StyleSheet.absoluteFillObject}>
                    <Circle cx={38} cy={38} r={32} fill="none" stroke={colours.primarySoft} strokeWidth={isConcentric ? 4 : 6} strokeDasharray={isSegmented ? "2 6" : undefined} />
                    <Circle cx={38} cy={38} r={32} fill="none" stroke={colours.primary} strokeWidth={isConcentric ? 4 : 6} strokeDasharray={isSegmented ? "2 6" : "138 64"} strokeLinecap="round" rotation="-90" origin="38, 38" />
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
        marker: {
            width: 6,
            height: 6,
            marginBottom: 6,
            borderRadius: radius.pill,
            backgroundColor: colours.primary,
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
            borderWidth: 2,
            borderColor: colours.primaryBorder,
            borderRadius: radius.pill,
            backgroundColor: colours.primarySubtle,
        },
        softMarker: {
            position: "absolute",
            top: 8,
            width: 6,
            height: 6,
            borderRadius: radius.pill,
            backgroundColor: colours.primary,
        },
        digitalCard: {
            width: "78%",
            paddingHorizontal: 12,
            paddingVertical: 14,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colours.primaryBorder,
            borderRadius: radius.md,
            backgroundColor: colours.primarySubtle,
        },
        digitalTime: {
            fontSize: 23,
            fontWeight: "900",
            fontVariant: ["tabular-nums"],
            letterSpacing: 1,
            color: colours.text,
        },
        blockRow: {
            width: "100%",
            flexDirection: "row",
            gap: 3,
            marginTop: 10,
        },
        block: {
            flex: 1,
            height: 4,
            borderRadius: radius.pill,
            backgroundColor: colours.primary,
        },
        blockInactive: {
            backgroundColor: colours.primarySoft,
        },
    });
}
