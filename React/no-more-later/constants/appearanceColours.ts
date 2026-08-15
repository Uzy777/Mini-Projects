import type { AccentColourId, ResolvedColourMode } from "@/types/appearance";

type ModeColours = {
    background: string;
    surface: string;

    text: string;
    textMuted: string;

    border: string;

    success: string;
    successSoft: string;

    warning: string;
    warningSoft: string;
    warningBorder: string;

    danger: string;
    dangerSoft: string;

    leaderboardGold: string;
    leaderboardGoldSoft: string;

    leaderboardSilver: string;
    leaderboardSilverSoft: string;

    leaderboardBronze: string;
    leaderboardBronzeSoft: string;
};

type AccentColours = {
    primary: string;
    primaryPressed: string;
    primarySoft: string;
    primaryBorder: string;
};

export type AppColours = ModeColours & AccentColours;

const MODE_COLOURS: Record<ResolvedColourMode, ModeColours> = {
    light: {
        background: "#f6f7fb",
        surface: "#ffffff",

        text: "#171717",
        textMuted: "#737373",

        border: "#e5e7eb",

        success: "#15803d",
        successSoft: "#dcfce7",

        warning: "#b45309",
        warningSoft: "#fffbeb",
        warningBorder: "#fde68a",

        danger: "#b91c1c",
        dangerSoft: "#fee2e2",

        leaderboardGold: "#a16207",
        leaderboardGoldSoft: "#fef3c7",

        leaderboardSilver: "#64748b",
        leaderboardSilverSoft: "#f1f5f9",

        leaderboardBronze: "#9a5b2f",
        leaderboardBronzeSoft: "#ffedd5",
    },

    dark: {
        background: "#111318",
        surface: "#1a1d23",

        text: "#f5f5f5",
        textMuted: "#a3a3a3",

        border: "#30343b",

        success: "#4ade80",
        successSoft: "#14261a",

        warning: "#fbbf24",
        warningSoft: "#2a2110",
        warningBorder: "#594414",

        danger: "#f87171",
        dangerSoft: "#2b1618",

        leaderboardGold: "#fbbf24",
        leaderboardGoldSoft: "#2a2110",

        leaderboardSilver: "#cbd5e1",
        leaderboardSilverSoft: "#22262d",

        leaderboardBronze: "#fb923c",
        leaderboardBronzeSoft: "#2c1d14",
    },

    amoled: {
        background: "#000000",
        surface: "#0a0a0a",

        text: "#f5f5f5",
        textMuted: "#a3a3a3",

        border: "#242424",

        success: "#4ade80",
        successSoft: "#0b1d10",

        warning: "#fbbf24",
        warningSoft: "#1d1708",
        warningBorder: "#4a390d",

        danger: "#f87171",
        dangerSoft: "#210d0f",

        leaderboardGold: "#fbbf24",
        leaderboardGoldSoft: "#1d1708",

        leaderboardSilver: "#cbd5e1",
        leaderboardSilverSoft: "#151515",

        leaderboardBronze: "#fb923c",
        leaderboardBronzeSoft: "#21130c",
    },
};

const LIGHT_ACCENTS: Record<AccentColourId, AccentColours> = {
    indigo: {
        primary: "#4f46e5",
        primaryPressed: "#4338ca",
        primarySoft: "#eef2ff",
        primaryBorder: "#c7d2fe",
    },

    blue: {
        primary: "#2563eb",
        primaryPressed: "#1d4ed8",
        primarySoft: "#eff6ff",
        primaryBorder: "#bfdbfe",
    },

    emerald: {
        primary: "#059669",
        primaryPressed: "#047857",
        primarySoft: "#ecfdf5",
        primaryBorder: "#a7f3d0",
    },

    amber: {
        primary: "#d97706",
        primaryPressed: "#b45309",
        primarySoft: "#fffbeb",
        primaryBorder: "#fde68a",
    },

    rose: {
        primary: "#e11d48",
        primaryPressed: "#be123c",
        primarySoft: "#fff1f2",
        primaryBorder: "#fecdd3",
    },

    violet: {
        primary: "#7c3aed",
        primaryPressed: "#6d28d9",
        primarySoft: "#f5f3ff",
        primaryBorder: "#ddd6fe",
    },
};

const DARK_ACCENTS: Record<AccentColourId, AccentColours> = {
    indigo: {
        primary: "#818cf8",
        primaryPressed: "#6366f1",
        primarySoft: "#20213d",
        primaryBorder: "#373a68",
    },

    blue: {
        primary: "#60a5fa",
        primaryPressed: "#3b82f6",
        primarySoft: "#14243a",
        primaryBorder: "#25466f",
    },

    emerald: {
        primary: "#34d399",
        primaryPressed: "#10b981",
        primarySoft: "#102a22",
        primaryBorder: "#205c48",
    },

    amber: {
        primary: "#fbbf24",
        primaryPressed: "#f59e0b",
        primarySoft: "#2a2110",
        primaryBorder: "#594414",
    },

    rose: {
        primary: "#fb7185",
        primaryPressed: "#f43f5e",
        primarySoft: "#30171d",
        primaryBorder: "#63303b",
    },

    violet: {
        primary: "#a78bfa",
        primaryPressed: "#8b5cf6",
        primarySoft: "#251b3d",
        primaryBorder: "#4b3772",
    },
};

export function getAppColours(mode: ResolvedColourMode, accent: AccentColourId): AppColours {
    const modeColours = MODE_COLOURS[mode];

    const accentColours = mode === "light" ? LIGHT_ACCENTS[accent] : DARK_ACCENTS[accent];

    return {
        ...modeColours,
        ...accentColours,
    };
}
