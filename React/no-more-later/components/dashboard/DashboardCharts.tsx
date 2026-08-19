import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";

import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

import type { AppColours } from "@/constants/appearanceColours";
import { radius, spacing } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";
import type { ProgressCategory } from "@/utils/dashboardStats";

type ChartProps = {
    values: number[];
    labels: string[];
    colour?: string;
    height?: number;
    valueFormatter?: (value: number) => string;
    emptyMessage?: string;
};

export function ProgressCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);

    return <View style={[styles.card, style]}>{children}</View>;
}

export function ProgressRing({ progress, size = 74, label }: { progress: number; size?: number; label?: string }) {
    const { colours } = useAppearance();
    const strokeWidth = Math.max(6, Math.round(size * 0.1));
    const radiusValue = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radiusValue;
    const safeProgress = Math.min(1, Math.max(0, progress));

    return (
        <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
            <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
                <Circle cx={size / 2} cy={size / 2} r={radiusValue} fill="none" stroke={colours.primarySoft} strokeWidth={strokeWidth} />
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radiusValue}
                    fill="none"
                    stroke={colours.primary}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={circumference * (1 - safeProgress)}
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>
            <Text style={{ color: colours.text, fontSize: size * 0.18, fontWeight: "800" }}>{label ?? `${Math.round(safeProgress * 100)}%`}</Text>
        </View>
    );
}

export function ProgressBarChart({ values, labels, colour, height = 150, valueFormatter = String, emptyMessage }: ChartProps) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const maxValue = Math.max(...values, 1);
    const hasData = values.some((value) => value > 0);

    if (!hasData) {
        return <ChartEmptyState height={height} message={emptyMessage} />;
    }

    return (
        <View style={[styles.barChart, { height }]}>
            {values.map((value, index) => (
                <View key={`${labels[index]}-${index}`} style={styles.barColumn}>
                    <Text numberOfLines={1} style={styles.chartValueLabel}>
                        {valueFormatter(value)}
                    </Text>
                    <View style={styles.barTrack}>
                        <View
                            style={[
                                styles.bar,
                                {
                                    height: `${(value / maxValue) * 100}%`,
                                    backgroundColor: colour ?? colours.primary,
                                },
                            ]}
                        />
                    </View>
                    <Text numberOfLines={1} style={styles.axisLabel}>
                        {labels[index]}
                    </Text>
                </View>
            ))}
        </View>
    );
}

export function ProgressLineChart({ values, labels, colour, height = 170, emptyMessage }: ChartProps) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const [width, setWidth] = useState(0);
    const chartHeight = height - 30;
    const maxValue = Math.max(...values, 1);
    const horizontalPadding = 8;
    const usableWidth = Math.max(0, width - horizontalPadding * 2);
    const points = values.map((value, index) => {
        const x = horizontalPadding + (values.length === 1 ? usableWidth / 2 : (index / (values.length - 1)) * usableWidth);
        const y = chartHeight - 10 - (value / maxValue) * (chartHeight - 22);
        return { x, y };
    });
    const hasData = values.some((value) => value > 0);

    if (!hasData) {
        return <ChartEmptyState height={height} message={emptyMessage} />;
    }

    return (
        <View style={[styles.lineChart, { height }]} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
            {width > 0 && (
                <Svg width={width} height={chartHeight}>
                    {[0.25, 0.5, 0.75].map((position) => (
                        <Line
                            key={position}
                            x1={0}
                            x2={width}
                            y1={chartHeight * position}
                            y2={chartHeight * position}
                            stroke={colours.border}
                            strokeWidth={1}
                        />
                    ))}
                    <Polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" stroke={colour ?? colours.primary} strokeWidth={3} />
                    {points.map((point, index) => (
                        <Circle key={`${point.x}-${index}`} cx={point.x} cy={point.y} r={4} fill={colour ?? colours.primary} />
                    ))}
                </Svg>
            )}
            <View style={styles.lineLabels}>
                {labels.map((label, index) => (
                    <Text key={`${label}-${index}`} style={styles.axisLabel}>
                        {label}
                    </Text>
                ))}
            </View>
        </View>
    );
}

