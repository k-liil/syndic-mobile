import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  deleteToken,
  deleteOrgId,
  fetchMe,
  fetchOrganizations,
  getStoredToken,
  getStoredOrgId,
  login,
  saveToken,
  saveOrgId,
  setSelectedOrgId,
} from "@/api/client";
import type { OrgInfo, UserProfile } from "@/types";

type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; user: UserProfile; token: string; selectedOrg: OrgInfo | null; orgs: OrgInfo[] }
  | { status: "error"; error: Error };

type AuthContextValue = {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  selectOrg: (org: OrgInfo) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  console.log("[AuthProvider] render — status:", state.status);

  useEffect(() => {
    console.log("[AuthProvider] useEffect started");

    void (async () => {
      try {
        const token = await getStoredToken();
        console.log("[AuthProvider] Token retrieved:", !!token);

        if (!token) {
          setState({ status: "unauthenticated" });
          return;
        }

        const [profile, storedOrgId] = await Promise.all([
          fetchMe(),
          getStoredOrgId(),
        ]);
        console.log("[AuthProvider] fetchMe() success:", JSON.stringify(profile));

        const orgs = await fetchOrganizations();
        console.log("[AuthProvider] orgs count:", orgs.length);

        let selectedOrg: OrgInfo | null = null;

        if (orgs.length === 1) {
          selectedOrg = orgs[0];
        } else if (storedOrgId) {
          selectedOrg = orgs.find((o) => o.id === storedOrgId) ?? null;
        }

        if (selectedOrg) {
          setSelectedOrgId(selectedOrg.id);
        }

        setState({
          status: "authenticated",
          user: profile as UserProfile,
          token,
          selectedOrg,
          orgs,
        });
        console.log("[AuthProvider] State → authenticated, selectedOrg:", selectedOrg?.name ?? "none");
      } catch (error) {
        console.error("[AuthProvider] Error:", String(error));
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ status: "error", error: err });
        await deleteToken();
        await deleteOrgId();
      }
    })();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await login(email, password);
    await saveToken(res.token);

    const orgs = await fetchOrganizations();

    let selectedOrg: OrgInfo | null = null;
    if (orgs.length === 1) {
      selectedOrg = orgs[0];
      await saveOrgId(orgs[0].id);
    }

    if (selectedOrg) setSelectedOrgId(selectedOrg.id);

    setState({
      status: "authenticated",
      user: res.user as UserProfile,
      token: res.token,
      selectedOrg,
      orgs,
    });
  }, []);

  const signOut = useCallback(async () => {
    await deleteToken();
    await deleteOrgId();
    setSelectedOrgId(null);
    setState({ status: "unauthenticated" });
  }, []);

  const selectOrg = useCallback(async (org: OrgInfo) => {
    await saveOrgId(org.id);
    setSelectedOrgId(org.id);
    setState((prev) => {
      if (prev.status !== "authenticated") return prev;
      return { ...prev, selectedOrg: org };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ state, signIn, signOut, selectOrg }}>
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
