import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { deleteToken, fetchMe, getStoredToken, login, saveToken } from "@/api/client";
import type { UserProfile } from "@/types";

type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; user: UserProfile; token: string }
  | { status: "error"; error: Error };

type AuthContextValue = {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  console.log("[AuthProvider] render — status:", state.status);

  useEffect(() => {
    console.log("[AuthProvider] useEffect started");

    void (async () => {
      try {
        console.log("[AuthProvider] Initializing...");
        const token = await getStoredToken();
        console.log("[AuthProvider] Token retrieved:", !!token, token ? "(has value)" : "(null)");

        if (!token) {
          console.log("[AuthProvider] No token → unauthenticated");
          setState({ status: "unauthenticated" });
          return;
        }

        console.log("[AuthProvider] Token found → calling fetchMe()...");
        const profile = await fetchMe();
        console.log("[AuthProvider] fetchMe() success:", JSON.stringify(profile));

        setState({ status: "authenticated", user: profile as UserProfile, token });
        console.log("[AuthProvider] State → authenticated");
      } catch (error) {
        console.error("[AuthProvider] Error:", String(error));
        console.error("[AuthProvider] Error stack:", error instanceof Error ? error.stack : "no stack");
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ status: "error", error: err });
        console.log("[AuthProvider] State → error:", err.message);
        await deleteToken();
        console.log("[AuthProvider] Token deleted after error");
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
