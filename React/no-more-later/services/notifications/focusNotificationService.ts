import notifee, {
    AndroidCategory,
    AndroidForegroundServiceType,
    AndroidImportance,
    EventType,
    type Event,
    type Notification,
} from "@notifee/react-native";
import { Platform } from "react-native";

import { getActiveFocusSession, saveActiveFocusSession } from "@/services/storage/activeFocusSessionStorage";
import type { ActiveFocusSession, FocusTimelineEvent } from "@/types/models";

const FOCUS_CHANNEL_ID = "focus-sessions";
const LEGACY_FOCUS_COMPLETE_CHANNEL_ID = "focus-session-complete";
const FOCUS_COMPLETE_CHANNEL_ID = "focus-session-complete-v2";
const FOCUS_NOTIFICATION_ID = "active-focus-session";
const FOCUS_COMPLETE_NOTIFICATION_ID = "focus-session-complete";
const FOCUS_PRESS_ACTION_ID = "open-focus-session";
const NOTIFICATION_ICON = "ic_focus_notification";
const FOCUS_COMPLETE_SOUND = "focus_complete";
const INDIGO_ACCENT = "#4F46E5";

type FocusNotificationRouteListener = (route: string) => void;

const routeListeners = new Set<FocusNotificationRouteListener>();
let pendingRoute: string | null = null;
let handlersRegistered = false;
let initialNotificationChecked = false;

export function registerFocusNotificationHandlers(): void {
    if (Platform.OS !== "android" || handlersRegistered) {
        return;
    }

    handlersRegistered = true;

    notifee.registerForegroundService(runFocusForegroundService);
    notifee.onForegroundEvent(handleNotificationEvent);
    notifee.onBackgroundEvent(async (event) => {
        handleNotificationEvent(event);
    });
}

export function subscribeToFocusNotificationPress(listener: FocusNotificationRouteListener): () => void {
    if (Platform.OS !== "android") {
        return () => undefined;
    }

    routeListeners.add(listener);

    if (pendingRoute) {
        const route = pendingRoute;
        pendingRoute = null;
        listener(route);
    }

    if (!initialNotificationChecked) {
        initialNotificationChecked = true;

        void notifee
            .getInitialNotification()
            .then((initialNotification) => {
                if (initialNotification) {
                    publishNotificationRoute(getNotificationRoute(initialNotification.notification));
                }
            })
            .catch((error) => {
                console.warn("Failed to read the initial Focus notification:", error);
            });
    }

    return () => {
        routeListeners.delete(listener);
    };
}

export async function showRunningFocusNotification(session: ActiveFocusSession): Promise<void> {
    if (!isAndroidFocusSession(session) || !session.isRunning || session.endTime === null) {
        return;
    }

    if (session.endTime <= Date.now()) {
        await completeExpiredFocusSession(session.id, session.endTime);
        return;
    }

    const endTime = session.endTime;

    await safelyRunNotificationAction("show the running Focus notification", async () => {
        await prepareAndroidNotifications();
        await notifee.cancelNotification(FOCUS_COMPLETE_NOTIFICATION_ID);

        await notifee.displayNotification({
            id: FOCUS_NOTIFICATION_ID,
            title: "No More Later",
            body: session.questTitle || "Focus session",
            data: buildNotificationData(session),
            android: {
                channelId: FOCUS_CHANNEL_ID,
                smallIcon: NOTIFICATION_ICON,
                color: INDIGO_ACCENT,
                category: AndroidCategory.SERVICE,
                asForegroundService: true,
                foregroundServiceTypes: [AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_SPECIAL_USE],
                ongoing: true,
                autoCancel: false,
                onlyAlertOnce: true,
                showChronometer: true,
                chronometerDirection: "down",
                timestamp: endTime,
                pressAction: {
                    id: FOCUS_PRESS_ACTION_ID,
                    launchActivity: "default",
                },
            },
        });
    });
}

export async function removeRunningFocusNotification(): Promise<void> {
    if (Platform.OS !== "android") {
        return;
    }

    await safelyRunNotificationAction("remove the running Focus notification", async () => {
        await notifee.stopForegroundService();
        await notifee.cancelNotification(FOCUS_NOTIFICATION_ID);
    });
}

