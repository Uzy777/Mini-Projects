import type { SessionOutcome } from "../types/models";

export function calculateSessionXp(plannedMinutes: number, outcome: SessionOutcome, nextAction: string): number {
    let totalXp = 0;

    if (outcome !== "stopped") {
        if (plannedMinutes === 15) {
            totalXp += 20;
        } else if (plannedMinutes === 25) {
            totalXp += 40;
        } else if (plannedMinutes === 50) {
            totalXp += 70;
        }
    }

    // Completing the Review.
    totalXp += 10;

    // Completing the Quest.
    if (outcome === "completed") {
        totalXp += 20;
    }

    // Setting a next action.
    if (outcome !== "completed" && nextAction.trim()) {
        totalXp += 10;
    }

    return totalXp;
}
