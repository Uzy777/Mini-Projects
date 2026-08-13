import { syncJourneyStatusFromQuests } from "./journeyStatusService";
import { getQuests, saveQuests } from "./storage/questsStorage";

import type { Quest, QuestStatus, SessionOutcome } from "../types/models";

type UpdateReviewProgressInput = {
    journeyId: string;
    questId: string;
    outcome: SessionOutcome;
    accomplishment: string;
    nextAction: string;
};

export async function updateReviewProgress({ journeyId, questId, outcome, accomplishment, nextAction }: UpdateReviewProgressInput): Promise<void> {
    const currentQuests = await getQuests(journeyId);

    const updatedQuestStatus: QuestStatus = outcome === "completed" ? "completed" : "active";

    const updatedQuests = currentQuests.map((quest): Quest => {
        if (quest.id !== questId) {
            return quest;
        }

        return {
            ...quest,
            status: updatedQuestStatus,
            lastAccomplishment: accomplishment,
            nextAction: outcome === "completed" ? "" : nextAction,
        };
    });

    await saveQuests(journeyId, updatedQuests);

    await syncJourneyStatusFromQuests(journeyId, updatedQuests);
}
