import { createContext, useContext, useMemo, useState } from "react";

import type { ReactNode } from "react";

import { useColorScheme } from "@/hooks/use-color-scheme";

import type { AccentColourId, ColourMode, ResolvedColourMode } from "@/types/appearance";
import { getAppColours } from "@/constants/appearanceColours";
import type { AppColours } from "@/constants/appearanceColours";

type AppearanceContextValue = {
    colourMode: ColourMode;
    accentColour: AccentColourId;
    resolvedColourMode: ResolvedColourMode;
    colours: AppColours;

    setColourMode: (mode: ColourMode) => void;
    setAccentColour: (accent: AccentColourId) => void;
};

const AppearanceContext = createContext<AppearanceContextValue | undefined>(undefined);

type AppearanceProviderProps = {
    children: ReactNode;
};

export function AppearanceProvider({ children }: AppearanceProviderProps) {
    const deviceColourScheme = useColorScheme();

    const [colourMode, setColourMode] = useState<ColourMode>("light");
    const [accentColour, setAccentColour] = useState<AccentColourId>("indigo");

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
