export type RankId =
    | "ant"
    | "mouse"
    | "rabbit"
    | "squirrel"
    | "fox"
    | "raccoon"
    | "badger"
    | "wolf"
    | "cheetah"
    | "lynx"
    | "snow-leopard"
    | "puma"
    | "boar"
    | "black-bear"
    | "polar-bear"
    | "eagle"
    | "hawk-falcon"
    | "owl"
    | "lion"
    | "tiger"
    | "white-wolf"
    | "black-panther"
    | "dragon"
    | "phoenix"
    | "griffin";

export type RankDefinition = {
    id: RankId;
    name: string;
    minimumLevel: number;
    maximumLevel: number | null;
};

export type RankVisualStyle = "emblem" | "animal";

export type RankProgress = {
    currentLevel: number;
    minimumLevel: number;
    maximumLevel: number | null;
    progressPercentage: number;
};
