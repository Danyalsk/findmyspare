import { fetchApi } from "./index";
import type { User } from "@/lib/types";

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
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
    role: "buyer" | "supplier"
  ): Promise<AuthResponse> =>
    fetchApi("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    }),

  me: (): Promise<{ user: User }> => fetchApi("/auth/me"),

  logout: (refreshToken: string): Promise<{ ok: true }> =>
    fetchApi("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  logoutAll: (): Promise<{ ok: true }> =>
    fetchApi("/auth/logout-all", { method: "POST" }),

  listSessions: (): Promise<{ sessions: ActiveSession[] }> => fetchApi("/auth/sessions"),
};
