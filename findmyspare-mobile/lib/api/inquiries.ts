import { fetchApi } from "./index";
import type { Inquiry, BackendPagination } from "../types";

export const inquiriesApi = {
  /** Buyer's own inquiries (with bid counts). GET /inquiries/me */
  mine: (): Promise<{ inquiries: Inquiry[] }> => fetchApi("/inquiries/me"),

  /** All active platform inquiries — supplier leads feed. GET /inquiries */
  active: (
    params: { page?: number; limit?: number } = {}
  ): Promise<{ inquiries: Inquiry[]; pagination: BackendPagination }> => {
    const qs = new URLSearchParams(
      Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
        if (v !== undefined && v !== null) acc[k] = String(v);
        return acc;
      }, {})
    ).toString();
    return fetchApi(`/inquiries${qs ? `?${qs}` : ""}`);
  },

  /** Single inquiry by id. GET /inquiries/:id */
  get: (id: string): Promise<{ inquiry: Inquiry }> => fetchApi(`/inquiries/${id}`),

  /** Create a part request (buyer). POST /inquiries */
  create: (payload: {
    partName: string;
    make: string;
    model: string;
    year: string;
    description?: string;
    imageUrl?: string;
  }): Promise<{ inquiry: Inquiry }> =>
    fetchApi("/inquiries", { method: "POST", body: JSON.stringify(payload) }),
};
