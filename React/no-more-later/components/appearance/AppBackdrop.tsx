import { Image, StyleSheet, useWindowDimensions, View } from "react-native";

import { BACKDROP_IMAGES } from "@/constants/backdropImages";
import { useAppearance } from "@/contexts/AppearanceContext";

import type { BackdropId } from "@/types/appearance";

type AppBackdropProps = {
    backdropOverride?: BackdropId;
    preview?: boolean;
};

export function AppBackdrop({ backdropOverride, preview = false }: AppBackdropProps) {
    const { width, height } = useWindowDimensions();

    const { backdrop, colours, resolvedColourMode } = useAppearance();

    const activeBackdrop = backdropOverride ?? backdrop;

    if (activeBackdrop === "none") {
        return null;
    }

    const imageSet = BACKDROP_IMAGES[activeBackdrop];

    if (!imageSet) {
        return null;
    }

    const isLandscape = width > height;

    const imageSource = preview ? imageSet.landscape : isLandscape ? imageSet.landscape : imageSet.portrait;

    const imageOpacity = preview ? 0.8 : resolvedColourMode === "light" ? 0.3 : resolvedColourMode === "dark" ? 0.22 : 0.16;

    const accentOpacity = preview ? 0.16 : resolvedColourMode === "light" ? 0.1 : resolvedColourMode === "dark" ? 0.12 : 0.08;

    return (
        <View pointerEvents="none" style={styles.container}>
            <Image
                source={imageSource}
                resizeMode="cover"
                style={[
                    styles.image,
                    {
                        opacity: imageOpacity,
                    },
                ]}
            />

            <View
                style={[
                    styles.accentOverlay,
                    {
                        backgroundColor: colours.primary,
                        opacity: accentOpacity,
                    },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,

        overflow: "hidden",
    },

    image: {
        ...StyleSheet.absoluteFillObject,

        width: "100%",
        height: "100%",
    },

    accentOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
});
