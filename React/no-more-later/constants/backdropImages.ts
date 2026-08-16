import type { ImageSourcePropType } from "react-native";

import type { BackdropId } from "@/types/appearance";

type ImageBackdropId = Exclude<BackdropId, "none">;

export type BackdropImageSet = {
    portrait: ImageSourcePropType;
    landscape: ImageSourcePropType;
};

export const BACKDROP_IMAGES: Partial<Record<ImageBackdropId, BackdropImageSet>> = {
    forest: {
        portrait: require("../assets/backdrops/forest/forest_portrait_1080x1920.png"),
        landscape: require("../assets/backdrops/forest/forest_landscape_1920x1080.png"),
    },
};
