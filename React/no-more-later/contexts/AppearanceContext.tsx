import { createContext, useContext, useMemo, useState, useEffect } from "react";

import type { ReactNode } from "react";

import { useColorScheme } from "@/hooks/use-color-scheme";

import type { AccentColourId, ColourMode, ResolvedColourMode, BackdropId, TimerStyleId } from "@/types/appearance";
import { getAppColours } from "@/constants/appearanceColours";
import type { AppColours } from "@/constants/appearanceColours";
import { loadAppearancePreferences, saveAppearancePreferences } from "@/services/storage/appearanceStorage";
import { usePremium } from "@/contexts/PremiumContext";

import { ACCENT_COLOUR_OPTIONS, COLOUR_MODE_OPTIONS, BACKDROP_OPTIONS, TIMER_STYLE_OPTIONS } from "@/constants/appearance";

type AppearanceContextValue = {
    colourMode: ColourMode;
    accentColour: AccentColourId;
    backdrop: BackdropId;
    timerStyle: TimerStyleId;
    resolvedColourMode: ResolvedColourMode;
    colours: AppColours;
    isAppearanceLoading: boolean;

    setColourMode: (mode: ColourMode) => void;
    setAccentColour: (accent: AccentColourId) => void;
    setBackdrop: (backdrop: BackdropId) => void;
    setTimerStyle: (timerStyle: TimerStyleId) => void;
};

const AppearanceContext = createContext<AppearanceContextValue | undefined>(undefined);

type AppearanceProviderProps = {
    children: ReactNode;
};

function canUseColourMode(mode: ColourMode, hasPremium: boolean) {
    const option = COLOUR_MODE_OPTIONS.find((option) => option.id === mode);

    if (!option) {
        return false;
    }

    return !option.requiresPremium || hasPremium;
}

function canUseAccentColour(accent: AccentColourId, hasPremium: boolean) {
    const option = ACCENT_COLOUR_OPTIONS.find((option) => option.id === accent);

    if (!option) {
        return false;
    }

    return !option.requiresPremium || hasPremium;
}

function canUseBackdrop(backdrop: BackdropId, hasPremium: boolean) {
    const option = BACKDROP_OPTIONS.find((option) => option.id === backdrop);

    if (!option) {
        return false;
    }

    return !option.requiresPremium || hasPremium;
}

function canUseTimerStyle(timerStyle: TimerStyleId, hasPremium: boolean) {
    const option = TIMER_STYLE_OPTIONS.find((option) => option.id === timerStyle);

    return Boolean(option && (!option.requiresPremium || hasPremium));
}

export function AppearanceProvider({ children }: AppearanceProviderProps) {
    const deviceColourScheme = useColorScheme();
    const { hasPremium, isPremiumLoading } = usePremium();

    const [colourMode, setColourMode] = useState<ColourMode>("light");
    const [accentColour, setAccentColour] = useState<AccentColourId>("indigo");
    const [hasLoadedPreferences, setHasLoadedPreferences] = useState(false);
    const [backdrop, setBackdrop] = useState<BackdropId>("hills");
    const [timerStyle, setTimerStyle] = useState<TimerStyleId>("orbit");

    useEffect(() => {
        if (isPremiumLoading || hasLoadedPreferences) {
            return;
        }

        let isMounted = true;

        async function loadPreferences() {
            const preferences = await loadAppearancePreferences();

            if (!isMounted) {
                return;
            }
            if (preferences) {
                const allowedColourMode = canUseColourMode(preferences.colourMode, hasPremium);

                const allowedAccentColour = canUseAccentColour(preferences.accentColour, hasPremium);

                const allowedBackdrop = canUseBackdrop(preferences.backdrop, hasPremium);
                const allowedTimerStyle = canUseTimerStyle(preferences.timerStyle, hasPremium);

                setColourMode(allowedColourMode ? preferences.colourMode : "light");
                setAccentColour(allowedAccentColour ? preferences.accentColour : "indigo");
                setBackdrop(allowedBackdrop ? preferences.backdrop : "none");
                setTimerStyle(allowedTimerStyle ? preferences.timerStyle : "orbit");
            }

            setHasLoadedPreferences(true);
        }

        loadPreferences();

        return () => {
            isMounted = false;
        };
    }, [isPremiumLoading, hasLoadedPreferences, hasPremium]);

    useEffect(() => {
        if (!hasLoadedPreferences) {
            return;
        }

        saveAppearancePreferences({
            colourMode,
            accentColour,
            backdrop,
            timerStyle,
        }).catch((error) => {
            console.error("Failed to save appearance preferences:", error);
        });
    }, [colourMode, accentColour, backdrop, timerStyle, hasLoadedPreferences]);

    useEffect(() => {
        if (!hasLoadedPreferences || hasPremium) {
            return;
        }

        if (!canUseColourMode(colourMode, hasPremium)) {
            setColourMode("light");
        }

        if (!canUseAccentColour(accentColour, hasPremium)) {
            setAccentColour("indigo");
        }

        if (!canUseBackdrop(backdrop, hasPremium)) {
            setBackdrop("none");
        }

        if (!canUseTimerStyle(timerStyle, hasPremium)) {
            setTimerStyle("orbit");
        }
    }, [hasPremium, hasLoadedPreferences, colourMode, accentColour, backdrop, timerStyle]);

    const resolvedColourMode = useMemo<ResolvedColourMode>(() => {
        if (colourMode === "system") {
            return deviceColourScheme === "dark" ? "dark" : "light";
        }

        return colourMode;
    }, [colourMode, deviceColourScheme]);

    const colours = useMemo(() => {
        return getAppColours(resolvedColourMode, accentColour);
    }, [resolvedColourMode, accentColour]);

    return (
        <AppearanceContext.Provider
            value={{
                colourMode,
                accentColour,
                backdrop,
                timerStyle,
                resolvedColourMode,
                colours,
                isAppearanceLoading: isPremiumLoading || !hasLoadedPreferences,
                setColourMode,
                setAccentColour,
                setBackdrop,
                setTimerStyle,
            }}
        >
            {children}
        </AppearanceContext.Provider>
    );
}

export function useAppearance() {
    const context = useContext(AppearanceContext);

    if (!context) {
        throw new Error("useAppearance must be used inside AppearanceProvider");
    }

    return context;
}
