type ActualFocusedSecondsInput = {
    selectedMinutes: number;
    remainingSeconds: number | null;
    isRunning: boolean;
    endTime: number | null;
};

export function getRemainingSecondsFromEndTime(endTime: number): number {
    return Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
}

export function calculateActualFocusedSeconds({ selectedMinutes, remainingSeconds, isRunning, endTime }: ActualFocusedSecondsInput): number {
    const plannedSeconds = selectedMinutes * 60;

    const currentRemainingSeconds = isRunning && endTime !== null ? getRemainingSecondsFromEndTime(endTime) : (remainingSeconds ?? plannedSeconds);

    return Math.max(0, plannedSeconds - currentRemainingSeconds);
}
