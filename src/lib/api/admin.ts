import { fetchApi } from "./index";
import type {
  User,
  VerificationStatus,
  BackendPagination,
  Banner,
  Role,
  AdminUserRow,
  AdminInquiryRow,
  ProductSummary,
} from "@/lib/types";

export interface AdminSupplierRow {
  id: string;
  name: string;
  email: string;
  businessName: string | null;
  verificationStatus: VerificationStatus;
  gstNumber: string | null;
  submittedAt: string | null;
}

function qs(params?: Record<string, unknown>) {
  if (!params) return "";
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") u.set(k, String(v));
  }
  const s = u.toString();
  return s ? `?${s}` : "";
}

export const adminApi = {
  // Suppliers verification
  listSuppliers: (params?: {
    status?: VerificationStatus;
    page?: number;
  }): Promise<{ suppliers: AdminSupplierRow[]; pagination: BackendPagination }> =>
    fetchApi(`/admin/suppliers${qs(params)}`),

  getSupplier: (id: string): Promise<{ supplier: User }> =>
    fetchApi(`/admin/suppliers/${id}`),

  approve: (id: string): Promise<{ supplier: User }> =>
    fetchApi(`/admin/suppliers/${id}/approve`, { method: "POST" }),

  reject: (id: string, reason: string): Promise<{ supplier: User }> =>
    fetchApi(`/admin/suppliers/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  // Users (all roles)
  listUsers: (params?: {
    role?: Role;
    search?: string;
    page?: number;
  }): Promise<{ users: AdminUserRow[]; pagination: BackendPagination }> =>
    fetchApi(`/admin/users${qs(params)}`),

  getUser: (id: string): Promise<{ user: AdminUserRow }> =>
    fetchApi(`/admin/users/${id}`),

  blockUser: (id: string, blocked: boolean): Promise<{ user: AdminUserRow }> =>
    fetchApi(`/admin/users/${id}/block`, {
      method: "POST",
      body: JSON.stringify({ blocked }),
    }),

  // Inquiries (all)
  listInquiries: (params?: {
    status?: string;
    search?: string;
    page?: number;
  }): Promise<{ inquiries: AdminInquiryRow[]; pagination: BackendPagination }> =>
    fetchApi(`/admin/inquiries${qs(params)}`),

  // Products (all)
  listProducts: (params?: {
    search?: string;
    page?: number;
  }): Promise<{ products: ProductSummary[]; pagination: BackendPagination }> =>
    fetchApi(`/admin/products${qs(params)}`),

  // Banner CMS
  listBanners: (): Promise<{ banners: Banner[] }> => fetchApi(`/admin/banners`),
  getBanner: (id: string): Promise<{ banner: Banner }> => fetchApi(`/admin/banners/${id}`),
  createBanner: (
    payload: Partial<Omit<Banner, "id" | "createdAt" | "updatedAt">>
  ): Promise<{ banner: Banner }> =>
    fetchApi(`/admin/banners`, { method: "POST", body: JSON.stringify(payload) }),
  updateBanner: (
    id: string,
    payload: Partial<Omit<Banner, "id" | "createdAt" | "updatedAt">>
  ): Promise<{ banner: Banner }> =>
    fetchApi(`/admin/banners/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteBanner: (id: string): Promise<{ message: string }> =>
    fetchApi(`/admin/banners/${id}`, { method: "DELETE" }),

  // Stats
  stats: (): Promise<{
    pendingSuppliers: number;
    totalUsers: number;
    totalSuppliers: number;
    totalBuyers: number;
    totalProducts: number;
    totalInquiries: number;
    activeBanners: number;
  }> => fetchApi(`/admin/stats`),
};
