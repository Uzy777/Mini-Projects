import { supabase } from "@/lib/supabase";

import type { Profile } from "@/types/models";

export async function getProfile(userId: string): Promise<{
    data: Profile | null;
    error: Error | null;
}> {
    const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, display_name_change_used, daily_focus_goal_minutes, leaderboard_anonymous, created_at")
        .eq("id", userId)
        .maybeSingle();

    return {
        data,
        error,
    };
}

export async function updateDisplayName(
    userId: string,
    displayName: string,
): Promise<{
    data: Profile | null;
    error: Error | null;
}> {
    const { data, error } = await supabase
        .from("profiles")
        .update({
            display_name: displayName,
        })
        .eq("id", userId)
        .select("id, display_name, display_name_change_used, daily_focus_goal_minutes, leaderboard_anonymous, created_at")
        .single();

    return {
        data,
        error,
    };
}

export async function updateDailyFocusGoal(
    userId: string,
    dailyFocusGoalMinutes: number,
): Promise<{
    data: Profile | null;
    error: Error | null;
}> {
    const { data, error } = await supabase
        .from("profiles")
        .update({
            daily_focus_goal_minutes: dailyFocusGoalMinutes,
        })
        .eq("id", userId)
        .select("id, display_name, display_name_change_used, daily_focus_goal_minutes, leaderboard_anonymous, created_at")
        .single();

    return {
        data,
        error,
    };
}

export async function updateLeaderboardAnonymity(
    userId: string,
    leaderboardAnonymous: boolean,
): Promise<{
    data: Profile | null;
    error: Error | null;
}> {
    const { data, error } = await supabase
        .from("profiles")
        .update({ leaderboard_anonymous: leaderboardAnonymous })
        .eq("id", userId)
        .select("id, display_name, display_name_change_used, daily_focus_goal_minutes, leaderboard_anonymous, created_at")
        .single();

    return { data, error };
}
