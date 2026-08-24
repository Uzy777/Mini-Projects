import { supabase } from "../../lib/supabase";
import { BADGE_IDS, BADGE_TIERS } from "@/types/badges";

import type { BadgeId, BadgeTier } from "@/types/badges";

export type LeaderboardEntry = {
    user_id: string;
    display_name: string;
    total_xp: number;
    focused_seconds: number;
    leaderboard_position: number;
    is_anonymous: boolean;
};

export type MyLeaderboardPosition = {
    user_id: string;
    display_name: string;
    total_xp: number;
    focused_seconds: number;
    leaderboard_position: number;
    is_anonymous: boolean;
};

export type LeaderboardPeriod = "30_days" | "all_time";
export type LeaderboardScope = "global" | "buddies";

export type BuddyInvite = {
    code: string;
    expires_at: string;
};

export type BuddyInvitePreview = BuddyInvite & {
    inviter_id: string;
    display_name: string;
};

export type Buddy = {
    user_id: string;
    display_name: string;
    connected_at: string;
};

export type LeaderboardProfileBadge = {
    badge_id: BadgeId;
    tier: BadgeTier;
    tier_count: number;
    unlocked_at: string;
};

export type LeaderboardProfile = {
    user_id: string;
    display_name: string;
    is_anonymous: boolean;
    is_buddy: boolean;
    focused_seconds: number;
    all_time_focused_seconds: number;
    qualifying_sessions: number;
    completed_tasks: number;
    best_streak: number;
    total_xp: number;
    badges: LeaderboardProfileBadge[];
};

export async function getLeaderboard(period: LeaderboardPeriod, scope: LeaderboardScope): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase.rpc("get_leaderboard", { p_period: period, p_scope: scope });

    if (error) {
        throw error;
    }

    return (data ?? []).map(normalizeLeaderboardEntry);
}

export async function getMyLeaderboardPosition(period: LeaderboardPeriod, scope: LeaderboardScope): Promise<MyLeaderboardPosition | null> {
    const { data, error } = await supabase.rpc("get_my_leaderboard_position", { p_period: period, p_scope: scope });

    if (error) {
        throw error;
    }

    return data?.[0] ? normalizeLeaderboardEntry(data[0]) : null;
}

function normalizeLeaderboardEntry(value: Record<string, unknown>): LeaderboardEntry {
    return {
        user_id: String(value.user_id ?? ""),
        display_name: String(value.display_name ?? "Anonymous Focuser"),
        total_xp: Math.max(0, Number(value.total_xp ?? 0)),
        focused_seconds: Math.max(0, Number(value.focused_seconds ?? 0)),
        leaderboard_position: Math.max(0, Number(value.leaderboard_position ?? 0)),
        is_anonymous: Boolean(value.is_anonymous),
    };
}

export async function getLeaderboardProfile(userId: string, period: LeaderboardPeriod): Promise<LeaderboardProfile> {
    const { data, error } = await supabase.rpc("get_leaderboard_profile", {
        p_user_id: userId,
        p_period: period,
    });

    if (error) throw error;

    const value = data && typeof data === "object" ? data as Record<string, unknown> : {};
    const badges = Array.isArray(value.badges) ? value.badges.flatMap((badge) => {
        if (!badge || typeof badge !== "object") return [];
        const row = badge as Record<string, unknown>;
        if (!BADGE_IDS.includes(row.badge_id as BadgeId) || !BADGE_TIERS.includes(row.tier as BadgeTier)) return [];

        return [{
            badge_id: row.badge_id as BadgeId,
            tier: row.tier as BadgeTier,
            tier_count: Math.max(0, Number(row.tier_count ?? 0)),
            unlocked_at: String(row.unlocked_at ?? ""),
        }];
    }) : [];

    return {
        user_id: String(value.user_id ?? userId),
        display_name: String(value.display_name ?? "Anonymous Focuser"),
        is_anonymous: Boolean(value.is_anonymous),
        is_buddy: Boolean(value.is_buddy),
        focused_seconds: Math.max(0, Number(value.focused_seconds ?? 0)),
        all_time_focused_seconds: Math.max(0, Number(value.all_time_focused_seconds ?? 0)),
        qualifying_sessions: Math.max(0, Number(value.qualifying_sessions ?? 0)),
        completed_tasks: Math.max(0, Number(value.completed_tasks ?? 0)),
        best_streak: Math.max(0, Number(value.best_streak ?? 0)),
        total_xp: Math.max(0, Number(value.total_xp ?? 0)),
        badges,
    };
}

export async function createBuddyInvite(): Promise<BuddyInvite> {
    const { data, error } = await supabase.rpc("create_buddy_invite");

    if (error) throw error;

    const value = data?.[0] as Record<string, unknown> | undefined;
    if (!value?.code || !value?.expires_at) {
        throw new Error("The buddy invite could not be created.");
    }

    return {
        code: String(value.code),
        expires_at: String(value.expires_at),
    };
}

export async function previewBuddyInvite(code: string): Promise<BuddyInvitePreview> {
    const { data, error } = await supabase.rpc("preview_buddy_invite", { p_code: normalizeBuddyCode(code) });

    if (error) throw error;

    const value = data as Record<string, unknown> | null;
    if (!value?.code || !value?.inviter_id || !value?.display_name || !value?.expires_at) {
        throw new Error("This buddy invite is not available.");
    }

    return {
        code: String(value.code),
        inviter_id: String(value.inviter_id),
        display_name: String(value.display_name),
        expires_at: String(value.expires_at),
    };
}

export async function acceptBuddyInvite(code: string): Promise<Pick<Buddy, "user_id" | "display_name">> {
    const { data, error } = await supabase.rpc("accept_buddy_invite", { p_code: normalizeBuddyCode(code) });

    if (error) throw error;

    const value = data as Record<string, unknown> | null;
    if (!value?.user_id || !value?.display_name) {
        throw new Error("This buddy invite could not be accepted.");
    }

    return {
        user_id: String(value.user_id),
        display_name: String(value.display_name),
    };
}

export async function getMyBuddies(): Promise<Buddy[]> {
    const { data, error } = await supabase.rpc("get_my_buddies");

    if (error) throw error;

    return (data ?? []).map((value: Record<string, unknown>) => ({
        user_id: String(value.user_id ?? ""),
        display_name: String(value.display_name ?? "Buddy"),
        connected_at: String(value.connected_at ?? ""),
    }));
}

export async function removeBuddy(buddyId: string): Promise<void> {
    const { data, error } = await supabase.rpc("remove_buddy", { p_buddy_id: buddyId });

    if (error) throw error;
    if (data !== true) throw new Error("This buddy connection no longer exists.");
}

export function normalizeBuddyCode(code: string): string {
    return code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}
