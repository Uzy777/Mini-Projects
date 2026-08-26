export type FocusNotificationPermissionState =
    | "unavailable"
    | "not-determined"
    | "authorized"
    | "provisional"
    | "denied"
    | "settings-disabled";

export function canSendFocusNotifications(state: FocusNotificationPermissionState): boolean {
    return state === "authorized" || state === "provisional";
}
