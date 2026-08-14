import { supabase } from "@/lib/supabase";

import type { CreateFocusSessionInput, FocusSessionRecord } from "@/types/models";

export async function createRemoteFocusSession(
    userId: string,
    session: CreateFocusSessionInput,
): Promise<{
    data: FocusSessionRecord | null;
    error: Error | null;
}> {
    const { data, error } = await supabase
        .from("focus_sessions")
        .insert({
            user_id: userId,
            journey_id: session.journeyId,
            quest_id: session.questId,
            quest_title: session.questTitle,
            planned_minutes: session.plannedMinutes,
            actual_seconds: session.actualSeconds ?? null,
            outcome: session.outcome,
            accomplishment: session.accomplishment,
            next_action: session.nextAction,
            earned_xp: session.earnedXp,
            completed_at: session.completedAt,
        })
        .select(
            `
                id,
                journey_id,
                quest_id,
                quest_title,
                planned_minutes,
                actual_seconds,
                outcome,
                accomplishment,
                next_action,
                earned_xp,
                completed_at
            `,
        )
        .single();

    if (error) {
        return {
            data: null,
            error,
        };
    }

    const focusSession: FocusSessionRecord = {
        id: data.id,
        journeyId: data.journey_id,
        questId: data.quest_id,
        questTitle: data.quest_title,
        plannedMinutes: data.planned_minutes,
        actualSeconds: data.actual_seconds ?? undefined,
        outcome: data.outcome,
        accomplishment: data.accomplishment,
        nextAction: data.next_action,
        earnedXp: data.earned_xp,
        completedAt: data.completed_at,
    };

    return {
        data: focusSession,
        error: null,
    };
}

export async function getRemoteFocusSessions(userId: string): Promise<{
    data: FocusSessionRecord[] | null;
    error: Error | null;
}> {
    const { data, error } = await supabase
        .from("focus_sessions")
        .select(
            `
                id,
                journey_id,
                quest_id,
                quest_title,
                planned_minutes,
                actual_seconds,
                outcome,
                accomplishment,
                next_action,
                earned_xp,
                completed_at
            `,
        )
        .eq("user_id", userId)
        .order("completed_at", {
            ascending: false,
        });

    if (error) {
        return {
            data: null,
            error,
        };
    }

    const focusSessions: FocusSessionRecord[] = data.map((session) => ({
        id: session.id,
        journeyId: session.journey_id,
        questId: session.quest_id,
        questTitle: session.quest_title,
        plannedMinutes: session.planned_minutes,
        actualSeconds: session.actual_seconds ?? undefined,
        outcome: session.outcome,
        accomplishment: session.accomplishment,
        nextAction: session.next_action,
        earnedXp: session.earned_xp,
        completedAt: session.completed_at,
    }));

    return {
        data: focusSessions,
        error: null,
    };
}

export async function getRemoteTotalXp(userId: string): Promise<{
    data: number | null;
    error: Error | null;
}> {
    const { data, error } = await supabase.from("focus_sessions").select("earned_xp").eq("user_id", userId);

    if (error) {
        return {
            data: null,
            error,
        };
    }

    const totalXp = data.reduce((total, session) => total + session.earned_xp, 0);

    return {
        data: totalXp,
        error: null,
    };
}
