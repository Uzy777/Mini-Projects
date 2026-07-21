export const JOURNEYS_STORAGE_KEY = "no-more-later-journeys";

export const FOCUS_SESSIONS_STORAGE_KEY = "no-more-later-focus-sessions";

export const TOTAL_XP_STORAGE_KEY = "no-more-later-total-xp";

export const ACTIVE_FOCUS_SESSION_STORAGE_KEY = "no-more-later-active-focus-session";

export function getQuestsStorageKey(journeyId: string) {
    return `no-more-later-quests-${journeyId}`;
}
