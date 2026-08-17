import type { ImageSourcePropType } from "react-native";

import type { BackdropId } from "@/types/appearance";

type ImageBackdropId = Exclude<BackdropId, "none">;

export type BackdropImageSet = {
    portrait: ImageSourcePropType;
    landscape: ImageSourcePropType;
};

export const BACKDROP_IMAGES: Partial<Record<ImageBackdropId, BackdropImageSet>> = {
    wheat: {
        portrait: require("../assets/backdrops/wheat/wheat_portrait_1080x1920.png"),
        landscape: require("../assets/backdrops/wheat/wheat_landscape_1920x1080.png"),
    },

    hills: {
        portrait: require("../assets/backdrops/hills/hills_portrait_1080x1920.png"),
        landscape: require("../assets/backdrops/hills/hills_landscape_1920x1080.png"),
    },

    forest: {
        portrait: require("../assets/backdrops/forest/forest_portrait_1080x1920.png"),
        landscape: require("../assets/backdrops/forest/forest_landscape_1920x1080.png"),
    },

    ocean: {
        portrait: require("../assets/backdrops/ocean/ocean_portrait_1080x1920.png"),
        landscape: require("../assets/backdrops/ocean/ocean_landscape_1920x1080.png"),
    },

    meadow: {
        portrait: require("../assets/backdrops/meadow/meadow_portrait_1080x1920.png"),
        landscape: require("../assets/backdrops/meadow/meadow_landscape_1920x1080.png"),
    },

    mountains: {
        portrait: require("../assets/backdrops/mountains/mountains_portrait_1080x1920.png"),
        landscape: require("../assets/backdrops/mountains/mountains_landscape_1920x1080.png"),
    },

    desert: {
        portrait: require("../assets/backdrops/desert/desert_portrait_1080x1920.png"),
        landscape: require("../assets/backdrops/desert/desert_landscape_1920x1080.png"),
    },

    sky: {
        portrait: require("../assets/backdrops/sky/sky_portrait_1080x1920.png"),
        landscape: require("../assets/backdrops/sky/sky_landscape_1920x1080.png"),
    },

    jungle: {
        portrait: require("../assets/backdrops/jungle/jungle_portrait_1080x1920.png"),
        landscape: require("../assets/backdrops/jungle/jungle_landscape_1920x1080.png"),
    },
};
