import { fetchApi, API_URL } from "./index";
import { getAccessToken } from "@/lib/store";
import type { User } from "@/lib/types";

// BetterAuth endpoints live under /api/auth (web auth). The legacy /auth/*
// routes are still used for password reset (and by the mobile app).
// NB: read API_URL inside the function — referencing it at module scope would
// hit a TDZ error because index.ts re-exports this module (circular import).
async function baFetch(path: string, body?: unknown, method: "GET" | "POST" = "POST") {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}/api/auth${path}`, {
    method,
    headers,
    body: method === "POST" && body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || `HTTP ${res.status}`);
  }
  // BetterAuth's bearer plugin returns the session token here on sign-in.
  const token2 = res.headers.get("set-auth-token") || (data as { token?: string }).token;
  return { data, token: token2 as string | undefined };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  isNewUser?: boolean;
}

export interface OtpRequestResponse {
  method: "email" | "phone";
  identifier: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

export interface ActiveSession {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string;
}

export const authApi = {
  login: (email: string, password: string): Promise<AuthResponse> =>
    fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (
    name: string,
    email: string,
    password: string,
    role: "buyer" | "supplier",
    phone?: string
  ): Promise<AuthResponse> =>
    fetchApi("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role, phone }),
    }),

  me: (): Promise<{ user: User }> => fetchApi("/auth/me"),

  // BetterAuth sign-out deletes the server-side session row → the bearer token
  // is invalid immediately. The optional arg is ignored (legacy compatibility).
  logout: async (_refreshToken?: string): Promise<{ ok: true }> => {
    await baFetch("/sign-out").catch(() => undefined);
    return { ok: true };
  },

  logoutAll: async (): Promise<{ ok: true }> => {
    await baFetch("/revoke-sessions").catch(() => undefined);
    return { ok: true };
  },

  listSessions: async (): Promise<{ sessions: ActiveSession[] }> => {
    const { data } = await baFetch("/list-sessions", undefined, "GET").catch(() => ({ data: [] }));
    const list = Array.isArray(data) ? data : [];
    return {
      sessions: list.map((s: Record<string, unknown>) => ({
        id: String(s.id ?? s.token ?? ""),
        userAgent: (s.userAgent as string) ?? null,
        ipAddress: (s.ipAddress as string) ?? null,
        createdAt: String(s.createdAt ?? ""),
        lastUsedAt: (s.updatedAt as string) ?? null,
        expiresAt: String(s.expiresAt ?? ""),
      })),
    };
  },

  // ─── Email verification ─────────────────────────────
  sendVerification: (email: string): Promise<{ ok: true }> =>
    fetchApi("/auth/send-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  verifyEmail: (token: string): Promise<{ ok: true }> =>
    fetchApi("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),

  // ─── Password reset ─────────────────────────────────
  forgotPassword: (email: string): Promise<{ ok: true }> =>
    fetchApi("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string): Promise<{ ok: true }> =>
    fetchApi("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),

  // ─── Passwordless OTP login (email) via BetterAuth ─
  requestOtp: async (identifier: string): Promise<OtpRequestResponse> => {
    await baFetch("/email-otp/send-verification-otp", {
      email: identifier,
      type: "sign-in",
    });
    return { method: "email", identifier };
  },

  // BetterAuth find-or-creates the user on first verify and returns the bearer
  // session token (header `set-auth-token`). New users come back with
  // profileCompleted=false, which the UI routes to the strict profile form.
  verifyOtp: async (identifier: string, code: string): Promise<AuthResponse> => {
    const { data, token } = await baFetch("/sign-in/email-otp", {
      email: identifier,
      otp: code,
    });
    const user = (data as { user: User }).user;
    return {
      user,
      accessToken: token ?? "",
      refreshToken: "",
      sessionId: "",
      isNewUser: !user?.profileCompleted,
    };
  },

  // One-click login from an email magic link.
  magicLogin: (token: string): Promise<AuthResponse> =>
    fetchApi("/auth/magic-login", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),

  completeProfile: (payload: {
    name?: string;
    email?: string;
    phone?: string;
    city?: string;
    pincode?: string;
  }): Promise<{ user: User }> =>
    fetchApi("/auth/complete-profile", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Tag the current account as a supplier (new signup or buyer upgrade). The
  // backend blocks the upgrade if the buyer has active orders (409).
  becomeSupplier: (): Promise<{ user: User }> =>
    fetchApi("/auth/become-supplier", { method: "POST" }),
};
