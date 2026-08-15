import { supabase } from "../../lib/supabase";

export type LeaderboardEntry = {
    user_id: string;
    display_name: string;
    total_xp: number;
};

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase.rpc("get_leaderboard");

    if (error) {
        throw error;
    }

    return (data ?? []) as LeaderboardEntry[];
}
