import type {
    CustomerInfo,
    CustomerInfoUpdateListener,
    PurchasesPackage,
} from "react-native-purchases";

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

export const REVENUECAT_IOS_DISABLED_MESSAGE =
    "Premium purchases are temporarily unavailable on iOS.";

export function hasRevenueCatPremium(_customerInfo: CustomerInfo | null): boolean {
    return false;
}

export async function configureRevenueCatForUser(_userId: string): Promise<RevenueCatConfiguration> {
    return {
        configured: false,
        customerInfo: null,
        lifetimePackage: null,
        unavailableReason: REVENUECAT_IOS_DISABLED_MESSAGE,
    };
}

export function isRevenueCatRuntimeAvailable(): boolean {
    return false;
}

export function subscribeToRevenueCatCustomerInfo(_listener: CustomerInfoUpdateListener): () => void {
    return () => undefined;
}

export async function purchaseRevenueCatLifetime(
    _lifetimePackage: PurchasesPackage,
): Promise<RevenueCatPurchaseResult> {
    throw new Error(REVENUECAT_IOS_DISABLED_MESSAGE);
}

export async function restoreRevenueCatPurchases(): Promise<CustomerInfo> {
    throw new Error(REVENUECAT_IOS_DISABLED_MESSAGE);
}
