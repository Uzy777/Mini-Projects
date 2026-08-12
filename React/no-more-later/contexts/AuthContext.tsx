import { createContext, useContext, useEffect, useState } from "react";

import type { ReactNode } from "react";

import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import { getProfile } from "@/services/profile/profileService";
import type { Profile } from "@/types/models";

type AuthContextValue = {
    session: Session | null;
    profile: Profile | null;
    isLoading: boolean;
    isProfileLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isProfileLoading, setIsProfileLoading] = useState(false);

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

    useEffect(() => {
        async function loadProfile() {
            if (!session) {
                setProfile(null);
                setIsProfileLoading(false);

                return;
            }

            setIsProfileLoading(true);

            const { data, error } = await getProfile(session.user.id);

            if (error) {
                console.error("Failed to load profile:", error);

                setProfile(null);
                setIsProfileLoading(false);

                return;
            }

            setProfile(data);
            setIsProfileLoading(false);
        }

        loadProfile();
    }, [session?.user.id]);

    return (
        <AuthContext.Provider
            value={{
                session,
                profile,
                isLoading,
                isProfileLoading,
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
