import type { ImageSourcePropType } from "react-native";

import type { RankId } from "../types/ranks";

export const EMBLEM_RANK_IMAGES: Record<RankId, ImageSourcePropType> = {
    ant: require("../assets/ranks/emblems/ant.png"),

    hare: require("../assets/ranks/emblems/hare.png"),

    fox: require("../assets/ranks/emblems/fox.png"),

    wolf: require("../assets/ranks/emblems/wolf.png"),

    panther: require("../assets/ranks/emblems/panther.png"),
};

export const ANIMAL_RANK_IMAGES: Record<RankId, ImageSourcePropType> = {
    ant: require("../assets/ranks/animals/ant.png"),

    hare: require("../assets/ranks/animals/hare.png"),

    fox: require("../assets/ranks/animals/fox.png"),

    wolf: require("../assets/ranks/animals/wolf.png"),

    panther: require("../assets/ranks/animals/panther.png"),
};
