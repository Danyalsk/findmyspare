import { fetchApi } from "./index";
import type { BackendPagination, ProductDetail, ProductSummary } from "@/lib/types";

export interface ProductListParams {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  supplierId?: string;
  page?: number;
  limit?: number;
  sort?: "newest" | "price_asc" | "price_desc";
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

export const productsApi = {
  list: (params?: ProductListParams): Promise<{ products: ProductSummary[]; pagination: BackendPagination }> =>
    fetchApi(`/products${toQuery(params ? { ...params } : undefined)}`),

  get: (id: string): Promise<{ product: ProductDetail }> => fetchApi(`/products/${id}`),

  create: (payload: {
    name: string;
    description?: string;
    partNumber?: string;
    category?: string;
    price: string;
    stockQuantity?: number;
    images?: string[];
    specifications?: Record<string, string>;
    compatibleVehicles?: Array<{ make: string; model: string; year?: string }>;
    warrantyInfo?: string;
  }): Promise<{ product: ProductDetail }> =>
    fetchApi("/products", { method: "POST", body: JSON.stringify(payload) }),

  update: (
    id: string,
    payload: Partial<{
      name: string;
      description: string;
      partNumber: string;
      category: string;
      price: string;
      stockQuantity: number;
      images: string[];
      specifications: Record<string, string>;
      compatibleVehicles: Array<{ make: string; model: string; year?: string }>;
      warrantyInfo: string;
      status: "active" | "paused" | "out_of_stock";
    }>
  ): Promise<{ product: ProductDetail }> =>
    fetchApi(`/products/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  remove: (id: string): Promise<{ message: string }> =>
    fetchApi(`/products/${id}`, { method: "DELETE" }),
};
