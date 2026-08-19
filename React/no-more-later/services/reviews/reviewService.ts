import { supabase } from "@/lib/supabase";

import type { FocusTimelineEvent, SessionOutcome } from "@/types/models";

type CompleteRemoteReviewInput = {
    focusSessionId: string;
    journeyId?: string;
    questId?: string;
    plannedMinutes: number;
    actualSeconds: number;
    outcome: SessionOutcome;
    accomplishment: string;
    nextAction: string;
    timelineEvents: FocusTimelineEvent[];
};

type CompleteRemoteReviewResult = {
    focusSessionId: string;
    questTitle: string;
    earnedXp: number;
    totalXp: number;
    journeyStatus: "active" | "completed" | null;
};

export async function completeRemoteReview(input: CompleteRemoteReviewInput): Promise<{
    data: CompleteRemoteReviewResult | null;
    error: Error | null;
}> {
    const commonParameters = {
        p_focus_session_id: input.focusSessionId,
        p_planned_minutes: input.plannedMinutes,
        p_actual_seconds: input.actualSeconds,
        p_outcome: input.outcome,
        p_accomplishment: input.accomplishment,
        p_next_action: input.nextAction,
        p_timeline_events: input.timelineEvents,
    };
    const { data, error } = input.questId
        ? await supabase.rpc("complete_review", {
              ...commonParameters,
              p_journey_id: input.journeyId ?? null,
              p_quest_id: input.questId,
          })
        : await supabase.rpc("complete_quick_focus_review", commonParameters);

    if (error) {
        return {
            data: null,
            error,
        };
    }

    const result = data?.[0];

    if (!result) {
        return {
            data: null,
            error: new Error("Review completed without returning a result."),
        };
    }

    return {
        data: {
            focusSessionId: result.focus_session_id,
            questTitle: result.quest_title,
            earnedXp: Number(result.earned_xp),
            totalXp: Number(result.total_xp),
            journeyStatus: result.journey_status,
        },
        error: null,
    };
}
