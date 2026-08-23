import { supabase } from "@/lib/supabase";

type FocusRunKind = "quest" | "quick";

type FocusRunResult = {
    tracked: boolean;
    error: Error | null;
};

export async function startRemoteFocusRun(focusSessionId: string, plannedMinutes: number, sessionKind: FocusRunKind): Promise<FocusRunResult> {
    const hasSession = await hasAuthenticatedSession();

    if (!hasSession) {
        return { tracked: false, error: null };
    }

    const { error } = await supabase.rpc("start_focus_session_run", {
        p_focus_session_id: focusSessionId,
        p_planned_minutes: plannedMinutes,
        p_session_kind: sessionKind,
        p_time_zone: getDeviceTimeZone(),
    });

    return { tracked: !error, error: error ? new Error(error.message) : null };
}

export async function pauseRemoteFocusRun(focusSessionId: string): Promise<Error | null> {
    return runFocusLifecycleRpc("pause_focus_session_run", focusSessionId);
}

export async function resumeRemoteFocusRun(focusSessionId: string): Promise<Error | null> {
    return runFocusLifecycleRpc("resume_focus_session_run", focusSessionId);
}

export async function finishRemoteFocusRun(focusSessionId: string): Promise<Error | null> {
    return runFocusLifecycleRpc("finish_focus_session_run", focusSessionId);
}

async function runFocusLifecycleRpc(functionName: "pause_focus_session_run" | "resume_focus_session_run" | "finish_focus_session_run", focusSessionId: string): Promise<Error | null> {
    const { error } = await supabase.rpc(functionName, { p_focus_session_id: focusSessionId });
    return error ? new Error(error.message) : null;
}

async function hasAuthenticatedSession(): Promise<boolean> {
    const { data, error } = await supabase.auth.getSession();
    return !error && Boolean(data.session);
}

function getDeviceTimeZone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
        return "UTC";
    }
}
