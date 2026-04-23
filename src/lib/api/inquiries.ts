import { fetchApi } from "./index";
import type { BackendPagination, Inquiry } from "@/lib/types";

function toQuery(params?: Record<string, unknown>) {
  if (!params) return "";
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      q.set(key, String(value));
    }
  }
  const value = q.toString();
  return value ? `?${value}` : "";
}

export const inquiriesApi = {
  create: (payload: {
    partName: string;
    make: string;
    model: string;
    year: string;
    description?: string;
    imageUrl?: string;
  }): Promise<{ inquiry: Inquiry }> =>
    fetchApi("/inquiries", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  mine: (): Promise<{ inquiries: Inquiry[] }> => fetchApi("/inquiries/me"),

  get: (id: string): Promise<{ inquiry: Inquiry }> => fetchApi(`/inquiries/${id}`),

  listActive: (params?: { page?: number; limit?: number }): Promise<{ inquiries: Inquiry[]; pagination: BackendPagination }> =>
    fetchApi(`/inquiries${toQuery(params)}`),
};
