import { createContext, useContext, useMemo, useState, useEffect } from "react";

import type { ReactNode } from "react";

import { useColorScheme } from "@/hooks/use-color-scheme";

import type { AccentColourId, ColourMode, ResolvedColourMode } from "@/types/appearance";
import { getAppColours } from "@/constants/appearanceColours";
import type { AppColours } from "@/constants/appearanceColours";
import { loadAppearancePreferences, saveAppearancePreferences } from "@/services/storage/appearanceStorage";
import { usePremium } from "@/contexts/PremiumContext";

import { ACCENT_COLOUR_OPTIONS, COLOUR_MODE_OPTIONS } from "@/constants/appearance";

type AppearanceContextValue = {
    colourMode: ColourMode;
    accentColour: AccentColourId;
    resolvedColourMode: ResolvedColourMode;
    colours: AppColours;
    isAppearanceLoading: boolean;

    setColourMode: (mode: ColourMode) => void;
    setAccentColour: (accent: AccentColourId) => void;
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

export function AppearanceProvider({ children }: AppearanceProviderProps) {
    const deviceColourScheme = useColorScheme();
    const { hasPremium } = usePremium();

    const [colourMode, setColourMode] = useState<ColourMode>("light");
    const [accentColour, setAccentColour] = useState<AccentColourId>("indigo");
    const [hasLoadedPreferences, setHasLoadedPreferences] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function loadPreferences() {
            const preferences = await loadAppearancePreferences();

            if (!isMounted) {
                return;
            }
            if (preferences) {
                const allowedColourMode = canUseColourMode(preferences.colourMode, hasPremium);

                const allowedAccentColour = canUseAccentColour(preferences.accentColour, hasPremium);

                setColourMode(allowedColourMode ? preferences.colourMode : "light");

                setAccentColour(allowedAccentColour ? preferences.accentColour : "indigo");
            }

            setHasLoadedPreferences(true);
        }

        loadPreferences();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!hasLoadedPreferences) {
            return;
        }

        saveAppearancePreferences({
            colourMode,
            accentColour,
        }).catch((error) => {
            console.error("Failed to save appearance preferences:", error);
        });
    }, [colourMode, accentColour, hasLoadedPreferences]);

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
    }, [hasPremium, hasLoadedPreferences, colourMode, accentColour]);

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
                resolvedColourMode,
                colours,
                isAppearanceLoading: !hasLoadedPreferences,
                setColourMode,
                setAccentColour,
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
