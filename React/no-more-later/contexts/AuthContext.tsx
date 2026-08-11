import { createContext, useContext, useEffect, useState } from "react";

import type { ReactNode } from "react";

import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

type AuthContextValue = {
    session: Session | null;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [session, setSession] = useState<Session | null>(null);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadSession() {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            setSession(session);
            setIsLoading(false);
        }

        loadSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                session,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}
