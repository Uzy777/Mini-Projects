import type { SessionOutcome } from "../types/models";

export function calculateSessionXp(plannedMinutes: number, outcome: SessionOutcome, nextAction: string): number {
    let totalXp = 0;

    if (outcome !== "stopped") {
        if (plannedMinutes === 15) {
            totalXp += 5;
        } else if (plannedMinutes === 25) {
            totalXp += 10;
        } else if (plannedMinutes === 50) {
            totalXp += 20;
        }
    }

    // Completing the Review.
    totalXp += 5;

    if (outcome === "completed") {
        totalXp += 10;
    }

    if (outcome !== "completed" && nextAction.trim()) {
        totalXp += 5;
    }

    return totalXp;
}
