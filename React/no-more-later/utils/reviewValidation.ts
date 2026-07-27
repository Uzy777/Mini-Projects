import type { SessionOutcome } from "../types/models";

type ReviewValidationValues = {
    selectedOutcome: SessionOutcome | null;
    accomplishment: string;
    nextAction: string;
};

export function getReviewValidationMessage({ selectedOutcome, accomplishment, nextAction }: ReviewValidationValues): string | null {
    if (!selectedOutcome) {
        return "Select a session outcome.";
    }

    if (!accomplishment.trim()) {
        return "Describe what you accomplished.";
    }

    if (selectedOutcome !== "completed" && !nextAction.trim()) {
        return "Add a clear next action.";
    }

    return null;
}
