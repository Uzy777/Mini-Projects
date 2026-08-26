import Constants, { ExecutionEnvironment } from "expo-constants";
import { AppState, Linking, NativeModules, Platform } from "react-native";

import { getActiveFocusSession } from "@/services/storage/activeFocusSessionStorage";
import { canSendFocusNotifications, type FocusNotificationPermissionState } from "@/services/notifications/focusNotificationTypes";
import type { ActiveFocusSession } from "@/types/models";

import type { Event, Notification, NotificationSettings } from "@notifee/react-native";

const FOCUS_COMPLETE_NOTIFICATION_ID = "focus-session-complete";
const FOCUS_THREAD_ID = "focus-sessions";

type FocusNotificationRouteListener = (route: string) => void;
type NotifeePackage = typeof import("@notifee/react-native");

const routeListeners = new Set<FocusNotificationRouteListener>();
let pendingRoute: string | null = null;
let handlersRegistered = false;
let cachedNotifeePackage: NotifeePackage | null | undefined;

export function registerFocusNotificationHandlers(): void {
    if (Platform.OS !== "ios" || handlersRegistered) {
        return;
    }

    const notifeePackage = getNotifeePackage();
    if (!notifeePackage) {
        return;
    }

    handlersRegistered = true;

    notifeePackage.default.onForegroundEvent((event) => {
        handleNotificationEvent(event, notifeePackage);
    });
    notifeePackage.default.onBackgroundEvent(async (event) => {
        handleNotificationEvent(event, notifeePackage);
    });
}

export function subscribeToFocusNotificationPress(listener: FocusNotificationRouteListener): () => void {
    if (Platform.OS !== "ios") {
        return () => undefined;
    }

    registerFocusNotificationHandlers();
    routeListeners.add(listener);

    if (pendingRoute) {
        const route = pendingRoute;
        pendingRoute = null;
        listener(route);
    }

    return () => {
        routeListeners.delete(listener);
    };
}

export async function showRunningFocusNotification(session: ActiveFocusSession): Promise<void> {
    if (!isIosFocusSession(session) || !session.isRunning || session.endTime === null || session.endTime <= Date.now()) {
        return;
    }

    const notifeePackage = getNotifeePackage();
    if (!notifeePackage) {
        return;
    }

    await safelyRunNotificationAction("schedule the iOS Focus completion notification", async () => {
        const permissionState = mapPermissionState(await notifeePackage.default.getNotificationSettings(), notifeePackage);
        if (!canSendFocusNotifications(permissionState)) {
            return;
        }

        await notifeePackage.default.cancelTriggerNotification(FOCUS_COMPLETE_NOTIFICATION_ID);
        await notifeePackage.default.createTriggerNotification(
            {
                id: FOCUS_COMPLETE_NOTIFICATION_ID,
                title: "Focus session complete",
                body: session.questTitle ? `${session.questTitle} is ready for Review.` : "Your Focus Session is ready for Review.",
                data: buildNotificationData(session),
                ios: {
                    sound: "default",
                    threadId: FOCUS_THREAD_ID,
                    foregroundPresentationOptions: {
                        alert: false,
                        badge: false,
                        sound: false,
                        banner: false,
                        list: false,
                    },
                },
            },
            {
                type: notifeePackage.TriggerType.TIMESTAMP,
                timestamp: session.endTime,
            },
        );
    });
}

export async function removeRunningFocusNotification(): Promise<void> {
    const notifeePackage = getNotifeePackage();
    if (!notifeePackage) {
        return;
    }

    await safelyRunNotificationAction("cancel the pending iOS Focus completion notification", () =>
        notifeePackage.default.cancelTriggerNotification(FOCUS_COMPLETE_NOTIFICATION_ID),
    );
}

export async function clearFocusNotifications(): Promise<void> {
    const notifeePackage = getNotifeePackage();
    if (!notifeePackage) {
        return;
    }

    await safelyRunNotificationAction("clear iOS Focus notifications", () =>
        notifeePackage.default.cancelNotification(FOCUS_COMPLETE_NOTIFICATION_ID),
    );
}

export async function showFocusSessionCompleteNotification(_session: ActiveFocusSession): Promise<void> {
    if (AppState.currentState !== "active") {
        return;
    }

    // The in-app timer owns the active-state completion UI and sound. Suppress/remove
    // the matching OS trigger so the user never receives a duplicate completion alert.
    await clearFocusNotifications();
}

export async function reconcileFocusNotificationWithStoredSession(): Promise<void> {
    const notifeePackage = getNotifeePackage();
    if (!notifeePackage) {
        return;
    }

    try {
        const session = await getActiveFocusSession();

        if (session && isIosFocusSession(session) && session.isRunning && session.endTime !== null && session.endTime > Date.now()) {
            await showRunningFocusNotification(session);
            return;
        }

        await notifeePackage.default.cancelTriggerNotification(FOCUS_COMPLETE_NOTIFICATION_ID);
    } catch (error) {
        console.warn("Failed to reconcile the iOS Focus notification:", error);
    }
}

