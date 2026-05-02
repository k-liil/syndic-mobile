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
import { useRouter } from "expo-router";
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
  const router = useRouter();
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

        let orgs = await fetchOrganizations().catch((e) => {
          console.warn("[AuthProvider] fetchOrganizations failed:", e);
          return [] as { id: string; name: string; logoUrl: string | null }[];
        });
        console.log("[AuthProvider] orgs count:", orgs.length);

        if (orgs.length === 0) {
          const p = profile as { organizationId?: string; organizationName?: string; orgLogoUrl?: string | null };
          if (p.organizationId && p.organizationName) {
            orgs = [{ id: p.organizationId, name: p.organizationName, logoUrl: p.orgLogoUrl ?? null }];
          }
        }

        let selectedOrg: OrgInfo | null = null;

        if (orgs.length === 1) {
          selectedOrg = orgs[0];
        } else if (storedOrgId) {
          selectedOrg = orgs.find((o) => o.id === storedOrgId) ?? null;
        }

        // Only propagate orgId for multi-org users — single-org resolves from JWT
        if (orgs.length > 1 && selectedOrg) {
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

    let orgs = await fetchOrganizations().catch((e) => {
      console.warn("[signIn] fetchOrganizations failed:", e);
      return [] as { id: string; name: string; logoUrl: string | null }[];
    });

    if (orgs.length === 0) {
      const u = res.user as { organizationId?: string; organizationName?: string; orgLogoUrl?: string | null };
      if (u.organizationId && u.organizationName) {
        orgs = [{ id: u.organizationId, name: u.organizationName, logoUrl: u.orgLogoUrl ?? null }];
      }
    }

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
    // Explicitly navigate to login to avoid white screen
    router.replace("/login");
  }, [router]);

  const selectOrg = useCallback(async (org: OrgInfo) => {
    console.log("[AuthContext] selectOrg called with org:", org.id, org.name);
    try {
      console.log("[AuthContext] Saving org ID to storage:", org.id);
      await saveOrgId(org.id);
      console.log("[AuthContext] Org ID saved successfully");

      console.log("[AuthContext] Updating API client with selected org ID:", org.id);
      setSelectedOrgId(org.id);
      console.log("[AuthContext] API client updated");

      console.log("[AuthContext] Updating React state with org:", org.name);
      setState((prev) => {
        console.log("[AuthContext] setState callback - prev status:", prev.status);
        if (prev.status !== "authenticated") {
          console.warn("[AuthContext] Not authenticated, cannot select org");
          return prev;
        }
        console.log("[AuthContext] Creating new state with selectedOrg:", org.name, org.id);
        const newState = { ...prev, selectedOrg: org };
        console.log("[AuthContext] State updated. New selectedOrg:", newState.selectedOrg?.name, newState.selectedOrg?.id);
        return newState;
      });
      console.log("[AuthContext] selectOrg completed successfully");
    } catch (error) {
      console.error("[AuthContext] selectOrg failed with error:", error);
    }
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
