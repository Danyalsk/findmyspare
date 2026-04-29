import { fetchApi } from "./index";
import type { BackendPagination, Bid, Inquiry } from "@/lib/types";

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

export const bidsApi = {
  listForInquiry: (inquiryId: string): Promise<{ bids: Bid[]; inquiry: Inquiry }> =>
    fetchApi(`/inquiries/${inquiryId}/bids`),

  createForInquiry: (
    inquiryId: string,
    payload: {
      price: string;
      condition?: string;
      warrantyMonths?: number;
      etaDays?: number;
      notes?: string;
    }
  ): Promise<{ bid: Bid }> =>
    fetchApi(`/inquiries/${inquiryId}/bids`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  myBids: (params?: { page?: number; limit?: number }): Promise<{ bids: Bid[]; pagination: BackendPagination }> =>
    fetchApi(`/bids/mine${toQuery(params)}`),

  get: (id: string): Promise<{ bid: Bid }> => fetchApi(`/bids/${id}`),

  // DEPRECATED v1: bid acceptance creates an order. Replaced by WhatsApp contact in UI.
  accept: (bidId: string): Promise<{ order: { id: string }; orderId: string }> =>
    fetchApi(`/bids/${bidId}/accept`, { method: "POST" }),
};