export async function getFocusNotificationPermissionState(): Promise<FocusNotificationPermissionState> {
    const notifeePackage = getNotifeePackage();
    if (!notifeePackage) {
        return "unavailable";
    }

    try {
        return mapPermissionState(await notifeePackage.default.getNotificationSettings(), notifeePackage);
    } catch (error) {
        console.warn("Failed to inspect iOS notification permission:", error);
        return "unavailable";
    }
}

export async function requestFocusNotificationPermission(): Promise<FocusNotificationPermissionState> {
    const notifeePackage = getNotifeePackage();
    if (!notifeePackage) {
        return "unavailable";
    }

    try {
        const currentState = mapPermissionState(await notifeePackage.default.getNotificationSettings(), notifeePackage);

        if (currentState !== "not-determined") {
            return currentState;
        }

        const settings = await notifeePackage.default.requestPermission({
            alert: true,
            announcement: false,
            badge: false,
            carPlay: false,
            criticalAlert: false,
            provisional: false,
            sound: true,
        });

        return mapPermissionState(settings, notifeePackage);
    } catch (error) {
        console.warn("Failed to request iOS notification permission:", error);
        return "unavailable";
    }
}

export async function openFocusNotificationSettings(): Promise<void> {
    if (Platform.OS !== "ios") {
        return;
    }

    try {
        await Linking.openSettings();
    } catch (error) {
        console.warn("Failed to open iOS notification settings:", error);
    }
}

function getNotifeePackage(): NotifeePackage | null {
    if (cachedNotifeePackage !== undefined) {
        return cachedNotifeePackage;
    }

    if (
        Platform.OS !== "ios" ||
        Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
        !NativeModules.NotifeeApiModule
    ) {
        cachedNotifeePackage = null;
        return null;
    }

    try {
        cachedNotifeePackage = require("@notifee/react-native") as NotifeePackage;
    } catch (error) {
        console.warn("Focus notifications are unavailable because the Notifee native module could not be loaded:", error);
        cachedNotifeePackage = null;
    }

    return cachedNotifeePackage ?? null;
}

function mapPermissionState(settings: NotificationSettings, notifeePackage: NotifeePackage): FocusNotificationPermissionState {
    if (settings.authorizationStatus === notifeePackage.AuthorizationStatus.NOT_DETERMINED) {
        return "not-determined";
    }

    if (settings.authorizationStatus === notifeePackage.AuthorizationStatus.DENIED) {
        return "denied";
    }

    const hasNoVisibleDestination =
        settings.ios.alert === notifeePackage.IOSNotificationSetting.DISABLED &&
        settings.ios.lockScreen === notifeePackage.IOSNotificationSetting.DISABLED &&
        settings.ios.notificationCenter === notifeePackage.IOSNotificationSetting.DISABLED;

    if (hasNoVisibleDestination) {
        return "settings-disabled";
    }

    if (settings.authorizationStatus === notifeePackage.AuthorizationStatus.PROVISIONAL) {
        return "provisional";
    }

    return "authorized";
}

function handleNotificationEvent(event: Event, notifeePackage: NotifeePackage): void {
    if (event.type !== notifeePackage.EventType.PRESS) {
        return;
    }

    publishNotificationRoute(getNotificationRoute(event.detail.notification));
}

function publishNotificationRoute(route: string | null): void {
    if (!route) {
        return;
    }

    if (routeListeners.size === 0) {
        pendingRoute = route;
        return;
    }

    for (const listener of routeListeners) {
        listener(route);
    }
}

function getNotificationRoute(notification: Notification | undefined): string | null {
    const route = notification?.data?.focusRoute;
    return typeof route === "string" ? route : null;
}

function buildNotificationData(session: ActiveFocusSession): Record<string, string> {
    return {
        sessionId: session.id,
        endTime: String(session.endTime ?? 0),
        focusRoute: buildFocusRoute(session),
    };
}

function buildFocusRoute(session: ActiveFocusSession): string {
    if (session.source === "quick-focus") {
        return "/";
    }

    const params = new URLSearchParams({
        questTitle: session.questTitle,
        ...(session.journeyId ? { journeyId: session.journeyId } : {}),
        ...(session.source ? { source: session.source } : {}),
    });

    return `/focus/${encodeURIComponent(session.questId)}?${params.toString()}`;
}

function isIosFocusSession(session: ActiveFocusSession): boolean {
    return Platform.OS === "ios" && (session.timerMode ?? "focus") === "focus";
}

async function safelyRunNotificationAction(description: string, action: () => Promise<void>): Promise<void> {
    if (Platform.OS !== "ios") {
        return;
    }

    try {
        await action();
    } catch (error) {
        console.warn(`Failed to ${description}:`, error);
    }
}
