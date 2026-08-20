import { createContext, useContext, useState } from "react";

import type { ReactNode } from "react";

import { PREMIUM_TEST_CONTROLS_ENABLED } from "@/constants/premium";

type PremiumContextValue = {
    hasPremium: boolean;
    isPremiumLoading: boolean;
    setDevelopmentPremium: (hasPremium: boolean) => void;
};

const PremiumContext = createContext<PremiumContextValue | undefined>(undefined);

type PremiumProviderProps = {
    children: ReactNode;
};

export function PremiumProvider({ children }: PremiumProviderProps) {
    const [hasPremium, setHasPremium] = useState(false);
    const isPremiumLoading = false;

    function setDevelopmentPremium(value: boolean) {
        if (!PREMIUM_TEST_CONTROLS_ENABLED) {
            return;
        }

        setHasPremium(value);
    }

    return (
        <PremiumContext.Provider
            value={{
                hasPremium,
                isPremiumLoading,
                setDevelopmentPremium,
            }}
        >
            {children}
        </PremiumContext.Provider>
    );
}

export function usePremium() {
    const context = useContext(PremiumContext);

    if (!context) {
        throw new Error("usePremium must be used inside PremiumProvider");
    }

    return context;
}
