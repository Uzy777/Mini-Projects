import { getJourneys, saveJourneys } from "./storage/journeysStorage";

import { getQuests, saveQuests } from "./storage/questsStorage";

import type { Journey, JourneyStatus, Quest, QuestStatus, SessionOutcome } from "../types/models";

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

    const allQuestsCompleted = updatedQuests.length > 0 && updatedQuests.every((quest) => quest.status === "completed");

    const currentJourneys = await getJourneys();

    const updatedJourneyStatus: JourneyStatus = allQuestsCompleted ? "completed" : "active";

    const updatedJourneys = currentJourneys.map((journey): Journey => {
        if (journey.id !== journeyId) {
            return journey;
        }

        return {
            ...journey,
            status: updatedJourneyStatus,
        };
    });

    await saveJourneys(updatedJourneys);
}
