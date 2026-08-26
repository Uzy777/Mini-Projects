import type { ActiveFocusSession } from "@/types/models";
import type { FocusNotificationPermissionState } from "@/services/notifications/focusNotificationTypes";

type FocusNotificationRouteListener = (route: string) => void;

export function registerFocusNotificationHandlers(): void {
    // Native platforms use platform-specific implementations.
}

export function subscribeToFocusNotificationPress(_listener: FocusNotificationRouteListener): () => void {
    return () => undefined;
}

export async function showRunningFocusNotification(_session: ActiveFocusSession): Promise<void> {
    // Web and unsupported runtimes do not schedule Focus notifications.
}

export async function removeRunningFocusNotification(): Promise<void> {
    // Web and unsupported runtimes do not schedule Focus notifications.
}

export async function showFocusSessionCompleteNotification(_session: ActiveFocusSession): Promise<void> {
    // Web and unsupported runtimes do not schedule Focus notifications.
}

export async function reconcileFocusNotificationWithStoredSession(): Promise<void> {
    // Web and unsupported runtimes do not schedule Focus notifications.
}

export async function clearFocusNotifications(): Promise<void> {
    // Web and unsupported runtimes do not schedule Focus notifications.
}

export async function getFocusNotificationPermissionState(): Promise<FocusNotificationPermissionState> {
    return "unavailable";
}

export async function requestFocusNotificationPermission(): Promise<FocusNotificationPermissionState> {
    return "unavailable";
}

export async function openFocusNotificationSettings(): Promise<void> {
    // Web and unsupported runtimes do not expose native notification settings.
}
