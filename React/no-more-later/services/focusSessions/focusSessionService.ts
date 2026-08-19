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
            journey_id: session.journeyId ?? null,
            quest_id: session.questId ?? null,
            quest_title: session.questTitle,
            session_kind: session.sessionKind ?? "quest",
            planned_minutes: session.plannedMinutes,
            actual_seconds: session.actualSeconds ?? null,
            outcome: session.outcome,
            accomplishment: session.accomplishment,
            next_action: session.nextAction,
            earned_xp: session.earnedXp,
            completed_at: session.completedAt,
            timeline_events: session.timelineEvents ?? [],
        })
        .select(
            `
                id,
                journey_id,
                quest_id,
                quest_title,
                session_kind,
                planned_minutes,
                actual_seconds,
                outcome,
                accomplishment,
                next_action,
                earned_xp,
                completed_at,
                timeline_events
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
        journeyId: data.journey_id ?? undefined,
        questId: data.quest_id ?? undefined,
        questTitle: data.quest_title,
        sessionKind: data.session_kind,
        plannedMinutes: data.planned_minutes,
        actualSeconds: data.actual_seconds ?? undefined,
        outcome: data.outcome,
        accomplishment: data.accomplishment,
        nextAction: data.next_action,
        earnedXp: data.earned_xp,
        completedAt: data.completed_at,
        timelineEvents: Array.isArray(data.timeline_events) ? data.timeline_events : [],
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
    const pageSize = 1000;
    const focusSessions: FocusSessionRecord[] = [];
    let offset = 0;

    while (true) {
        const { data, error } = await supabase
            .from("focus_sessions")
            .select(
                `
                    id,
                    journey_id,
                    quest_id,
                    quest_title,
                    session_kind,
                    planned_minutes,
                    actual_seconds,
                    outcome,
                    accomplishment,
                    next_action,
                    earned_xp,
                    completed_at,
                    timeline_events
                `,
            )
            .eq("user_id", userId)
            .order("completed_at", {
                ascending: false,
            })
            .range(offset, offset + pageSize - 1);

        if (error) {
            return {
                data: null,
                error,
            };
        }

        focusSessions.push(
            ...data.map((session) => ({
                id: session.id,
                journeyId: session.journey_id ?? undefined,
                questId: session.quest_id ?? undefined,
                questTitle: session.quest_title,
                sessionKind: session.session_kind,
                plannedMinutes: session.planned_minutes,
                actualSeconds: session.actual_seconds ?? undefined,
                outcome: session.outcome,
                accomplishment: session.accomplishment,
                nextAction: session.next_action,
                earnedXp: session.earned_xp,
                completedAt: session.completed_at,
                timelineEvents: Array.isArray(session.timeline_events) ? session.timeline_events : [],
            })),
        );

        if (data.length < pageSize) {
            break;
        }

        offset += pageSize;
    }

    return {
        data: focusSessions,
        error: null,
    };
}

export async function getRemoteFocusSession(
    userId: string,
    focusSessionId: string,
): Promise<{
    data: FocusSessionRecord | null;
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
                session_kind,
                planned_minutes,
                actual_seconds,
                outcome,
                accomplishment,
                next_action,
                earned_xp,
                completed_at,
                timeline_events
            `,
        )
        .eq("user_id", userId)
        .eq("id", focusSessionId)
        .maybeSingle();

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

    return {
        data: {
            id: data.id,
            journeyId: data.journey_id ?? undefined,
            questId: data.quest_id ?? undefined,
            questTitle: data.quest_title,
            sessionKind: data.session_kind,
            plannedMinutes: data.planned_minutes,
            actualSeconds: data.actual_seconds ?? undefined,
            outcome: data.outcome,
            accomplishment: data.accomplishment,
            nextAction: data.next_action,
            earnedXp: data.earned_xp,
            completedAt: data.completed_at,
            timelineEvents: Array.isArray(data.timeline_events) ? data.timeline_events : [],
        },
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
