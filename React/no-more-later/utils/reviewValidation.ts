import type { SessionOutcome } from "../types/models";

type ReviewValidationValues = {
    selectedOutcome: SessionOutcome | null;
    accomplishment: string;
};

export function getReviewValidationMessage({ selectedOutcome, accomplishment }: ReviewValidationValues): string | null {
    if (!selectedOutcome) {
        return "Select a session outcome.";
    }

    if (selectedOutcome !== "stopped" && !accomplishment.trim()) {
        return "Describe what you accomplished.";
    }

    return null;
}
