import { supabase } from "@/lib/supabase";

import type { Profile } from "@/types/models";

export async function getProfile(userId: string): Promise<{
    data: Profile | null;
    error: Error | null;
}> {
    const { data, error } = await supabase.from("profiles").select("id, display_name, created_at").eq("id", userId).maybeSingle();

    return {
        data,
        error,
    };
}
