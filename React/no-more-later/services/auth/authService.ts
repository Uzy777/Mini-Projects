import { supabase } from "@/lib/supabase";

export async function signUpWithEmail(email: string, password: string) {
    return await supabase.auth.signUp({ email, password });
}

export async function signInWithEmail(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
}
