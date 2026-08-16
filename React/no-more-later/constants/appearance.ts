import type { AccentColourOption, ColourModeOption } from "@/types/appearance";

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
