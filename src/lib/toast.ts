import { create } from "zustand";

export type ToastVariant = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, variant?: ToastVariant) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  push: (message, variant = "info") => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500);
  },

  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (msg: string) => useToastStore.getState().push(msg, "success"),
  error: (msg: string) => useToastStore.getState().push(msg, "error"),
  info: (msg: string) => useToastStore.getState().push(msg, "info"),
};
