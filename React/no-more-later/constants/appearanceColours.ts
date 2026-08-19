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
    /** Lowest-emphasis tinted surface, suitable for large backgrounds. */
    primarySubtle: string;
    /** Existing low-emphasis tinted surface. */
    primarySoft: string;
    /** Mid-tone fill for decorative elements and stronger selected states. */
    primaryMuted: string;
    /** Accent-aware border and divider colour. */
    primaryBorder: string;
    /** Main interactive accent. */
    primary: string;
    /** Darker interaction state for pressed controls. */
    primaryPressed: string;
    /** Higher-emphasis accent for text and compact details. */
    primaryStrong: string;
    /** Accessible foreground content placed directly on the primary colour. */
    onPrimary: string;
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
        primarySubtle: "#f8faff",
        primarySoft: "#eef2ff",
        primaryMuted: "#a5b4fc",
        primaryBorder: "#c7d2fe",
        primary: "#4f46e5",
        primaryPressed: "#4338ca",
        primaryStrong: "#3730a3",
        onPrimary: "#ffffff",
    },

    blue: {
        primarySubtle: "#f8fbff",
        primarySoft: "#eff6ff",
        primaryMuted: "#93c5fd",
        primaryBorder: "#bfdbfe",
        primary: "#2563eb",
        primaryPressed: "#1d4ed8",
        primaryStrong: "#1e40af",
        onPrimary: "#ffffff",
    },

    emerald: {
        primarySubtle: "#f6fefb",
        primarySoft: "#ecfdf5",
        primaryMuted: "#6ee7b7",
        primaryBorder: "#a7f3d0",
        primary: "#059669",
        primaryPressed: "#047857",
        primaryStrong: "#065f46",
        onPrimary: "#001f17",
    },

    amber: {
        primarySubtle: "#fffdf5",
        primarySoft: "#fffbeb",
        primaryMuted: "#fcd34d",
        primaryBorder: "#fde68a",
        primary: "#d97706",
        primaryPressed: "#b45309",
        primaryStrong: "#92400e",
        onPrimary: "#1c1917",
    },

    rose: {
        primarySubtle: "#fff7f8",
        primarySoft: "#fff1f2",
        primaryMuted: "#fda4af",
        primaryBorder: "#fecdd3",
        primary: "#e11d48",
        primaryPressed: "#be123c",
        primaryStrong: "#9f1239",
        onPrimary: "#ffffff",
    },

    violet: {
        primarySubtle: "#fbfaff",
        primarySoft: "#f5f3ff",
        primaryMuted: "#c4b5fd",
        primaryBorder: "#ddd6fe",
        primary: "#7c3aed",
        primaryPressed: "#6d28d9",
        primaryStrong: "#5b21b6",
        onPrimary: "#ffffff",
    },
};

const DARK_ACCENTS: Record<AccentColourId, AccentColours> = {
    indigo: {
        primarySubtle: "#17182a",
        primarySoft: "#20213d",
        primaryMuted: "#4f527e",
        primaryBorder: "#373a68",
        primary: "#818cf8",
        primaryPressed: "#6366f1",
        primaryStrong: "#a5b4fc",
        onPrimary: "#111827",
    },

    blue: {
        primarySubtle: "#101a29",
        primarySoft: "#14243a",
        primaryMuted: "#315f91",
        primaryBorder: "#25466f",
        primary: "#60a5fa",
        primaryPressed: "#3b82f6",
        primaryStrong: "#93c5fd",
        onPrimary: "#0f172a",
    },

    emerald: {
        primarySubtle: "#0b1d18",
        primarySoft: "#102a22",
        primaryMuted: "#1c604a",
        primaryBorder: "#205c48",
        primary: "#34d399",
        primaryPressed: "#10b981",
        primaryStrong: "#6ee7b7",
        onPrimary: "#052e24",
    },

    amber: {
        primarySubtle: "#1d180c",
        primarySoft: "#2a2110",
        primaryMuted: "#6b4f14",
        primaryBorder: "#594414",
        primary: "#fbbf24",
        primaryPressed: "#f59e0b",
        primaryStrong: "#fcd34d",
        onPrimary: "#292000",
    },

    rose: {
        primarySubtle: "#211015",
        primarySoft: "#30171d",
        primaryMuted: "#713140",
        primaryBorder: "#63303b",
        primary: "#fb7185",
        primaryPressed: "#f43f5e",
        primaryStrong: "#fda4af",
        onPrimary: "#3f0712",
    },

    violet: {
        primarySubtle: "#1a1228",
        primarySoft: "#251b3d",
        primaryMuted: "#563d7d",
        primaryBorder: "#4b3772",
        primary: "#a78bfa",
        primaryPressed: "#8b5cf6",
        primaryStrong: "#c4b5fd",
        onPrimary: "#23133b",
    },
};

export const AUTH_COLOURS = getAppColours("light", "indigo");

export function getAppColours(mode: ResolvedColourMode, accent: AccentColourId): AppColours {
    const modeColours = MODE_COLOURS[mode];

    const accentColours = mode === "light" ? LIGHT_ACCENTS[accent] : DARK_ACCENTS[accent];

    return {
        ...modeColours,
        ...accentColours,
    };
}
