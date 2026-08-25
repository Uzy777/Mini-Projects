import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { ReactNode } from "react";

import { getOnboardingCompleted, setOnboardingCompleted } from "@/services/storage/onboardingStorage";

type OnboardingContextValue = {
    hasCompletedOnboarding: boolean;
    isOnboardingLoading: boolean;
    completeOnboarding: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    const [isOnboardingLoading, setIsOnboardingLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        getOnboardingCompleted()
            .then((isComplete) => {
                if (isMounted) {
                    setHasCompletedOnboarding(isComplete);
                }
            })
            .catch((error) => {
                console.error("Failed to load onboarding status:", error);
            })
            .finally(() => {
                if (isMounted) {
                    setIsOnboardingLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const completeOnboarding = useCallback(async () => {
        await setOnboardingCompleted();
        setHasCompletedOnboarding(true);
    }, []);

    const value = useMemo(
        () => ({ hasCompletedOnboarding, isOnboardingLoading, completeOnboarding }),
        [completeOnboarding, hasCompletedOnboarding, isOnboardingLoading],
    );

    return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);

    if (!context) {
        throw new Error("useOnboarding must be used within an OnboardingProvider.");
    }

    return context;
}
