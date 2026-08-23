import { supabase } from "@/lib/supabase";
import { getMyTotalXp } from "@/services/badges/badgeService";

import type { FocusSessionRecord, FocusTimelineEvent, TimerMode } from "@/types/models";

type CompleteBreakSessionInput = {
    focusSessionId: string;
    mode: Exclude<TimerMode, "focus">;
    plannedMinutes: number;
    actualSeconds: number;
    timelineEvents: FocusTimelineEvent[];
};

export async function completeRemoteBreakSession(input: CompleteBreakSessionInput): Promise<{ data: { focusSessionId: string } | null; error: Error | null }> {
    const { data, error } = await supabase.rpc("complete_break_session", {
        p_focus_session_id: input.focusSessionId,
        // Keep the existing database value so this UI consolidation does not require a schema migration.
        p_session_kind: "short_break",
        p_planned_minutes: input.plannedMinutes,
        p_actual_seconds: input.actualSeconds,
        p_timeline_events: input.timelineEvents,
    });

    if (error) return { data: null, error };
    if (!data) return { data: null, error: new Error("The break was saved without returning a session ID.") };

    return { data: { focusSessionId: String(data) }, error: null };
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
                    credited_focus_seconds,
                    base_xp,
                    bonus_xp,
                    xp_version,
                    xp_credit_status,
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
                creditedFocusSeconds: session.credited_focus_seconds,
                baseXp: session.base_xp,
                bonusXp: session.bonus_xp,
                xpVersion: session.xp_version,
                xpCreditStatus: session.xp_credit_status,
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
                credited_focus_seconds,
                base_xp,
                bonus_xp,
                xp_version,
                xp_credit_status,
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
            creditedFocusSeconds: data.credited_focus_seconds,
            baseXp: data.base_xp,
            bonusXp: data.bonus_xp,
            xpVersion: data.xp_version,
            xpCreditStatus: data.xp_credit_status,
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
    const { data: currentSession } = await supabase.auth.getSession();

    if (currentSession.session?.user.id !== userId) {
        return {
            data: null,
            error: new Error("You can only load XP for the signed-in account."),
        };
    }

    return getMyTotalXp();
}
