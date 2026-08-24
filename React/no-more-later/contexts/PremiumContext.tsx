import { createContext, useContext, useEffect, useState } from "react";

import type { ReactNode } from "react";
import type { PurchasesPackage } from "react-native-purchases";

import { PREMIUM_TEST_CONTROLS_ENABLED } from "@/constants/premium";
import { REVENUECAT_TEST_STORE_ENABLED } from "@/constants/revenueCat";
import { useAuth } from "@/contexts/AuthContext";
import {
    configureRevenueCatForUser,
    hasRevenueCatPremium,
    purchaseRevenueCatLifetime,
    restoreRevenueCatPurchases,
    subscribeToRevenueCatCustomerInfo,
} from "@/services/purchases/revenueCatService";
import { loadPremiumTestOverride, savePremiumTestOverride } from "@/services/storage/premiumTestOverrideStorage";

export type PremiumActionResult = {
    success: boolean;
    cancelled: boolean;
    errorMessage: string | null;
};

type PremiumContextValue = {
    hasPremium: boolean;
    hasDevelopmentPremiumOverride: boolean;
    isPremiumLoading: boolean;
    isRevenueCatConfigured: boolean;
    revenueCatUnavailableReason: string | null;
    isLifetimePurchaseAvailable: boolean;
    lifetimePrice: string | null;
    isPurchasing: boolean;
    isRestoring: boolean;
    purchasePremium: () => Promise<PremiumActionResult>;
    restorePremium: () => Promise<PremiumActionResult>;
    setDevelopmentPremium: (hasPremium: boolean) => void;
};

const PremiumContext = createContext<PremiumContextValue | undefined>(undefined);

type PremiumProviderProps = {
    children: ReactNode;
};

