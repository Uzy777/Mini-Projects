import { createContext, useContext } from "react";

import type { ReactNode } from "react";

type PremiumContextValue = {
    hasPremium: boolean;
};

const PremiumContext = createContext<PremiumContextValue | undefined>(undefined);

type PremiumProviderProps = {
    children: ReactNode;
};

export function PremiumProvider({ children }: PremiumProviderProps) {
    // Development value for now.
    // RevenueCat will replace this later.
    const hasPremium = false;

    return (
        <PremiumContext.Provider
            value={{
                hasPremium,
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
