export type ColourMode = "system" | "light" | "dark" | "amoled";

export type AccentColourId = "indigo" | "blue" | "emerald" | "amber" | "rose" | "violet";

export type ColourModeOption = {
    id: ColourMode;
    name: string;
    description: string;
    requiresPremium: boolean;
};

export type AccentColourOption = {
    id: AccentColourId;
    name: string;
    previewColour: string;
    requiresPremium: boolean;
};

export type ResolvedColourMode = "light" | "dark" | "amoled";

export type BackdropId = "none" | "wheat" | "hills" | "forest" | "ocean" | "meadow" | "mountains" | "desert" | "sky" | "jungle";

export type BackdropOption = {
    id: BackdropId;
    name: string;
    description: string;
    requiresPremium: boolean;
};

export type TimerStyleId = "orbit" | "minimal" | "segmented" | "soft" | "blocks" | "concentric";

export type TimerStyleOption = {
    id: TimerStyleId;
    name: string;
    description: string;
    requiresPremium: boolean;
};
