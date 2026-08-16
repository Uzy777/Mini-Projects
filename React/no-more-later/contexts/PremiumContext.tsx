import { createContext, useContext, useState } from "react";

import type { ReactNode } from "react";

type PremiumContextValue = {
    hasPremium: boolean;
    setDevelopmentPremium: (hasPremium: boolean) => void;
};

const PremiumContext = createContext<PremiumContextValue | undefined>(undefined);

type PremiumProviderProps = {
    children: ReactNode;
};

export function PremiumProvider({ children }: PremiumProviderProps) {
    const [hasPremium, setHasPremium] = useState(false);

    function setDevelopmentPremium(value: boolean) {
        if (!__DEV__) {
            return;
        }

        setHasPremium(value);
    }

    return (
        <PremiumContext.Provider
            value={{
                hasPremium,
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
