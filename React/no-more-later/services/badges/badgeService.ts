import { supabase } from "@/lib/supabase";
import { BADGE_IDS, BADGE_TIERS } from "@/types/badges";

import type { BadgeId, BadgeProgressMetrics, BadgeTier, BadgeUnlock, BadgeUnlockAward } from "@/types/badges";

export const EMPTY_BADGE_PROGRESS: BadgeProgressMetrics = {
    focus_legend: 0,
    master_of_time: 0,
    streak_champion: 0,
    task_master: 0,
    early_bird: 0,
    night_owl: 0,
    weekend_warrior: 0,
};

type BadgeEvaluation = {
    unlocks: BadgeUnlockAward[];
    badgeXpAwarded: number;
    totalXp: number;
};

export async function getBadgeUnlocks(userId: string): Promise<{ data: BadgeUnlock[] | null; error: Error | null }> {
    const { data, error } = await supabase
        .from("badge_unlocks")
        .select("badge_id, tier, xp_awarded, unlocked_at")
        .eq("user_id", userId)
        .order("unlocked_at", { ascending: true });

    if (error) return { data: null, error: new Error(error.message) };

    return {
        data: data.flatMap((row) => {
            if (!isBadgeId(row.badge_id) || !isBadgeTier(row.tier)) return [];

            return [{
                badgeId: row.badge_id,
                tier: row.tier,
                xpAwarded: Number(row.xp_awarded),
                unlockedAt: String(row.unlocked_at),
            } satisfies BadgeUnlock];
        }),
        error: null,
    };
}

export async function getBadgeProgress(): Promise<{ data: BadgeProgressMetrics | null; error: Error | null }> {
    const { data, error } = await supabase.rpc("get_my_badge_progress");

    if (error) return { data: null, error: new Error(error.message) };

    const values = data && typeof data === "object" ? data as Record<string, unknown> : {};
    const progress = { ...EMPTY_BADGE_PROGRESS };

    BADGE_IDS.forEach((badgeId) => {
        const value = Number(values[badgeId] ?? 0);
        progress[badgeId] = Number.isFinite(value) ? Math.max(0, value) : 0;
    });

    return { data: progress, error: null };
}

export async function evaluateBadgeUnlocks(): Promise<{ data: BadgeEvaluation | null; error: Error | null }> {
    const { data, error } = await supabase.rpc("evaluate_badges");

    if (error) return { data: null, error: new Error(error.message) };

    const result = data && typeof data === "object" ? data as Record<string, unknown> : {};
    const rawUnlocks = Array.isArray(result.unlocks) ? result.unlocks : [];
    const unlocks = rawUnlocks.flatMap((value) => {
        if (!value || typeof value !== "object") return [];
        const row = value as Record<string, unknown>;

        if (!isBadgeId(row.badge_id) || !isBadgeTier(row.tier)) return [];

        return [{
            badgeId: row.badge_id,
            tier: row.tier,
            xpAwarded: Math.max(0, Number(row.xp_awarded ?? 0)),
            unlockedAt: String(row.unlocked_at ?? new Date().toISOString()),
            totalXp: Math.max(0, Number(result.total_xp ?? 0)),
        } satisfies BadgeUnlockAward];
    });

    return {
        data: {
            unlocks,
            badgeXpAwarded: Math.max(0, Number(result.badge_xp_awarded ?? 0)),
            totalXp: Math.max(0, Number(result.total_xp ?? 0)),
        },
        error: null,
    };
}

export async function getMyTotalXp(): Promise<{ data: number | null; error: Error | null }> {
    const { data, error } = await supabase.rpc("get_my_total_xp");

    if (error) return { data: null, error: new Error(error.message) };

    return { data: Math.max(0, Number(data ?? 0)), error: null };
}

function isBadgeId(value: unknown): value is BadgeId {
    return typeof value === "string" && BADGE_IDS.includes(value as BadgeId);
}

function isBadgeTier(value: unknown): value is BadgeTier {
    return typeof value === "string" && BADGE_TIERS.includes(value as BadgeTier);
}
