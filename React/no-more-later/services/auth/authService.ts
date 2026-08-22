import { supabase } from "@/lib/supabase";

export async function signUpWithEmail(email: string, password: string, displayName: string) {
    return await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } });
}

export async function signInWithEmail(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
    return await supabase.auth.signOut({ scope: "local" });
}

type DeleteAccountResponse = {
    success?: boolean;
    error?: string;
};

export async function deleteAccount() {
    const {
        data: { session },
        error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
        return {
            error: sessionError ?? new Error("You need to sign in again before deleting your account."),
        };
    }

    const { data, error } = await supabase.functions.invoke<DeleteAccountResponse>("delete-account", {
        body: {},
    });

    if (error) {
        return { error };
    }

    if (!data?.success) {
        return {
            error: new Error(data?.error ?? "The account could not be deleted."),
        };
    }

    return { error: null };
}
