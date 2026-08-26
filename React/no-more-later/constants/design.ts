export const spacing = {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    xxxl: 56,
} as const;

export const radius = {
    sm: 8,
    md: 12,
    lg: 18,
    xl: 24,
    pill: 999,
} as const;

export const layout = {
    contentMaxWidth: 1180,
    readingMaxWidth: 720,
    mobileBreakpoint: 700,
    desktopBreakpoint: 960,
} as const;

export function getScreenGutter(width: number) {
    return width < 480 ? spacing.md : spacing.lg;
}