export function ProgressDonut({ categories, totalLabel }: { categories: ProgressCategory[]; totalLabel: string }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const size = 126;
    const strokeWidth = 22;
    const radiusValue = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radiusValue;
    const segmentOpacities = [1, 0.78, 0.56, 0.36, 0.22];
    let offset = 0;

    return (
        <View style={styles.donutLayout}>
            <View style={{ width: size, height: size }}>
                <Svg width={size} height={size}>
                    <Circle cx={size / 2} cy={size / 2} r={radiusValue} fill="none" stroke={colours.border} strokeWidth={strokeWidth} />
                    {categories.map((category, index) => {
                        const segmentLength = circumference * (category.percentage / 100);
                        const dashOffset = -offset;
                        offset += segmentLength;

                        return (
                            <Circle
                                key={category.id}
                                cx={size / 2}
                                cy={size / 2}
                                r={radiusValue}
                                fill="none"
                                stroke={colours.primary}
                                opacity={segmentOpacities[index % segmentOpacities.length]}
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${segmentLength} ${Math.max(0, circumference - segmentLength)}`}
                                strokeDashoffset={dashOffset}
                                rotation="-90"
                                origin={`${size / 2}, ${size / 2}`}
                            />
                        );
                    })}
                </Svg>
                <View pointerEvents="none" style={styles.donutCentre}>
                    <Text style={styles.donutValue}>{totalLabel}</Text>
                    <Text style={styles.donutLabel}>focused</Text>
                </View>
            </View>

            <View style={styles.legend}>
                {categories.map((category, index) => (
                    <View key={category.id} style={styles.legendRow}>
                        <View
                            style={[
                                styles.legendDot,
                                {
                                    backgroundColor: colours.primary,
                                    opacity: segmentOpacities[index % segmentOpacities.length],
                                },
                            ]}
                        />
                        <Text numberOfLines={1} style={styles.legendLabel}>
                            {category.label}
                        </Text>
                        <Text style={styles.legendValue}>{category.percentage}%</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

function ChartEmptyState({ height, message = "No focus activity in this period." }: { height: number; message?: string }) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);

    return (
        <View style={[styles.chartEmptyState, { height }]}>
            <View style={styles.emptyMarker} />
            <Text style={styles.chartEmptyText}>{message}</Text>
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        card: {
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colours.border,
            borderRadius: radius.lg,
            backgroundColor: colours.surface,
        },
        barChart: {
            flexDirection: "row",
            alignItems: "stretch",
            gap: spacing.sm,
            paddingTop: spacing.sm,
        },
        barColumn: {
            flex: 1,
            minWidth: 16,
            alignItems: "center",
        },
        chartValueLabel: {
            minHeight: 15,
            marginBottom: 5,
            fontSize: 9,
            fontWeight: "700",
            color: colours.textMuted,
            textAlign: "center",
        },
        barTrack: {
            flex: 1,
            width: "62%",
            minWidth: 7,
            maxWidth: 34,
            justifyContent: "flex-end",
            borderRadius: radius.sm,
            backgroundColor: colours.primarySoft,
            overflow: "hidden",
        },
        bar: {
            width: "100%",
            minHeight: 4,
            borderRadius: radius.sm,
        },
        axisLabel: {
            marginTop: spacing.sm,
            fontSize: 10,
            color: colours.textMuted,
            textAlign: "center",
        },
        lineChart: {
            width: "100%",
        },
        lineLabels: {
            position: "absolute",
            right: 0,
            bottom: 0,
            left: 0,
            flexDirection: "row",
            justifyContent: "space-between",
        },
        donutLayout: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.sm,
        },
        donutCentre: {
            ...StyleSheet.absoluteFillObject,
            alignItems: "center",
            justifyContent: "center",
        },
        donutValue: {
            fontSize: 13,
            fontWeight: "800",
            color: colours.text,
        },
        donutLabel: {
            marginTop: 1,
            fontSize: 8,
            color: colours.textMuted,
        },
        legend: {
            flex: 1,
            gap: spacing.sm,
        },
        legendRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
        },
        legendDot: {
            width: 8,
            height: 8,
            borderRadius: radius.pill,
        },
        legendLabel: {
            flex: 1,
            fontSize: 11,
            color: colours.textMuted,
        },
        legendValue: {
            fontSize: 11,
            fontWeight: "700",
            color: colours.text,
        },
        chartEmptyState: {
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
        },
        emptyMarker: {
            width: 34,
            height: 4,
            borderRadius: radius.pill,
            backgroundColor: colours.primaryBorder,
        },
        chartEmptyText: {
            fontSize: 11,
            color: colours.textMuted,
            textAlign: "center",
        },
    });
}
