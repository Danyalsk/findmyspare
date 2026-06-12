import { create } from "zustand";
import type { User } from "@/lib/types";

const K_USER = "fms_user";
const K_ACCESS = "fms_access";
const K_REFRESH = "fms_refresh";
const K_SID = "fms_sid";

const hasWindow = () => typeof window !== "undefined";

function readInitial<T>(key: string, parse: (v: string) => T, fallback: T): T {
  if (!hasWindow()) return fallback;
  const raw = localStorage.getItem(key);
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
  setUser: (user: User) => void;

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
      localStorage.setItem(K_USER, JSON.stringify(user));
      localStorage.setItem(K_ACCESS, accessToken);
      localStorage.setItem(K_REFRESH, refreshToken);
      localStorage.setItem(K_SID, sessionId);
    }
    set({ user, accessToken, refreshToken, sessionId, isHydrated: true });
  },

  // Refresh just the user (role/verification/profile) from the server, keeping
  // the existing token. Used by SessionSync on load.
  setUser: (user) => {
    if (hasWindow()) localStorage.setItem(K_USER, JSON.stringify(user));
    set({ user });
  },

  setAccessToken: (token) => {
    if (hasWindow()) localStorage.setItem(K_ACCESS, token);
    set({ accessToken: token });
  },

  setRefreshToken: (token) => {
    if (hasWindow()) localStorage.setItem(K_REFRESH, token);
    set({ refreshToken: token });
  },

  logout: () => {
    if (hasWindow()) {
      localStorage.removeItem(K_USER);
      localStorage.removeItem(K_ACCESS);
      localStorage.removeItem(K_REFRESH);
      localStorage.removeItem(K_SID);
      tearDownSocket();
    }
    set({ user: null, accessToken: null, refreshToken: null, sessionId: null });
  },
}));

// Dynamic-import the socket cleanup to avoid a circular dependency between
// store.ts and socket.ts. Without this, a logged-out user's socket keeps
// receiving events that belonged to them — and the next login on the same
// browser would inherit those listeners.
function tearDownSocket() {
  import("./socket")
    .then((m) => m.disconnectSocket())
    .catch(() => {
      // ignore — socket may not be initialized yet
    });
}

// ─── Non-hook accessors for the fetch layer ─────────
export function getAccessToken(): string | null {
  if (!hasWindow()) return null;
  return localStorage.getItem(K_ACCESS);
}

export function getRefreshToken(): string | null {
  if (!hasWindow()) return null;
  return localStorage.getItem(K_REFRESH);
}

export function setAccessTokenRaw(token: string) {
  if (!hasWindow()) return;
  localStorage.setItem(K_ACCESS, token);
  useAuthStore.setState({ accessToken: token });
}

export function setRefreshTokenRaw(token: string) {
  if (!hasWindow()) return;
  localStorage.setItem(K_REFRESH, token);
  useAuthStore.setState({ refreshToken: token });
}

export function getPostLoginPath(user: User): string {
  if (user.role === "admin" || user.role === "super_admin") return "/admin";
  // Strict one-time profile gate: until the profile form is submitted, the
  // server blocks every protected route (403 PROFILE_INCOMPLETE), so send the
  // user there first regardless of role.
  if (!user.profileCompleted) return "/complete-profile";
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
  localStorage.removeItem(K_USER);
  localStorage.removeItem(K_ACCESS);
  localStorage.removeItem(K_REFRESH);
  localStorage.removeItem(K_SID);
  tearDownSocket();
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    sessionId: null,
  });
}
