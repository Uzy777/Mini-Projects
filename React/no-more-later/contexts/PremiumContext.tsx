import { createContext, useContext, useEffect, useState } from "react";

import type { ReactNode } from "react";

import { PREMIUM_TEST_CONTROLS_ENABLED } from "@/constants/premium";
import { useAuth } from "@/contexts/AuthContext";
import { loadPremiumTestOverride, savePremiumTestOverride } from "@/services/storage/premiumTestOverrideStorage";

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
    const { session, isLoading: isAuthLoading } = useAuth();

    const [hasPremium, setHasPremium] = useState(false);
    const [isPremiumLoading, setIsPremiumLoading] = useState(PREMIUM_TEST_CONTROLS_ENABLED);

    const userId = session?.user.id;

    useEffect(() => {
        if (!PREMIUM_TEST_CONTROLS_ENABLED) {
            setHasPremium(false);
            setIsPremiumLoading(false);
            return;
        }

        if (isAuthLoading) {
            setIsPremiumLoading(true);
            return;
        }

        if (!userId) {
            setHasPremium(false);
            setIsPremiumLoading(false);
            return;
        }

        let isMounted = true;

        setHasPremium(false);
        setIsPremiumLoading(true);

        loadPremiumTestOverride(userId)
            .then((storedHasPremium) => {
                if (!isMounted) {
                    return;
                }

                setHasPremium(storedHasPremium);
                setIsPremiumLoading(false);
            })
            .catch((error) => {
                console.error("Failed to load the Premium test override:", error);

                if (!isMounted) {
                    return;
                }

                setHasPremium(false);
                setIsPremiumLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [isAuthLoading, userId]);

    function setDevelopmentPremium(value: boolean) {
        if (!PREMIUM_TEST_CONTROLS_ENABLED || !userId) {
            return;
        }

        setHasPremium(value);

        savePremiumTestOverride(userId, value).catch((error) => {
            console.error("Failed to save the Premium test override:", error);
        });
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
