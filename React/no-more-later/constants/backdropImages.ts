import type { ImageSourcePropType } from "react-native";

import type { BackdropId } from "@/types/appearance";

type ImageBackdropId = Exclude<BackdropId, "none">;

export const BACKDROP_IMAGES: Record<ImageBackdropId, ImageSourcePropType> = {
    mist: require("../assets/backdrops/01-mist.png"),
    hills: require("../assets/backdrops/02-hills.png"),
    forest: require("../assets/backdrops/03-forest2.png"),
    waves: require("../assets/backdrops/04-waves.png"),
    meadow: require("../assets/backdrops/05-meadow.png"),
    mountains: require("../assets/backdrops/06-mountains.png"),
    leaves: require("../assets/backdrops/07-leaves.png"),
    sky: require("../assets/backdrops/08-sky.png"),
    // "lake-valley": require("../assets/backdrops/09-lake-valley.png"),
};
