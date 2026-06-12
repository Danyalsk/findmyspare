import { fetchApi } from "./index";
import type {
  BackendPagination,
  InventoryItem,
  InventorySummary,
  ProductDetail,
  StockAdjustReason,
  StockMovement,
} from "@/lib/types";

export interface InventoryListParams {
  search?: string;
  status?: "draft" | "active" | "paused" | "out_of_stock";
  lowStock?: boolean;
  page?: number;
  limit?: number;
  sort?: "newest" | "stock_asc" | "stock_desc";
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

export const inventoryApi = {
  list: (params?: InventoryListParams): Promise<{ items: InventoryItem[]; pagination: BackendPagination }> =>
    fetchApi(`/inventory${toQuery(params ? { ...params } : undefined)}`),

  summary: (): Promise<InventorySummary> => fetchApi("/inventory/summary"),

  adjust: (
    productId: string,
    payload: { delta: number; reason: StockAdjustReason; note?: string }
  ): Promise<{ product: ProductDetail; movement: StockMovement }> =>
    fetchApi(`/inventory/${productId}/adjust`, { method: "POST", body: JSON.stringify(payload) }),

  movements: (
    productId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ movements: StockMovement[]; pagination: BackendPagination }> =>
    fetchApi(`/inventory/${productId}/movements${toQuery(params ? { ...params } : undefined)}`),

  publish: (productId: string): Promise<{ product: ProductDetail }> =>
    fetchApi(`/inventory/${productId}/publish`, { method: "POST" }),

  unpublish: (productId: string): Promise<{ product: ProductDetail }> =>
    fetchApi(`/inventory/${productId}/unpublish`, { method: "POST" }),
};
