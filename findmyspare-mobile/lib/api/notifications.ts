import { fetchApi } from "./index";
import type { AppNotification } from "../types";

export const notificationsApi = {
  list: (
    params: { page?: number; limit?: number } = {}
  ): Promise<{ notifications: AppNotification[]; unreadCount: number }> => {
    const qs = new URLSearchParams(
      Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
        if (v !== undefined && v !== null) acc[k] = String(v);
        return acc;
      }, {})
    ).toString();
    return fetchApi(`/notifications${qs ? `?${qs}` : ""}`);
  },

  markRead: (id: string): Promise<{ message: string }> =>
    fetchApi(`/notifications/${id}/read`, { method: "PATCH" }),

  markAllRead: (): Promise<{ message: string }> =>
    fetchApi("/notifications/read-all", { method: "POST", body: JSON.stringify({}) }),
};
