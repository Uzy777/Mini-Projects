import { updateRemoteJourneyStatus } from "./journeys/journeyService";
import { getJourneys, saveJourneys } from "./storage/journeysStorage";

import type { Journey, JourneyStatus, Quest } from "../types/models";

export async function syncJourneyStatusFromQuests(journeyId: string, quests: Quest[]): Promise<JourneyStatus> {
    const allQuestsCompleted = quests.length > 0 && quests.every((quest) => quest.status === "completed");

    const updatedJourneyStatus: JourneyStatus = allQuestsCompleted ? "completed" : "active";

    const { error: remoteUpdateError } = await updateRemoteJourneyStatus(journeyId, updatedJourneyStatus);

    if (remoteUpdateError) {
        throw remoteUpdateError;
    }

    const currentJourneys = await getJourneys();

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

    return updatedJourneyStatus;
}
