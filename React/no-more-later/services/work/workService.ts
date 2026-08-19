import { supabase } from "@/lib/supabase";

import type { WorkAssetId, WorkFolder, WorkJourney, WorkQuest } from "@/types/work";

export async function getRemoteWorkFolders(userId: string): Promise<{ data: WorkFolder[] | null; error: Error | null }> {
    const { data, error } = await supabase
        .from("work_folders")
        .select("id, title")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

    if (error) return { data: null, error };

    return { data: data.map((folder) => ({ id: folder.id, title: folder.title })), error: null };
}

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
                folder_id
            `,
        )
        .eq("user_id", userId)
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
        ...(journey.folder_id ? { folderId: journey.folder_id } : {}),
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
                folder_id
            `,
        )
        .eq("user_id", userId)
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
        ...(quest.journey_id
            ? {
                  journeyId: quest.journey_id,
              }
            : {}),
        ...(quest.folder_id ? { folderId: quest.folder_id } : {}),
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
    folderId?: string,
): Promise<{
    data: WorkQuest | null;
    error: Error | null;
}> {
    const { data, error } = await supabase
        .from("quests")
        .insert({
            user_id: userId,
            journey_id: journeyId ?? null,
            folder_id: folderId ?? null,
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
                folder_id
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
        ...(data.journey_id
            ? {
                  journeyId: data.journey_id,
              }
            : {}),
        ...(data.folder_id ? { folderId: data.folder_id } : {}),
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
    folderId?: string,
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
            folder_id: folderId ?? null,
        })
        .select(
            `
                id,
                title,
                status,
                asset_id,
                folder_id
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
        ...(data.folder_id ? { folderId: data.folder_id } : {}),
    };

    return {
        data: journey,
        error: null,
    };
}

export async function createRemoteWorkFolder(
    userId: string,
    title: string,
): Promise<{ data: WorkFolder | null; error: Error | null }> {
    const { data, error } = await supabase
        .from("work_folders")
        .insert({ user_id: userId, title })
        .select("id, title")
        .single();

    if (error) return { data: null, error };
    return { data: { id: data.id, title: data.title }, error: null };
}

export async function updateRemoteWorkProjectFolder(
    projectId: string,
    folderId?: string,
): Promise<{ data: WorkJourney | null; error: Error | null }> {
    const { data, error } = await supabase
        .from("journeys")
        .update({ folder_id: folderId ?? null })
        .eq("id", projectId)
        .select("id, title, status, asset_id, folder_id")
        .single();

    if (error) return { data: null, error };

    return {
        data: {
            id: data.id,
            title: data.title,
            status: data.status,
            assetId: data.asset_id as WorkAssetId,
            ...(data.folder_id ? { folderId: data.folder_id } : {}),
        },
        error: null,
    };
}

export async function deleteRemoteWorkFolder(folderId: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.from("work_folders").delete().eq("id", folderId);
    return { error };
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
            folder_id: null,
        })
        .eq("id", questId)
        .select(
            `
                id,
                title,
                status,
                asset_id,
                journey_id,
                folder_id
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
        ...(data.journey_id
            ? {
                  journeyId: data.journey_id,
              }
            : {}),
        ...(data.folder_id ? { folderId: data.folder_id } : {}),
    };

    return {
        data: quest,
        error: null,
    };
}

export async function updateRemoteWorkTaskLocation(
    taskId: string,
    location?: { kind: "folder" | "project"; id: string },
): Promise<{ data: WorkQuest | null; error: Error | null }> {
    const { data, error } = await supabase
        .from("quests")
        .update({
            journey_id: location?.kind === "project" ? location.id : null,
            folder_id: location?.kind === "folder" ? location.id : null,
        })
        .eq("id", taskId)
        .select("id, title, status, asset_id, journey_id, folder_id")
        .single();

    if (error) return { data: null, error };

    return {
        data: {
            id: data.id,
            title: data.title,
            status: data.status,
            assetId: data.asset_id as WorkAssetId,
            ...(data.journey_id ? { journeyId: data.journey_id } : {}),
            ...(data.folder_id ? { folderId: data.folder_id } : {}),
        },
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
