import { supabase } from "../../lib/supabase";

export type LeaderboardEntry = {
    user_id: string;
    display_name: string;
    total_xp: number;
};

export type MyLeaderboardPosition = {
    user_id: string;
    display_name: string;
    total_xp: number;
    leaderboard_position: number;
};

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase.rpc("get_leaderboard");

    if (error) {
        throw error;
    }

    return (data ?? []) as LeaderboardEntry[];
}

export async function getMyLeaderboardPosition(): Promise<MyLeaderboardPosition | null> {
    const { data, error } = await supabase.rpc("get_my_leaderboard_position");

    if (error) {
        throw error;
    }

    return data?.[0] ?? null;
}
