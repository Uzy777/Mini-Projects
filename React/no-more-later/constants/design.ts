export const colours = {
    background: "#f6f7fb",
    surface: "#ffffff",

    text: "#171717",
    textMuted: "#737373",

    border: "#e5e7eb",

    primary: "#4f46e5",
    primaryPressed: "#4338ca",
    primarySoft: "#eef2ff",
    primaryBorder: "#c7d2fe",

    success: "#15803d",
    successSoft: "#dcfce7",

    warning: "#b45309",
    warningSoft: "#fffbeb",
    warningBorder: "#fde68a",

    danger: "#b91c1c",
    dangerSoft: "#fee2e2",
} as const;

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
} as const;

export const radius = {
    sm: 8,
    md: 12,
    lg: 18,
    pill: 999,
} as const;
