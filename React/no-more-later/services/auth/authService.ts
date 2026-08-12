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
