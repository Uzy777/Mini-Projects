import { supabase } from "../../lib/supabase";

export type LeaderboardEntry = {
    user_id: string;
    display_name: string;
    total_xp: number;
    focused_seconds: number;
    leaderboard_position: number;
};

export type MyLeaderboardPosition = {
    user_id: string;
    display_name: string;
    total_xp: number;
    focused_seconds: number;
    leaderboard_position: number;
};

export type LeaderboardPeriod = "30_days" | "all_time";

export async function getLeaderboard(period: LeaderboardPeriod): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase.rpc("get_leaderboard", { p_period: period });

    if (error) {
        throw error;
    }

    return (data ?? []) as LeaderboardEntry[];
}

export async function getMyLeaderboardPosition(period: LeaderboardPeriod): Promise<MyLeaderboardPosition | null> {
    const { data, error } = await supabase.rpc("get_my_leaderboard_position", { p_period: period });

    if (error) {
        throw error;
    }

    return data?.[0] ?? null;
}
