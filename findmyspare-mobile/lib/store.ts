import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import type { User } from "./types";

// User object lives in AsyncStorage; the bearer token lives in SecureStore.
const K_USER = "fms_user";
const K_TOKEN = "fms_token"; // SecureStore key (BetterAuth session bearer)

// Mirrored in memory for synchronous access in the fetch layer.
let memToken: string | null = null;
let memUser: User | null = null;

async function secureSet(key: string, value: string) {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // SecureStore unavailable (e.g. web) — fall back to AsyncStorage.
    await AsyncStorage.setItem(key, value);
  }
}
async function secureGet(key: string): Promise<string | null> {
  try {
    const v = await SecureStore.getItemAsync(key);
    if (v != null) return v;
  } catch {
    /* fall through */
  }
  return AsyncStorage.getItem(key);
}
async function secureDelete(key: string) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    /* ignore */
  }
  await AsyncStorage.removeItem(key);
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  setAuth: (input: { user: User; accessToken: string }) => Promise<void>;
  setUser: (user: User) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isHydrated: false,

  hydrate: async () => {
    try {
      const [u, t] = await Promise.all([AsyncStorage.getItem(K_USER), secureGet(K_TOKEN)]);
      const user = u ? (JSON.parse(u) as User) : null;
      memUser = user;
      memToken = t;
      set({ user, accessToken: t, isHydrated: true });
    } catch {
      set({ isHydrated: true });
    }
  },

  setAuth: async ({ user, accessToken }) => {
    memUser = user;
    memToken = accessToken;
    await Promise.all([
      AsyncStorage.setItem(K_USER, JSON.stringify(user)),
      secureSet(K_TOKEN, accessToken),
    ]);
    set({ user, accessToken, isHydrated: true });
  },

  setUser: async (user) => {
    memUser = user;
    await AsyncStorage.setItem(K_USER, JSON.stringify(user));
    set({ user });
  },

  logout: async () => {
    memUser = null;
    memToken = null;
    await Promise.all([AsyncStorage.removeItem(K_USER), secureDelete(K_TOKEN)]);
    set({ user: null, accessToken: null });
  },
}));

/* ── Sync accessors / raw mutators for the fetch layer ── */

export function getAccessToken(): string | null {
  return memToken;
}

export function getCurrentUser(): User | null {
  return memUser;
}

// BetterAuth rotates the bearer token via the `set-auth-token` response header.
export async function setAccessTokenRaw(token: string) {
  if (!token || token === memToken) return;
  memToken = token;
  await secureSet(K_TOKEN, token);
  useAuthStore.setState({ accessToken: token });
}

export async function clearAuthRaw() {
  memUser = null;
  memToken = null;
  await Promise.all([AsyncStorage.removeItem(K_USER), secureDelete(K_TOKEN)]);
  useAuthStore.setState({ user: null, accessToken: null });
}

/* ── Post-login routing ── */

export function getPostLoginPath(user: User): string {
  if (user.role === "admin" || user.role === "super_admin") return "/(admin)";
  // Profile gate — applies to every role before the app proper.
  if (user.profileCompleted === false) return "/complete-profile";
  if (user.role === "buyer") return "/(buyer)";
  switch (user.verificationStatus) {
    case "approved":
      return "/(supplier)";
    case "pending":
      return "/(supplier)/pending";
    case "rejected":
      return "/(supplier)/rejected";
    case "not_submitted":
    default:
      return "/(supplier)/onboarding";
  }
}
