import type { AccentColourOption, ColourModeOption, BackdropOption } from "@/types/appearance";

export const COLOUR_MODE_OPTIONS: ColourModeOption[] = [
    {
        id: "system",
        name: "System",
        description: "Follow your device appearance",
        requiresPremium: true,
    },
    {
        id: "light",
        name: "Light",
        description: "Use a light appearance",
        requiresPremium: false,
    },
    {
        id: "dark",
        name: "Dark",
        description: "Use a dark appearance",
        requiresPremium: true,
    },
    {
        id: "amoled",
        name: "AMOLED",
        description: "Use a deep black appearance",
        requiresPremium: true,
    },
];

export const ACCENT_COLOUR_OPTIONS: AccentColourOption[] = [
    {
        id: "indigo",
        name: "Indigo",
        previewColour: "#4f46e5",
        requiresPremium: false,
    },
    {
        id: "blue",
        name: "Blue",
        previewColour: "#2563eb",
        requiresPremium: true,
    },
    {
        id: "emerald",
        name: "Emerald",
        previewColour: "#059669",
        requiresPremium: true,
    },
    {
        id: "amber",
        name: "Amber",
        previewColour: "#d97706",
        requiresPremium: true,
    },
    {
        id: "rose",
        name: "Rose",
        previewColour: "#e11d48",
        requiresPremium: true,
    },
    {
        id: "violet",
        name: "Violet",
        previewColour: "#7c3aed",
        requiresPremium: true,
    },
];

export const BACKDROP_OPTIONS: BackdropOption[] = [
    {
        id: "none",
        name: "None",
        description: "Keep the background clean and minimal.",
        requiresPremium: false,
    },
    {
        id: "wheat",
        name: "Wheat",
        description: "Soft atmospheric shapes.",
        requiresPremium: true,
    },
    {
        id: "hills",
        name: "Hills",
        description: "Gentle layered rolling hills.",
        requiresPremium: true,
    },
    {
        id: "forest",
        name: "Forest",
        description: "Subtle trees around the background.",
        requiresPremium: true,
    },
    {
        id: "ocean",
        name: "Ocean",
        description: "Calm flowing background shapes.",
        requiresPremium: true,
    },
    {
        id: "meadow",
        name: "Meadow",
        description: "Light grass and natural scenery.",
        requiresPremium: true,
    },
    {
        id: "mountains",
        name: "Mountains",
        description: "Faint distant mountain silhouettes.",
        requiresPremium: true,
    },
    {
        id: "desert",
        name: "Desert",
        description: "Minimal foliage around the edges.",
        requiresPremium: true,
    },
    {
        id: "sky",
        name: "Sky",
        description: "A subtle open-sky atmosphere.",
        requiresPremium: true,
    },
    {
        id: "jungle",
        name: "Jungle",
        description: "A subtle jungle atmosphere.",
        requiresPremium: true,
    },
];
