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

if (!BASE_URL) {
  console.error("CRITICAL: EXPO_PUBLIC_API_URL is not defined in environment variables!");
}
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
  
  const baseUrlClean = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
  const pathClean = path.startsWith("/") ? path : `/${path}`;
  let fullUrl = `${baseUrlClean}${pathClean}`;
  
  const queryParams = new URLSearchParams();
  if (_selectedOrgId) {
    queryParams.append("orgId", _selectedOrgId);
  }
  
  if (params) {
    Object.entries(params).forEach(([k, v]) => queryParams.append(k, v));
  }

  const queryString = queryParams.toString();
  if (queryString) {
    fullUrl += (fullUrl.includes("?") ? "&" : "?") + queryString;
  }

  const headers = await buildHeaders();
  console.log(`[API] Request: ${method} ${fullUrl}`);

  try {
    const res = await fetch(fullUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log(`[API] Response from ${fullUrl}: status ${res.status}`);

    console.log(`[API] Response status: ${res.status} (${res.ok ? "OK" : "Error"})`);

    if (res.status === 401) {
      console.warn("[API] 401 Unauthorized - trigger logout if needed");
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
    console.error(`[API] Request failed for ${method} ${url.toString()}:`, error);
    // Log the error details if it's a fetch error (like connection refused)
    if (error instanceof Error) {
      console.error(`[API] Error details: ${error.name} - ${error.message}`);
    }
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
  const data = await request<any>("POST", "/api/mobile/token", {
    body: { email, password },
  });

  return {
    ...data,
    user: UserProfileSchema.parse(data.user),
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
