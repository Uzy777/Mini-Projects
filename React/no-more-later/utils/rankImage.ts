import type { ImageSourcePropType } from "react-native";

import { ANIMAL_RANK_IMAGES } from "../constants/rankImages";

import type { RankId } from "../types/ranks";

export function getRankImage(rankId: RankId): ImageSourcePropType {
    return ANIMAL_RANK_IMAGES[rankId];
}
