import { supabase } from "@/lib/supabase";

import type { WorkAssetId, WorkJourney, WorkQuest } from "@/types/work";

export async function getRemoteWorkJourneys(userId: string): Promise<{
    data: WorkJourney[] | null;
    error: Error | null;
}> {
    const { data, error } = await supabase
        .from("journeys")
        .select(
            `
                id,
                title,
                status,
                asset_id,
                sort_order
            `,
        )
        .eq("user_id", userId)
        .order("sort_order", {
            ascending: true,
        })
        .order("created_at", {
            ascending: false,
        });

    if (error) {
        return {
            data: null,
            error,
        };
    }

    const journeys: WorkJourney[] = data.map((journey) => ({
        id: journey.id,
        title: journey.title,
        status: journey.status,
        assetId: journey.asset_id as WorkAssetId,
        sortOrder: Number(journey.sort_order),
    }));

    return {
        data: journeys,
        error: null,
    };
}

export async function getRemoteWorkQuests(userId: string): Promise<{
    data: WorkQuest[] | null;
    error: Error | null;
}> {
    const { data, error } = await supabase
        .from("quests")
        .select(
            `
                id,
                title,
                status,
                asset_id,
                journey_id,
                sort_order
            `,
        )
        .eq("user_id", userId)
        .order("sort_order", {
            ascending: true,
        })
        .order("created_at", {
            ascending: false,
        });

    if (error) {
        return {
            data: null,
            error,
        };
    }

    const quests: WorkQuest[] = data.map((quest) => ({
        id: quest.id,
        title: quest.title,
        status: quest.status,
        assetId: quest.asset_id as WorkAssetId,
        sortOrder: Number(quest.sort_order),
        ...(quest.journey_id
            ? {
                  journeyId: quest.journey_id,
              }
            : {}),
    }));

    return {
        data: quests,
        error: null,
    };
}

export async function createRemoteWorkQuest(
    userId: string,
    title: string,
    assetId: WorkAssetId,
    journeyId?: string,
): Promise<{
    data: WorkQuest | null;
    error: Error | null;
}> {
    const { data, error } = await supabase
        .from("quests")
        .insert({
            user_id: userId,
            journey_id: journeyId ?? null,
            title,
            status: "active",
            asset_id: assetId,
        })
        .select(
            `
                id,
                title,
                status,
                asset_id,
                journey_id,
                sort_order
            `,
        )
        .single();

    if (error) {
        return {
            data: null,
            error,
        };
    }

    const quest: WorkQuest = {
        id: data.id,
        title: data.title,
        status: data.status,
        assetId: data.asset_id as WorkAssetId,
        sortOrder: Number(data.sort_order),
        ...(data.journey_id
            ? {
                  journeyId: data.journey_id,
              }
            : {}),
    };

    return {
        data: quest,
        error: null,
    };
}

export async function createRemoteWorkJourney(
    userId: string,
    title: string,
    assetId: WorkAssetId,
): Promise<{
    data: WorkJourney | null;
    error: Error | null;
}> {
    const { data, error } = await supabase
        .from("journeys")
        .insert({
            user_id: userId,
            title,
            status: "active",
            asset_id: assetId,
        })
        .select(
            `
                id,
                title,
                status,
                asset_id,
                sort_order
            `,
        )
        .single();

    if (error) {
        return {
            data: null,
            error,
        };
    }

    const journey: WorkJourney = {
        id: data.id,
        title: data.title,
        status: data.status,
        assetId: data.asset_id as WorkAssetId,
        sortOrder: Number(data.sort_order),
    };

    return {
        data: journey,
        error: null,
    };
}

export async function updateRemoteWorkQuestJourney(
    questId: string,
    journeyId?: string,
): Promise<{
    data: WorkQuest | null;
    error: Error | null;
}> {
    const { data, error } = await supabase
        .from("quests")
        .update({
            journey_id: journeyId ?? null,
        })
        .eq("id", questId)
        .select(
            `
                id,
                title,
                status,
                asset_id,
                journey_id,
                sort_order
            `,
        )
        .single();

    if (error) {
        return {
            data: null,
            error,
        };
    }

    const quest: WorkQuest = {
        id: data.id,
        title: data.title,
        status: data.status,
        assetId: data.asset_id as WorkAssetId,
        sortOrder: Number(data.sort_order),
        ...(data.journey_id
            ? {
                  journeyId: data.journey_id,
              }
            : {}),
    };

    return {
        data: quest,
        error: null,
    };
}

export async function deleteRemoteWorkJourney(journeyId: string): Promise<{
    error: Error | null;
}> {
    const { error } = await supabase.from("journeys").delete().eq("id", journeyId);

    return {
        error,
    };
}

export async function reorderRemoteWorkJourneys(orderedIds: string[]): Promise<{ error: Error | null }> {
    const { error } = await supabase.rpc("reorder_journeys", {
        p_ordered_ids: orderedIds,
    });

    return { error };
}

export async function reorderRemoteWorkQuests(orderedIds: string[]): Promise<{ error: Error | null }> {
    const { error } = await supabase.rpc("reorder_quests", {
        p_ordered_ids: orderedIds,
    });

    return { error };
}
