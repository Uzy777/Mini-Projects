import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import type { AppColours } from "@/constants/appearanceColours";
import { useAppearance } from "@/contexts/AppearanceContext";

export function AppBackdrop() {
    const { backdrop, colours, resolvedColourMode } = useAppearance();

    const styles = useMemo(() => createStyles(colours, resolvedColourMode), [colours, resolvedColourMode]);

    if (backdrop === "none") {
        return null;
    }

    if (backdrop === "hills") {
        return (
            <View pointerEvents="none" style={styles.container}>
                <View style={styles.hillBack} />
                <View style={styles.hillMiddle} />
                <View style={styles.hillFront} />
            </View>
        );
    }

    return null;
}

type ResolvedMode = "light" | "dark" | "amoled";

function createStyles(colours: AppColours, resolvedColourMode: ResolvedMode) {
    const isLight = resolvedColourMode === "light";

    const isAmoled = resolvedColourMode === "amoled";

    return StyleSheet.create({
        container: {
            ...StyleSheet.absoluteFillObject,

            overflow: "hidden",
        },

        hillBack: {
            position: "absolute",

            top: 115,
            left: "-20%",

            width: "115%",
            height: 230,

            borderRadius: 999,

            backgroundColor: colours.primarySoft,

            opacity: isLight ? 0.75 : isAmoled ? 0.18 : 0.3,

            transform: [
                {
                    rotate: "-7deg",
                },
            ],
        },

        hillMiddle: {
            position: "absolute",

            top: 170,
            right: "-28%",

            width: "120%",
            height: 210,

            borderRadius: 999,

            backgroundColor: colours.primary,

            opacity: isLight ? 0.06 : isAmoled ? 0.035 : 0.05,

            transform: [
                {
                    rotate: "8deg",
                },
            ],
        },

        hillFront: {
            position: "absolute",

            top: 225,
            left: "-15%",

            width: "120%",
            height: 200,

            borderRadius: 999,

            backgroundColor: colours.primary,

            opacity: isLight ? 0.035 : isAmoled ? 0.025 : 0.04,

            transform: [
                {
                    rotate: "-4deg",
                },
            ],
        },
    });
}
