import { fetchApi } from "./index";
import type {
  BackendPagination,
  InventoryItem,
  InventorySummary,
  ProductDetail,
  StockAdjustReason,
  StockMovement,
} from "../types";

export interface InventoryListParams {
  search?: string;
  status?: "draft" | "active" | "paused" | "out_of_stock";
  lowStock?: boolean;
  page?: number;
  limit?: number;
  sort?: "newest" | "stock_asc" | "stock_desc";
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

export const inventoryApi = {
  list: (params: InventoryListParams = {}): Promise<{ items: InventoryItem[]; pagination: BackendPagination }> =>
    fetchApi(`/inventory${toQuery(params as Record<string, unknown>)}`),

  summary: (): Promise<InventorySummary> => fetchApi("/inventory/summary"),

  adjust: (
    productId: string,
    payload: { delta: number; reason: StockAdjustReason; note?: string }
  ): Promise<{ product: ProductDetail; movement: StockMovement }> =>
    fetchApi(`/inventory/${productId}/adjust`, { method: "POST", body: JSON.stringify(payload) }),

  movements: (
    productId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<{ movements: StockMovement[]; pagination: BackendPagination }> =>
    fetchApi(`/inventory/${productId}/movements${toQuery(params as Record<string, unknown>)}`),

  publish: (productId: string): Promise<{ product: ProductDetail }> =>
    fetchApi(`/inventory/${productId}/publish`, { method: "POST" }),

  unpublish: (productId: string): Promise<{ product: ProductDetail }> =>
    fetchApi(`/inventory/${productId}/unpublish`, { method: "POST" }),
};
