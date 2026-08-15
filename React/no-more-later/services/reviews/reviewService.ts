import { supabase } from "@/lib/supabase";

import type { SessionOutcome } from "@/types/models";

type CompleteRemoteReviewInput = {
    journeyId: string;
    questId: string;
    plannedMinutes: number;
    actualSeconds: number;
    outcome: SessionOutcome;
    accomplishment: string;
    nextAction: string;
    earnedXp: number;
};

type CompleteRemoteReviewResult = {
    focusSessionId: string;
    questTitle: string;
    totalXp: number;
    journeyStatus: "active" | "completed";
};

export async function completeRemoteReview(input: CompleteRemoteReviewInput): Promise<{
    data: CompleteRemoteReviewResult | null;
    error: Error | null;
}> {
    const { data, error } = await supabase.rpc("complete_review", {
        p_journey_id: input.journeyId,
        p_quest_id: input.questId,
        p_planned_minutes: input.plannedMinutes,
        p_actual_seconds: input.actualSeconds,
        p_outcome: input.outcome,
        p_accomplishment: input.accomplishment,
        p_next_action: input.nextAction,
        p_earned_xp: input.earnedXp,
    });

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
            totalXp: Number(result.total_xp),
            journeyStatus: result.journey_status,
        },
        error: null,
    };
}
