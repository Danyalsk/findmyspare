import { fetchApi } from "./index";
import type { BackendPagination, OrderDetail, OrderListItem, OrderStatus } from "@/lib/types";

export interface CreateOrderPayload {
  items: Array<{ productId: string; quantity: number }>;
  shippingAddressId?: string;
}

export interface ListOrdersParams {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

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

export const ordersApi = {
  list: (params?: ListOrdersParams): Promise<{ orders: OrderListItem[]; pagination: BackendPagination }> =>
    fetchApi(`/orders${toQuery(params ? { ...params } : undefined)}`),

  get: (id: string): Promise<OrderDetail> => fetchApi(`/orders/${id}`),

  create: (payload: CreateOrderPayload): Promise<{ order: { id: string }; escrowStatus: string; totalAmount: string }> =>
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
    fetchApi(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
