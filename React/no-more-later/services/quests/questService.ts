import { supabase } from "@/lib/supabase";

import { getQuestFocusSummaries } from "@/services/focusSessions/questFocusSummaryService";
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

    const focusSummaryResult = await getQuestFocusSummaries(data.map((quest) => quest.id));
    const focusSummaries = focusSummaryResult.data ?? new Map();
    if (focusSummaryResult.error) console.warn("Quest Focus progress could not be loaded:", focusSummaryResult.error);

    const quests: Quest[] = data.map((quest) => ({
        id: quest.id,
        title: quest.title,
        status: quest.status,
        doneWhen: quest.done_when ?? undefined,
        nextAction: quest.next_action ?? undefined,
        lastAccomplishment: quest.last_accomplishment ?? undefined,
        ...(focusSummaries.get(quest.id) ? { focusSummary: focusSummaries.get(quest.id) } : {}),
    }));

    return {
        data: quests,
        error: null,
    };
}

export async function getRemoteQuest(
    journeyId: string | undefined,
    questId: string,
): Promise<{
    data: Quest | null;
    error: Error | null;
}> {
    let query = supabase
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
        .eq("id", questId);

    if (journeyId) {
        query = query.eq("journey_id", journeyId);
    } else {
        query = query.is("journey_id", null);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
        return {
            data: null,
            error,
        };
    }

    if (!data) {
        return {
            data: null,
            error: null,
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

export async function createRemoteQuest(
    userId: string,
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
            user_id: userId,
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