export async function showFocusSessionCompleteNotification(session: ActiveFocusSession): Promise<void> {
    if (!isAndroidFocusSession(session)) {
        return;
    }

    await safelyRunNotificationAction("show the completed Focus notification", async () => {
        await notifee.stopForegroundService();
        await notifee.cancelNotification(FOCUS_NOTIFICATION_ID);
        await createFocusNotificationChannels();

        await notifee.displayNotification({
            id: FOCUS_COMPLETE_NOTIFICATION_ID,
            title: "Focus session complete",
            body: session.questTitle || "Focus session",
            data: buildNotificationData(session),
            android: {
                channelId: FOCUS_COMPLETE_CHANNEL_ID,
                smallIcon: NOTIFICATION_ICON,
                color: INDIGO_ACCENT,
                category: AndroidCategory.STATUS,
                sound: FOCUS_COMPLETE_SOUND,
                autoCancel: true,
                onlyAlertOnce: true,
                pressAction: {
                    id: FOCUS_PRESS_ACTION_ID,
                    launchActivity: "default",
                },
            },
        });
    });
}

export async function reconcileFocusNotificationWithStoredSession(): Promise<void> {
    if (Platform.OS !== "android") {
        return;
    }

    try {
        const session = await getActiveFocusSession();

        if (session && isAndroidFocusSession(session) && session.isRunning && session.endTime !== null) {
            await showRunningFocusNotification(session);
            return;
        }

        await removeRunningFocusNotification();
    } catch (error) {
        console.warn("Failed to reconcile the Focus notification:", error);
    }
}

async function prepareAndroidNotifications(): Promise<void> {
    await createFocusNotificationChannels();
    await notifee.requestPermission();
}

async function createFocusNotificationChannels(): Promise<void> {
    await notifee.deleteChannel(LEGACY_FOCUS_COMPLETE_CHANNEL_ID);

    await Promise.all([
        notifee.createChannel({
            id: FOCUS_CHANNEL_ID,
            name: "Focus sessions",
            description: "Shows the countdown for an active Focus Session.",
            importance: AndroidImportance.LOW,
        }),
        notifee.createChannel({
            id: FOCUS_COMPLETE_CHANNEL_ID,
            name: "Focus session completions",
            description: "Lets you know when a Focus Session is complete.",
            importance: AndroidImportance.DEFAULT,
            sound: FOCUS_COMPLETE_SOUND,
        }),
    ]);
}

function runFocusForegroundService(notification: Notification): Promise<void> {
    return new Promise((resolve) => {
        const endTime = Number(notification.data?.endTime);
        const sessionId = notification.data?.sessionId;

        if (typeof sessionId !== "string" || !Number.isFinite(endTime)) {
            resolve();
            return;
        }

        const finishSession = async () => {
            try {
                await completeExpiredFocusSession(sessionId, endTime);
            } finally {
                resolve();
            }
        };

        setTimeout(() => {
            void finishSession();
        }, Math.max(0, endTime - Date.now()));
    });
}

async function completeExpiredFocusSession(sessionId: string, expectedEndTime: number): Promise<void> {
    const storedSession = await getActiveFocusSession();

    if (
        !storedSession ||
        storedSession.id !== sessionId ||
        !isAndroidFocusSession(storedSession) ||
        !storedSession.isRunning ||
        storedSession.endTime !== expectedEndTime ||
        expectedEndTime > Date.now()
    ) {
        return;
    }

    const completedSession: ActiveFocusSession = {
        ...storedSession,
        remainingSeconds: 0,
        actualSeconds: storedSession.selectedMinutes * 60,
        endedEarly: false,
        isRunning: false,
        endTime: null,
        timelineEvents: appendCompletedEvent(storedSession.timelineEvents ?? [], expectedEndTime),
    };

    await saveActiveFocusSession(completedSession);
    await showFocusSessionCompleteNotification(completedSession);
}

function handleNotificationEvent(event: Event): void {
    if (event.type !== EventType.PRESS || event.detail.pressAction?.id !== FOCUS_PRESS_ACTION_ID) {
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

function isAndroidFocusSession(session: ActiveFocusSession): boolean {
    return Platform.OS === "android" && (session.timerMode ?? "focus") === "focus";
}

function appendCompletedEvent(events: FocusTimelineEvent[], completedAt: number): FocusTimelineEvent[] {
    if (events.some((event) => event.type === "completed")) {
        return events;
    }

    return [...events, { type: "completed", occurredAt: new Date(completedAt).toISOString() }];
}

async function safelyRunNotificationAction(description: string, action: () => Promise<void>): Promise<void> {
    if (Platform.OS !== "android") {
        return;
    }

    try {
        await action();
    } catch (error) {
        console.warn(`Failed to ${description}:`, error);
    }
}
