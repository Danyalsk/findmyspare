import { fetchApi } from "./index";
import type { Bid, Inquiry } from "../types";

export interface BidInput {
  price: string;
  condition?: string;
  warrantyMonths?: number;
  etaDays?: number;
  notes?: string;
}

export const bidsApi = {
  /** Bids on an inquiry. Buyer sees all; supplier sees own. GET /inquiries/:id/bids */
  listForInquiry: (inquiryId: string): Promise<{ bids: Bid[]; inquiry: Inquiry }> =>
    fetchApi(`/inquiries/${inquiryId}/bids`),

  /** Submit a bid (supplier). POST /inquiries/:id/bids */
  submit: (inquiryId: string, input: BidInput): Promise<{ bid: Bid }> =>
    fetchApi(`/inquiries/${inquiryId}/bids`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  /** Supplier's own bids. GET /bids/mine */
  mine: (): Promise<{ bids: Bid[] }> => fetchApi("/bids/mine"),
};
