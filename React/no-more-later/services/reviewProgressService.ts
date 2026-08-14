import { syncJourneyStatusFromQuests } from "./journeyStatusService";
import { saveQuests } from "./storage/questsStorage";

import type { QuestStatus, SessionOutcome } from "../types/models";
import { getRemoteQuests, updateRemoteQuestProgress } from "./quests/questService";

type UpdateReviewProgressInput = {
    journeyId: string;
    questId: string;
    outcome: SessionOutcome;
    accomplishment: string;
    nextAction: string;
};

export async function updateReviewProgress({ journeyId, questId, outcome, accomplishment, nextAction }: UpdateReviewProgressInput): Promise<void> {
    const updatedQuestStatus: QuestStatus = outcome === "completed" ? "completed" : "active";

    const { error: remoteQuestUpdateError } = await updateRemoteQuestProgress(questId, updatedQuestStatus, accomplishment, nextAction);

    if (remoteQuestUpdateError) {
        throw remoteQuestUpdateError;
    }

    const { data: remoteQuests, error: remoteQuestsError } = await getRemoteQuests(journeyId);

    if (remoteQuestsError || remoteQuests === null) {
        throw remoteQuestsError ?? new Error("Failed to load updated Quests.");
    }

    await saveQuests(journeyId, remoteQuests);

    await syncJourneyStatusFromQuests(journeyId, remoteQuests);
}
