import { supabase } from "@/lib/supabase";

import type { QuestFocusSummary, SessionOutcome } from "@/types/models";

type FocusSummaryRow = {
    id: string;
    quest_id: string;
    planned_minutes: number;
    actual_seconds: number | null;
    outcome: SessionOutcome;
    completed_at: string;
};

export async function getQuestFocusSummaries(questIds: string[]): Promise<{
    data: Map<string, QuestFocusSummary> | null;
    error: Error | null;
}> {
    const uniqueQuestIds = [...new Set(questIds.filter(Boolean))];
    const summaries = new Map<string, QuestFocusSummary>();

    if (uniqueQuestIds.length === 0) return { data: summaries, error: null };

    const pageSize = 1000;
    let offset = 0;

    while (true) {
        const { data, error } = await supabase
            .from("focus_sessions")
            .select("id, quest_id, planned_minutes, actual_seconds, outcome, completed_at")
            .in("quest_id", uniqueQuestIds)
            .order("completed_at", { ascending: false })
            .order("id", { ascending: false })
            .range(offset, offset + pageSize - 1);

        if (error) return { data: null, error };

        (data as FocusSummaryRow[]).forEach((session) => {
            const focusedSeconds = Math.max(0, Number(session.actual_seconds ?? session.planned_minutes * 60));
            const current = summaries.get(session.quest_id);

            summaries.set(session.quest_id, {
                sessionCount: (current?.sessionCount ?? 0) + 1,
                totalFocusedSeconds: (current?.totalFocusedSeconds ?? 0) + focusedSeconds,
                lastOutcome: current?.lastOutcome ?? session.outcome,
                lastSessionFocusedSeconds: current?.lastSessionFocusedSeconds ?? focusedSeconds,
                lastFocusedAt: current?.lastFocusedAt ?? session.completed_at,
            });
        });

        if (data.length < pageSize) break;
        offset += pageSize;
    }

    return { data: summaries, error: null };
}

export async function getQuestFocusSummary(questId: string): Promise<{
    data: QuestFocusSummary | null;
    error: Error | null;
}> {
    const result = await getQuestFocusSummaries([questId]);
    return {
        data: result.data?.get(questId) ?? null,
        error: result.error,
    };
}
