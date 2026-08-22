import { PREMIUM_TEST_CONTROLS_ENABLED } from "@/constants/premium";

export const REVENUECAT_PREMIUM_ENTITLEMENT_ID = "premium";
export const REVENUECAT_LIFETIME_PRODUCT_ID = "no_more_later_premium_lifetime";
export const REVENUECAT_OFFERING_ID = "default";

export const REVENUECAT_TEST_STORE_API_KEY =
    process.env.EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY?.trim() ?? "";

export const REVENUECAT_TEST_STORE_ENABLED =
    PREMIUM_TEST_CONTROLS_ENABLED && REVENUECAT_TEST_STORE_API_KEY.length > 0;
