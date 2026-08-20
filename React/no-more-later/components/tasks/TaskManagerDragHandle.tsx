import { useMemo, useRef, useState } from "react";
import { PanResponder, Platform, StyleSheet, View } from "react-native";
import { GripVertical } from "lucide-react-native";

import type { AppColours } from "@/constants/appearanceColours";
import { radius } from "@/constants/design";
import { useAppearance } from "@/contexts/AppearanceContext";

type Props = {
    label: string;
    disabled?: boolean;
    canMoveUp: boolean;
    canMoveDown: boolean;
    onDragStart: () => void;
    onDragMove: (distanceY: number) => void;
    onDragEnd: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
};

export function TaskManagerDragHandle({ label, disabled = false, canMoveUp, canMoveDown, onDragStart, onDragMove, onDragEnd, onMoveUp, onMoveDown }: Props) {
    const { colours } = useAppearance();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const [isDragging, setIsDragging] = useState(false);
    const callbacks = useRef({ disabled, onDragStart, onDragMove, onDragEnd });
    callbacks.current = { disabled, onDragStart, onDragMove, onDragEnd };

    const panResponder = useMemo(
        () => PanResponder.create({
            onStartShouldSetPanResponder: () => !callbacks.current.disabled,
            onMoveShouldSetPanResponder: (_, gesture) => !callbacks.current.disabled && Math.abs(gesture.dy) > 2,
            onPanResponderGrant: () => {
                setIsDragging(true);
                callbacks.current.onDragStart();
            },
            onPanResponderMove: (_, gesture) => callbacks.current.onDragMove(gesture.dy),
            onPanResponderRelease: () => {
                setIsDragging(false);
                callbacks.current.onDragEnd();
            },
            onPanResponderTerminate: () => {
                setIsDragging(false);
                callbacks.current.onDragEnd();
            },
            onPanResponderTerminationRequest: () => false,
        }),
        [],
    );

    const accessibilityActions = [
        ...(canMoveUp ? [{ name: "decrement" as const, label: "Move up" }] : []),
        ...(canMoveDown ? [{ name: "increment" as const, label: "Move down" }] : []),
    ];

    return (
        <View
            {...panResponder.panHandlers}
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel={`Reorder ${label}`}
            accessibilityHint="Drag up or down to change its position"
            accessibilityActions={accessibilityActions}
            onAccessibilityAction={(event) => {
                if (event.nativeEvent.actionName === "decrement" && canMoveUp) onMoveUp();
                if (event.nativeEvent.actionName === "increment" && canMoveDown) onMoveDown();
            }}
            style={[styles.handle, isDragging && styles.dragging, disabled && styles.disabled]}
        >
            <GripVertical size={18} color={isDragging ? colours.primaryStrong : colours.textMuted} />
        </View>
    );
}

function createStyles(colours: AppColours) {
    return StyleSheet.create({
        handle: {
            width: 32,
            minHeight: 40,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.sm,
            ...(Platform.OS === "web" ? { cursor: "pointer" as const } : {}),
        },
        dragging: {
            backgroundColor: colours.primarySoft,
        },
        disabled: {
            opacity: 0.35,
        },
    });
}
