import { fetchApi } from "./index";
import type { BackendPagination, OrderDetail, OrderListItem, OrderStatus } from "../types";

export interface ListOrdersParams {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

function toQuery(params: Record<string, unknown>): string {
  const qs = new URLSearchParams(
    Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
      if (v !== undefined && v !== null && v !== "") acc[k] = String(v);
      return acc;
    }, {})
  ).toString();
  return qs ? `?${qs}` : "";
}

export const ordersApi = {
  list: (params: ListOrdersParams = {}): Promise<{ orders: OrderListItem[]; pagination: BackendPagination }> =>
    fetchApi(`/orders${toQuery(params as Record<string, unknown>)}`),

  get: (id: string): Promise<OrderDetail> => fetchApi(`/orders/${id}`),

  create: (payload: {
    items: Array<{ productId: string; quantity: number }>;
    shippingAddressId?: string;
  }): Promise<{ order: { id: string }; escrowStatus: string; totalAmount: string }> =>
    fetchApi("/orders", { method: "POST", body: JSON.stringify(payload) }),

  updateStatus: (
    id: string,
    payload: {
      status: OrderStatus;
      trackingNumber?: string;
      courierService?: string;
      estimatedDelivery?: string;
    }
  ): Promise<{ order: { id: string; status: OrderStatus } }> =>
    fetchApi(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify(payload) }),
};
