import Purchases, {
    LOG_LEVEL,
    PACKAGE_TYPE,
    PURCHASES_ERROR_CODE,
    type CustomerInfo,
    type CustomerInfoUpdateListener,
    type PurchasesPackage,
} from "react-native-purchases";
import { NativeModules, Platform } from "react-native";

import {
    REVENUECAT_OFFERING_ID,
    REVENUECAT_PREMIUM_ENTITLEMENT_ID,
    REVENUECAT_TEST_STORE_API_KEY,
    REVENUECAT_TEST_STORE_ENABLED,
} from "@/constants/revenueCat";

export type RevenueCatConfiguration = {
    configured: boolean;
    customerInfo: CustomerInfo | null;
    lifetimePackage: PurchasesPackage | null;
    unavailableReason: string | null;
};

export type RevenueCatPurchaseResult = {
    customerInfo: CustomerInfo | null;
    cancelled: boolean;
};

export const REVENUECAT_NATIVE_BUILD_REQUIRED_MESSAGE =
    "RevenueCat is not included in this installed app. Install a newly built development or preview APK to enable purchases.";

export function hasRevenueCatPremium(customerInfo: CustomerInfo | null): boolean {
    return Boolean(customerInfo?.entitlements.active[REVENUECAT_PREMIUM_ENTITLEMENT_ID]);
}

export async function configureRevenueCatForUser(userId: string): Promise<RevenueCatConfiguration> {
    if (!REVENUECAT_TEST_STORE_ENABLED) {
        return {
            configured: false,
            customerInfo: null,
            lifetimePackage: null,
            unavailableReason: null,
        };
    }

    if (!isRevenueCatRuntimeAvailable()) {
        return {
            configured: false,
            customerInfo: null,
            lifetimePackage: null,
            unavailableReason: REVENUECAT_NATIVE_BUILD_REQUIRED_MESSAGE,
        };
    }

    await Purchases.setLogLevel(LOG_LEVEL.DEBUG);

    const isConfigured = await Purchases.isConfigured();

    if (!isConfigured) {
        Purchases.configure({
            apiKey: REVENUECAT_TEST_STORE_API_KEY,
            appUserID: userId,
        });
    } else if ((await Purchases.getAppUserID()) !== userId) {
        await Purchases.logIn(userId);
    }

    const customerInfo = await Purchases.getCustomerInfo();

    let lifetimePackage: PurchasesPackage | null = null;

    try {
        const offerings = await Purchases.getOfferings();
        const offering = offerings.current ?? offerings.all[REVENUECAT_OFFERING_ID] ?? null;

        lifetimePackage =
            offering?.lifetime ??
            offering?.availablePackages.find((candidate) => candidate.packageType === PACKAGE_TYPE.LIFETIME) ??
            null;
    } catch (error) {
        console.warn("RevenueCat is configured, but the lifetime offering could not be loaded:", error);
    }

    return {
        configured: true,
        customerInfo,
        lifetimePackage,
        unavailableReason: null,
    };
}

export function isRevenueCatRuntimeAvailable(): boolean {
    return Platform.OS === "web" || NativeModules.RNPurchases != null;
}

export function subscribeToRevenueCatCustomerInfo(listener: CustomerInfoUpdateListener): () => void {
    Purchases.addCustomerInfoUpdateListener(listener);

    return () => {
        Purchases.removeCustomerInfoUpdateListener(listener);
    };
}

export async function purchaseRevenueCatLifetime(
    lifetimePackage: PurchasesPackage,
): Promise<RevenueCatPurchaseResult> {
    try {
        const { customerInfo } = await Purchases.purchasePackage(lifetimePackage);

        return {
            customerInfo,
            cancelled: false,
        };
    } catch (error) {
        if (isCancelledPurchase(error)) {
            return {
                customerInfo: null,
                cancelled: true,
            };
        }

        throw error;
    }
}

export async function restoreRevenueCatPurchases(): Promise<CustomerInfo> {
    return await Purchases.restorePurchases();
}

function isCancelledPurchase(error: unknown): boolean {
    if (!error || typeof error !== "object") {
        return false;
    }

    const purchasesError = error as {
        code?: string;
        userCancelled?: boolean | null;
    };

    return purchasesError.userCancelled === true || purchasesError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
}
