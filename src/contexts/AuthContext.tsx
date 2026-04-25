import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { deleteToken, fetchMe, getStoredToken, login, saveToken } from "@/api/client";
import type { UserProfile } from "@/types";

type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; user: UserProfile; token: string };

type AuthContextValue = {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  // On mount: try to restore session from SecureStore
  useEffect(() => {
    void (async () => {
      try {
        console.log("[AuthProvider] Initializing...");
        const token = await getStoredToken();
        console.log("[AuthProvider] Token retrieved:", !!token);

        if (!token) {
          console.log("[AuthProvider] No token found, user is unauthenticated");
          setState({ status: "unauthenticated" });
          return;
        }

        // Validate token by calling /api/mobile/me
        console.log("[AuthProvider] Validating token with API...");
        const profile = await fetchMe();
        console.log("[AuthProvider] Token validated, user authenticated:", profile);

        setState({
          status: "authenticated",
          user: profile as UserProfile,
          token,
        });
      } catch (error) {
        console.error("[AuthProvider] Error during initialization:", error);
        await deleteToken();
        setState({ status: "unauthenticated" });
      }
    })();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await login(email, password);
    await saveToken(res.token);
    setState({
      status: "authenticated",
      user: res.user as UserProfile,
      token: res.token,
    });
  }, []);

  const signOut = useCallback(async () => {
    await deleteToken();
    setState({ status: "unauthenticated" });
  }, []);

  return (
    <AuthContext.Provider value={{ state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function useUser(): UserProfile {
  const { state } = useAuth();
  if (state.status !== "authenticated") throw new Error("No authenticated user");
  return state.user;
}
