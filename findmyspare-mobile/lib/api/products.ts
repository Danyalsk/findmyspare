import { fetchApi } from "./index";
import type { ProductSummary, ProductDetail, BackendPagination } from "../types";

export interface ListParams {
  page?: number;
  limit?: number;
  q?: string;
  search?: string;
  category?: string;
  make?: string;
  model?: string;
  sort?: "newest" | "price_asc" | "price_desc";
}

export interface ListResponse {
  products: ProductSummary[];
  pagination: BackendPagination;
}

export interface ProductInput {
  name: string;
  description?: string;
  partNumber?: string;
  category?: string;
  price: string;
  stockQuantity?: number;
  lowStockThreshold?: number;
  images?: string[];
  specifications?: Record<string, string>;
  compatibleVehicles?: Array<{ make: string; model: string; year?: string }>;
  warrantyInfo?: string;
  status?: "draft" | "active";
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

export const productsApi = {
  list: (params: ListParams = {}): Promise<ListResponse> => {
    // Backend expects `search`; accept either `q` or `search` from callers.
    const { q, search, make, model, ...rest } = params;
    const query = { ...rest, search: search ?? q } as Record<string, unknown>;
    void make; void model; // not supported by the public list endpoint
    return fetchApi<ListResponse>(`/products${toQuery(query)}`);
  },

  get: (id: string): Promise<{ product: ProductDetail }> => fetchApi(`/products/${id}`),

  mine: (
    params: { status?: string; page?: number; limit?: number } = {}
  ): Promise<{ products: ProductSummary[]; pagination?: BackendPagination }> =>
    fetchApi(`/products/mine${toQuery(params as Record<string, unknown>)}`),

  create: (input: ProductInput): Promise<{ product: ProductDetail }> =>
    fetchApi("/products", { method: "POST", body: JSON.stringify(input) }),

  update: (id: string, input: Partial<ProductInput> & { status?: string }): Promise<{ product: ProductDetail }> =>
    fetchApi(`/products/${id}`, { method: "PATCH", body: JSON.stringify(input) }),

  remove: (id: string): Promise<{ message: string }> =>
    fetchApi(`/products/${id}`, { method: "DELETE" }),
};
