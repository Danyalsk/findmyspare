import { create } from "zustand";
import type { User } from "@/lib/types";

const K_USER = "fms_user";
const K_ACCESS = "fms_access";
const K_REFRESH = "fms_refresh";
const K_SID = "fms_sid";

const hasWindow = () => typeof window !== "undefined";

function readInitial<T>(key: string, parse: (v: string) => T, fallback: T): T {
  if (!hasWindow()) return fallback;
  const raw = sessionStorage.getItem(key);
  if (raw === null) return fallback;
  try {
    return parse(raw);
  } catch {
    return fallback;
  }
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  sessionId: string | null;
  isHydrated: boolean;

  setAuth: (input: {
    user: User;
    accessToken: string;
    refreshToken: string;
    sessionId: string;
  }) => void;

  setAccessToken: (token: string) => void;
  setRefreshToken: (token: string) => void;

  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: readInitial(K_USER, (v) => JSON.parse(v) as User, null),
  accessToken: readInitial(K_ACCESS, (v) => v, null),
  refreshToken: readInitial(K_REFRESH, (v) => v, null),
  sessionId: readInitial(K_SID, (v) => v, null),
  isHydrated: hasWindow(),

  setHydrated: () => set({ isHydrated: true }),

  setAuth: ({ user, accessToken, refreshToken, sessionId }) => {
    if (hasWindow()) {
      sessionStorage.setItem(K_USER, JSON.stringify(user));
      sessionStorage.setItem(K_ACCESS, accessToken);
      sessionStorage.setItem(K_REFRESH, refreshToken);
      sessionStorage.setItem(K_SID, sessionId);
    }
    set({ user, accessToken, refreshToken, sessionId, isHydrated: true });
  },

  setAccessToken: (token) => {
    if (hasWindow()) sessionStorage.setItem(K_ACCESS, token);
    set({ accessToken: token });
  },

  setRefreshToken: (token) => {
    if (hasWindow()) sessionStorage.setItem(K_REFRESH, token);
    set({ refreshToken: token });
  },

  logout: () => {
    if (hasWindow()) {
      sessionStorage.removeItem(K_USER);
      sessionStorage.removeItem(K_ACCESS);
      sessionStorage.removeItem(K_REFRESH);
      sessionStorage.removeItem(K_SID);
    }
    set({ user: null, accessToken: null, refreshToken: null, sessionId: null });
  },
}));

// ─── Non-hook accessors for the fetch layer ─────────
export function getAccessToken(): string | null {
  if (!hasWindow()) return null;
  return sessionStorage.getItem(K_ACCESS);
}

export function getRefreshToken(): string | null {
  if (!hasWindow()) return null;
  return sessionStorage.getItem(K_REFRESH);
}

export function setAccessTokenRaw(token: string) {
  if (!hasWindow()) return;
  sessionStorage.setItem(K_ACCESS, token);
  useAuthStore.setState({ accessToken: token });
}

export function setRefreshTokenRaw(token: string) {
  if (!hasWindow()) return;
  sessionStorage.setItem(K_REFRESH, token);
  useAuthStore.setState({ refreshToken: token });
}

export function getPostLoginPath(user: User): string {
  if (user.role === "admin") return "/admin";
  if (user.role === "buyer") return "/buyer";
  switch (user.verificationStatus) {
    case "approved":
      return "/supplier";
    case "pending":
      return "/supplier/pending";
    case "rejected":
      return "/supplier/rejected";
    case "not_submitted":
    default:
      return "/supplier/onboarding";
  }
}

export function clearAuthRaw() {
  if (!hasWindow()) return;
  sessionStorage.removeItem(K_USER);
  sessionStorage.removeItem(K_ACCESS);
  sessionStorage.removeItem(K_REFRESH);
  sessionStorage.removeItem(K_SID);
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    sessionId: null,
  });
}
