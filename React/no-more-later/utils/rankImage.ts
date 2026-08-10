import type { ImageSourcePropType } from "react-native";

import { ANIMAL_RANK_IMAGES, EMBLEM_RANK_IMAGES } from "../constants/rankImages";

import type { RankId, RankVisualStyle } from "../types/ranks";

export function getRankImage(rankId: RankId, visualStyle: RankVisualStyle): ImageSourcePropType {
    if (visualStyle === "animal") {
        return ANIMAL_RANK_IMAGES[rankId];
    }

    return EMBLEM_RANK_IMAGES[rankId];
}
