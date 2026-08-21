import {
    COMPLETION_BONUS_RATE,
    DAILY_CREDITED_FOCUS_SECONDS,
    MINIMUM_XP_FOCUS_SECONDS,
    XP_PER_FOCUSED_MINUTE,
} from "@/constants/xp";
import type { SessionOutcome } from "@/types/models";

export type FocusXpBreakdown = {
    actualFocusedSeconds: number;
    creditedFocusSeconds: number;
    creditedFocusMinutes: number;
    baseXp: number;
    bonusXp: number;
    totalXp: number;
    creditStatus: "credited" | "under_minimum" | "daily_limit";
};

export function calculateFocusXpPreview({
    actualFocusedSeconds,
    outcome,
    dailyCreditedSeconds = 0,
}: {
    actualFocusedSeconds: number;
    outcome: SessionOutcome | null;
    dailyCreditedSeconds?: number;
}): FocusXpBreakdown {
    const safeActualSeconds = Math.max(0, Math.floor(actualFocusedSeconds));
    const safeDailySeconds = Math.min(DAILY_CREDITED_FOCUS_SECONDS, Math.max(0, Math.floor(dailyCreditedSeconds)));

    if (safeActualSeconds < MINIMUM_XP_FOCUS_SECONDS) {
        return emptyBreakdown(safeActualSeconds, "under_minimum");
    }

    const remainingDailySeconds = Math.max(0, DAILY_CREDITED_FOCUS_SECONDS - safeDailySeconds);

    if (remainingDailySeconds === 0) {
        return emptyBreakdown(safeActualSeconds, "daily_limit");
    }

    const creditedFocusSeconds = Math.min(safeActualSeconds, remainingDailySeconds);
    const creditedFocusMinutes = Math.floor(creditedFocusSeconds / 60);
    const baseXp = creditedFocusMinutes * XP_PER_FOCUSED_MINUTE;
    const bonusXp = outcome === "completed" ? Math.floor(baseXp * COMPLETION_BONUS_RATE) : 0;

    return {
        actualFocusedSeconds: safeActualSeconds,
        creditedFocusSeconds,
        creditedFocusMinutes,
        baseXp,
        bonusXp,
        totalXp: baseXp + bonusXp,
        creditStatus: "credited",
    };
}

function emptyBreakdown(actualFocusedSeconds: number, creditStatus: "under_minimum" | "daily_limit"): FocusXpBreakdown {
    return {
        actualFocusedSeconds,
        creditedFocusSeconds: 0,
        creditedFocusMinutes: 0,
        baseXp: 0,
        bonusXp: 0,
        totalXp: 0,
        creditStatus,
    };
}
