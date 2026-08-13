import { supabase } from "@/lib/supabase";

import type { Journey } from "@/types/models";

export async function getRemoteJourneys(userId: string): Promise<{
    data: Journey[] | null;
    error: Error | null;
}> {
    const { data, error } = await supabase.from("journeys").select("id, title, status").eq("user_id", userId).order("created_at", { ascending: false });

    return {
        data,
        error,
    };
}

export async function createRemoteJourney(
    userId: string,
    title: string,
): Promise<{
    data: Journey | null;
    error: Error | null;
}> {
    const { data, error } = await supabase
        .from("journeys")
        .insert({
            user_id: userId,
            title,
            status: "active",
        })
        .select("id, title, status")
        .single();

    return {
        data,
        error,
    };
}

export async function deleteRemoteJourney(journeyId: string): Promise<{
    error: Error | null;
}> {
    const { error } = await supabase.from("journeys").delete().eq("id", journeyId);

    return {
        error,
    };
}
