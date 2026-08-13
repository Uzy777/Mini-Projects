import { supabase } from "@/lib/supabase";

import type { Quest, QuestStatus } from "@/types/models";

export async function getRemoteQuests(journeyId: string): Promise<{
    data: Quest[] | null;
    error: Error | null;
}> {
    const { data, error } = await supabase
        .from("quests")
        .select(
            `
                id,
                title,
                status,
                done_when,
                next_action,
                last_accomplishment
            `,
        )
        .eq("journey_id", journeyId)
        .order("created_at", {
            ascending: true,
        });

    if (error) {
        return {
            data: null,
            error,
        };
    }

    const quests: Quest[] = data.map((quest) => ({
        id: quest.id,
        title: quest.title,
        status: quest.status,
        doneWhen: quest.done_when ?? undefined,
        nextAction: quest.next_action ?? undefined,
        lastAccomplishment: quest.last_accomplishment ?? undefined,
    }));

    return {
        data: quests,
        error: null,
    };
}

export async function createRemoteQuest(
    journeyId: string,
    title: string,
    doneWhen?: string,
): Promise<{
    data: Quest | null;
    error: Error | null;
}> {
    const { data, error } = await supabase
        .from("quests")
        .insert({
            journey_id: journeyId,
            title,
            status: "active",
            done_when: doneWhen || null,
        })
        .select(
            `
                id,
                title,
                status,
                done_when,
                next_action,
                last_accomplishment
            `,
        )
        .single();

    if (error) {
        return {
            data: null,
            error,
        };
    }

    const quest: Quest = {
        id: data.id,
        title: data.title,
        status: data.status,
        doneWhen: data.done_when ?? undefined,
        nextAction: data.next_action ?? undefined,
        lastAccomplishment: data.last_accomplishment ?? undefined,
    };

    return {
        data: quest,
        error: null,
    };
}

export async function deleteRemoteQuest(questId: string): Promise<{
    error: Error | null;
}> {
    const { error } = await supabase.from("quests").delete().eq("id", questId);

    return {
        error,
    };
}

export async function updateRemoteQuestProgress(
    questId: string,
    status: QuestStatus,
    accomplishment: string,
    nextAction: string,
): Promise<{
    data: Quest | null;
    error: Error | null;
}> {
    const { data, error } = await supabase
        .from("quests")
        .update({
            status,
            last_accomplishment: accomplishment || null,
            next_action: status === "completed" ? null : nextAction || null,
        })
        .eq("id", questId)
        .select(
            `
                id,
                title,
                status,
                done_when,
                next_action,
                last_accomplishment
            `,
        )
        .single();

    if (error) {
        return {
            data: null,
            error,
        };
    }

    const quest: Quest = {
        id: data.id,
        title: data.title,
        status: data.status,
        doneWhen: data.done_when ?? undefined,
        nextAction: data.next_action ?? undefined,
        lastAccomplishment: data.last_accomplishment ?? undefined,
    };

    return {
        data: quest,
        error: null,
    };
}

export async function updateRemoteQuestStatus(
    questId: string,
    status: QuestStatus,
): Promise<{
    data: Quest | null;
    error: Error | null;
}> {
    const { data, error } = await supabase
        .from("quests")
        .update({
            status,
        })
        .eq("id", questId)
        .select(
            `
                id,
                title,
                status,
                done_when,
                next_action,
                last_accomplishment
            `,
        )
        .single();

    if (error) {
        return {
            data: null,
            error,
        };
    }

    const quest: Quest = {
        id: data.id,
        title: data.title,
        status: data.status,
        doneWhen: data.done_when ?? undefined,
        nextAction: data.next_action ?? undefined,
        lastAccomplishment: data.last_accomplishment ?? undefined,
    };

    return {
        data: quest,
        error: null,
    };
}
