"use client";

import { useToastStore, type ToastVariant } from "@/lib/toast";
import { CloseIcon } from "@/lib/icons";

const variantStyles: Record<ToastVariant, string> = {
  success: "bg-accent text-white",
  error: "bg-danger text-white",
  info: "bg-ink text-paper",
};

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-card text-sm font-medium shadow-lg pointer-events-auto ${variantStyles[t.variant]}`}
        >
          <span className="flex-1">{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="opacity-70 hover:opacity-100 shrink-0">
            <CloseIcon size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
