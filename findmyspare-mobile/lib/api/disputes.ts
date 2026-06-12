import { fetchApi } from "./index";
import type { Dispute, IssueType, OrderEntity } from "../types";

export const disputesApi = {
  raise: (
    orderId: string,
    payload: { issueType: IssueType; description: string; evidence?: string[] }
  ): Promise<{ dispute: Dispute }> =>
    fetchApi(`/disputes/orders/${orderId}`, { method: "POST", body: JSON.stringify(payload) }),

  get: (id: string): Promise<{ dispute: Dispute; order: OrderEntity | null }> =>
    fetchApi(`/disputes/${id}`),

  respond: (
    id: string,
    payload: {
      action?: "approve_return" | "reject" | "confirm_return";
      supplierResponse?: string;
      supplierEvidence?: string[];
    }
  ): Promise<{ dispute: Dispute }> =>
    fetchApi(`/disputes/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
};
