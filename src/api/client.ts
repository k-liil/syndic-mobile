import * as SecureStore from "expo-secure-store";
import { z } from "zod";
import { 
  UserProfileSchema, 
  OrganizationSchema, 
  ClaimSchema, 
  DashboardSchema,
  type UserProfile,
  type Organization,
  type Claim,
  type DashboardData
} from "./schemas";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
const TOKEN_KEY = "syndic_token";
const ORG_KEY = "syndic_org_id";

console.log("[API Client] BASE_URL:", BASE_URL || "(EMPTY - check EXPO_PUBLIC_API_URL)");

// ─── Token & org storage ─────────────────────────────────────────────────────

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function deleteToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function saveOrgId(orgId: string) {
  await SecureStore.setItemAsync(ORG_KEY, orgId);
  _selectedOrgId = orgId;
}

export async function getStoredOrgId(): Promise<string | null> {
  return SecureStore.getItemAsync(ORG_KEY);
}

export async function deleteOrgId() {
  await SecureStore.deleteItemAsync(ORG_KEY);
  _selectedOrgId = null;
}

// Module-level selected org injected into all requests
let _selectedOrgId: string | null = null;

export function setSelectedOrgId(id: string | null) {
  const prev = _selectedOrgId;
  _selectedOrgId = id;
  console.log("[API Client] setSelectedOrgId:", prev, "→", id);
}

// ─── HTTP helpers ────────────────────────────────────────────────────────────

async function buildHeaders(): Promise<Record<string, string>> {
  const token = await getStoredToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(
  method: string,
  path: string,
  options: {
    body?: unknown;
    params?: Record<string, string>;
    schema?: z.ZodSchema<T>;
  } = {}
): Promise<T> {
  const { body, params, schema } = options;
  const url = new URL(`${BASE_URL}${path}`);
  
  if (_selectedOrgId) {
    url.searchParams.set("orgId", _selectedOrgId);
  }
  
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const headers = await buildHeaders();
  console.log(`[API] ${method} ${url.toString()}`);

  try {
    const res = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      console.warn("[API] 401 Unauthorized - trigger logout if needed");
      // Optional: Emit event or call a logout handler
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message = errorData.error || errorData.message || "REQUEST_FAILED";
      console.error(`[API] Error ${res.status}:`, message);
      throw new ApiError(res.status, message);
    }

    const data = await res.json();
    
    if (schema) {
      const result = schema.safeParse(data);
      if (!result.success) {
        console.error(`[API] Schema validation failed for ${path}:`, result.error);
        // In dev, we might want to throw. In prod, maybe just log.
        if (__DEV__) {
          throw new Error(`Schema validation failed for ${path}`);
        }
      }
      return result.success ? result.data : data;
    }

    return data as T;
  } catch (error) {
    console.error(`[API] Request failed:`, error);
    throw error;
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export type LoginResponse = {
  token: string;
  expiresIn: number;
  user: UserProfile;
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/api/mobile/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data.error ?? "LOGIN_FAILED");
  }

  const data = await res.json();
  return {
    ...data,
    user: UserProfileSchema.parse(data.user)
  };
}

export async function fetchMe() {
  return request<UserProfile>("GET", "/api/mobile/me", { schema: UserProfileSchema });
}

// ─── Organizations ───────────────────────────────────────────────────────────

export async function fetchOrganizations() {
  return request<Organization[]>("GET", "/api/organizations", { 
    schema: z.array(OrganizationSchema) 
  });
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function fetchDashboard(year?: number) {
  return request<DashboardData>("GET", "/api/dashboard", { 
    params: year ? { year: String(year) } : undefined,
    schema: DashboardSchema
  });
}

// ─── Owner ledger (cotisations) ──────────────────────────────────────────────

export async function fetchOwnerLedger(ownerId: string) {
  return request<any>("GET", `/api/owners/${ownerId}/ledger`);
}

// ─── Claims (réclamations) ───────────────────────────────────────────────────

export async function fetchClaims() {
  return request<Claim[]>("GET", "/api/claims", { schema: z.array(ClaimSchema) });
}

export async function fetchClaim(id: string) {
  return request<Claim>("GET", `/api/claims/${id}`, { schema: ClaimSchema });
}

export async function createClaim(payload: {
  title: string;
  description: string;
  category: string;
  unitId: string;
  ownerId: string;
}) {
  return request<{ id: string }>("POST", "/api/claims", { body: payload });
}

export async function addClaimComment(claimId: string, content: string) {
  return request<{ id: string }>("PATCH", "/api/claims", { 
    body: { id: claimId, comment: content } 
  });
}

export async function updateClaimStatus(claimId: string, status: string) {
  return request<{ id: string }>("PATCH", "/api/claims", { 
    body: { id: claimId, status } 
  });
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export async function fetchOwnersSummary() {
  return request<any[]>("GET", "/api/mobile/owners-summary");
}
