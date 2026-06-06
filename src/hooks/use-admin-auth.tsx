import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import type { AuthTokenResponsePassword, Session, User } from "@supabase/supabase-js";
import { getAuthClient } from "@/lib/api/supabase-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdminProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
}

interface AdminAuthContextType {
  session: Session | null;
  user: User | null;
  profile: AdminProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login(email: string, password: string): Promise<AuthTokenResponsePassword>;
  logout(): Promise<void>;
  clearError(): void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  const fetchProfile = useCallback(async (userId: string, accessToken: string) => {
    const auth = getAuthClient();
    const { data, error: profileError } = await auth
      .from("profiles")
      .select("id, username, email, first_name, last_name, role")
      .eq("id", userId)
      .single();

    if (profileError || !data) {
      console.warn("[AdminAuth] Profile fetch error:", profileError);
      return null;
    }

    // Vérifier que l'utilisateur a le rôle ADMIN
    if ((data as Record<string, unknown>).role !== "ADMIN") {
      console.warn("[AdminAuth] User is not an ADMIN:", (data as Record<string, unknown>).role);
      return null;
    }

    const d = data as Record<string, string>;
    return {
      id: d.id,
      email: d.email,
      username: d.username,
      firstName: d.first_name,
      lastName: d.last_name,
    } as AdminProfile;
  }, []);

  // Restaurer la session au montage
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const auth = getAuthClient();

    auth.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      if (existingSession?.user) {
        setSession(existingSession);
        setUser(existingSession.user);
        const p = await fetchProfile(existingSession.user.id, existingSession.access_token);
        if (p) {
          setProfile(p);
        } else {
          // Session invalide (pas admin) → logout
          await auth.auth.signOut();
          setSession(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    });

    // Écouter les changements d'auth
    const { data: { subscription } } = auth.auth.onAuthStateChange(async (event, currentSession) => {
      if (event === "SIGNED_IN" && currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        const p = await fetchProfile(currentSession.user.id, currentSession.access_token);
        if (p) {
          setProfile(p);
          setError(null);
        } else {
          setError("Accès refusé : vous n'avez pas les droits administrateur.");
          await auth.auth.signOut();
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
        setProfile(null);
        setError(null);
      } else if (event === "TOKEN_REFRESHED") {
        // Session maintenue
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    const auth = getAuthClient();
    const result = await auth.auth.signInWithPassword({ email, password });

    if (result.error) {
      setIsLoading(false);
      if (result.error.message === "Invalid login credentials") {
        setError("Email ou mot de passe incorrect.");
      } else {
        setError(result.error.message);
      }
      return result;
    }

    // L'event SIGNED_IN va déclencher le fetch du profile via onAuthStateChange
    // On attend que le profile soit chargé
    if (result.data?.user) {
      const p = await fetchProfile(result.data.user.id, result.data.session?.access_token || "");
      if (p) {
        setProfile(p);
      } else {
        await auth.auth.signOut();
        setError("Accès refusé : vous n'avez pas les droits administrateur.");
      }
    }

    setIsLoading(false);
    return result;
  }, [fetchProfile]);

  const logout = useCallback(async () => {
    const auth = getAuthClient();
    await auth.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AdminAuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        isAuthenticated: !!session && !!profile,
        error,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
