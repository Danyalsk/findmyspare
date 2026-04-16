import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "buyer" | "supplier";
  image?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isHydrated: boolean;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: typeof window !== "undefined" ? JSON.parse(localStorage.getItem("fms_user") || "null") : null,
  token: typeof window !== "undefined" ? localStorage.getItem("fms_token") : null,
  isHydrated: false,
  setHydrated: () => set({ isHydrated: true }),
  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fms_user", JSON.stringify(user));
      localStorage.setItem("fms_token", token);
    }
    set({ user, token });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("fms_user");
      localStorage.removeItem("fms_token");
    }
    set({ user: null, token: null });
  },
}));
