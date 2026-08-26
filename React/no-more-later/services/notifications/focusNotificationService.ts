import type { ActiveFocusSession } from "@/types/models";

type FocusNotificationRouteListener = (route: string) => void;

export function registerFocusNotificationHandlers(): void {
    // Android uses the platform-specific Notifee implementation.
}

export function subscribeToFocusNotificationPress(_listener: FocusNotificationRouteListener): () => void {
    return () => undefined;
}

export async function showRunningFocusNotification(_session: ActiveFocusSession): Promise<void> {
    // Focus notifications are intentionally Android-only.
}

export async function removeRunningFocusNotification(): Promise<void> {
    // Focus notifications are intentionally Android-only.
}

export async function showFocusSessionCompleteNotification(_session: ActiveFocusSession): Promise<void> {
    // Focus notifications are intentionally Android-only.
}

export async function reconcileFocusNotificationWithStoredSession(): Promise<void> {
    // Focus notifications are intentionally Android-only.
}