export function PremiumProvider({ children }: PremiumProviderProps) {
    const { session, isLoading: isAuthLoading } = useAuth();
    const [hasRevenueCatAccess, setHasRevenueCatAccess] = useState(false);
    const [hasDevelopmentAccess, setHasDevelopmentAccess] = useState(false);
    const [isPremiumLoading, setIsPremiumLoading] = useState(true);
    const [isRevenueCatConfigured, setIsRevenueCatConfigured] = useState(false);
    const [revenueCatUnavailableReason, setRevenueCatUnavailableReason] = useState<string | null>(null);
    const [lifetimePackage, setLifetimePackage] = useState<PurchasesPackage | null>(null);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    const userId = session?.user.id;
    const hasPremium = hasRevenueCatAccess || hasDevelopmentAccess;

    useEffect(() => {
        if (isAuthLoading) {
            setIsPremiumLoading(true);
            return;
        }

        if (!userId) {
            setHasRevenueCatAccess(false);
            setHasDevelopmentAccess(false);
            setIsRevenueCatConfigured(false);
            setRevenueCatUnavailableReason(null);
            setLifetimePackage(null);
            setIsPremiumLoading(false);
            return;
        }

        let isMounted = true;
        let unsubscribeFromCustomerInfo: (() => void) | undefined;

        setHasRevenueCatAccess(false);
        setHasDevelopmentAccess(false);
        setIsRevenueCatConfigured(false);
        setRevenueCatUnavailableReason(null);
        setLifetimePackage(null);
        setIsPremiumLoading(true);

        Promise.allSettled([
            PREMIUM_TEST_CONTROLS_ENABLED ? loadPremiumTestOverride(userId) : Promise.resolve(false),
            configureRevenueCatForUser(userId),
        ]).then(([developmentAccessResult, revenueCatResult]) => {
            if (!isMounted) {
                return;
            }

            if (developmentAccessResult.status === "fulfilled") {
                setHasDevelopmentAccess(developmentAccessResult.value);
            } else {
                console.error("Failed to load the Premium test override:", developmentAccessResult.reason);
                setHasDevelopmentAccess(false);
            }

            if (revenueCatResult.status === "fulfilled") {
                const revenueCat = revenueCatResult.value;

                setHasRevenueCatAccess(hasRevenueCatPremium(revenueCat.customerInfo));
                setIsRevenueCatConfigured(revenueCat.configured);
                setRevenueCatUnavailableReason(revenueCat.unavailableReason);
                setLifetimePackage(revenueCat.lifetimePackage);

                if (revenueCat.configured) {
                    unsubscribeFromCustomerInfo = subscribeToRevenueCatCustomerInfo((customerInfo) => {
                        if (isMounted) {
                            setHasRevenueCatAccess(hasRevenueCatPremium(customerInfo));
                        }
                    });
                }
            } else {
                console.error("Failed to configure RevenueCat:", revenueCatResult.reason);
                setHasRevenueCatAccess(false);
                setIsRevenueCatConfigured(false);
                setRevenueCatUnavailableReason("RevenueCat could not be initialized in this build.");
                setLifetimePackage(null);
            }

            setIsPremiumLoading(false);
        });

        return () => {
            isMounted = false;
            unsubscribeFromCustomerInfo?.();
        };
    }, [isAuthLoading, userId]);

    async function purchasePremium(): Promise<PremiumActionResult> {
        if (!isRevenueCatConfigured || !lifetimePackage || isPurchasing) {
            return {
                success: false,
                cancelled: false,
                errorMessage: REVENUECAT_TEST_STORE_ENABLED
                    ? revenueCatUnavailableReason ?? "The RevenueCat lifetime package is not available. Check the current offering in RevenueCat."
                    : "RevenueCat Test Store is not configured for this build.",
            };
        }

        setIsPurchasing(true);

        try {
            const result = await purchaseRevenueCatLifetime(lifetimePackage);

            if (result.cancelled) {
                return {
                    success: false,
                    cancelled: true,
                    errorMessage: null,
                };
            }

            const isActive = hasRevenueCatPremium(result.customerInfo);
            setHasRevenueCatAccess(isActive);

            return {
                success: isActive,
                cancelled: false,
                errorMessage: isActive ? null : "The purchase completed, but Premium access was not returned.",
            };
        } catch (error) {
            console.error("RevenueCat lifetime purchase failed:", error);

            return {
                success: false,
                cancelled: false,
                errorMessage: "The test purchase could not be completed. Please try again.",
            };
        } finally {
            setIsPurchasing(false);
        }
    }

    async function restorePremium(): Promise<PremiumActionResult> {
        if (!isRevenueCatConfigured || isRestoring) {
            return {
                success: false,
                cancelled: false,
                errorMessage: revenueCatUnavailableReason ?? "RevenueCat Test Store is not configured for this build.",
            };
        }

        setIsRestoring(true);

        try {
            const customerInfo = await restoreRevenueCatPurchases();
            const isActive = hasRevenueCatPremium(customerInfo);

            setHasRevenueCatAccess(isActive);

            return {
                success: isActive,
                cancelled: false,
                errorMessage: isActive ? null : "No Premium purchase was found for this account.",
            };
        } catch (error) {
            console.error("RevenueCat purchase restore failed:", error);

            return {
                success: false,
                cancelled: false,
                errorMessage: "Premium access could not be restored. Please try again.",
            };
        } finally {
            setIsRestoring(false);
        }
    }

    function setDevelopmentPremium(value: boolean) {
        if (!PREMIUM_TEST_CONTROLS_ENABLED || !userId) {
            return;
        }

        setHasDevelopmentAccess(value);

        savePremiumTestOverride(userId, value).catch((error) => {
            console.error("Failed to save the Premium test override:", error);
        });
    }

    return (
        <PremiumContext.Provider
            value={{
                hasPremium,
                hasDevelopmentPremiumOverride: hasDevelopmentAccess,
                isPremiumLoading,
                isRevenueCatConfigured,
                revenueCatUnavailableReason,
                isLifetimePurchaseAvailable: lifetimePackage !== null,
                lifetimePrice: lifetimePackage?.product.priceString ?? null,
                isPurchasing,
                isRestoring,
                purchasePremium,
                restorePremium,
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
