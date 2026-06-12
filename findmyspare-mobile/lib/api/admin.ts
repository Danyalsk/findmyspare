import { fetchApi } from "./index";
import type {
  AdminStats,
  AdminUserRow,
  BackendPagination,
  BusinessAddress,
  Role,
  VerificationStatus,
} from "../types";

export interface AdminSupplierRow {
  id: string;
  name: string;
  email: string;
  businessName: string | null;
  verificationStatus: VerificationStatus | null;
  gstNumber: string | null;
  submittedAt: string;
}

export interface AdminSupplierDetail {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone: string | null;
  image: string | null;
  businessName: string | null;
  businessType: string | null;
  verificationStatus: VerificationStatus | null;
  gstNumber: string | null;
  panNumber: string | null;
  gstCertificateUrl: string | null;
  gstVerification: Record<string, unknown> | null;
  businessAddress: BusinessAddress | null;
  rejectionReason: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

export const adminApi = {
  stats: (): Promise<AdminStats> => fetchApi("/admin/stats"),

  suppliers: (
    params: { status?: string; page?: number; limit?: number } = {}
  ): Promise<{ suppliers: AdminSupplierRow[]; pagination: BackendPagination }> =>
    fetchApi(`/admin/suppliers${toQuery(params)}`),

  supplier: (id: string): Promise<{ supplier: AdminSupplierDetail }> =>
    fetchApi(`/admin/suppliers/${id}`),

  approveSupplier: (id: string): Promise<{ supplier: AdminSupplierDetail }> =>
    fetchApi(`/admin/suppliers/${id}/approve`, { method: "POST", body: JSON.stringify({}) }),

  rejectSupplier: (id: string, reason: string): Promise<{ supplier: AdminSupplierDetail }> =>
    fetchApi(`/admin/suppliers/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  users: (
    params: { role?: string; search?: string; page?: number; limit?: number } = {}
  ): Promise<{ users: AdminUserRow[]; pagination: BackendPagination }> =>
    fetchApi(`/admin/users${toQuery(params)}`),

  setBlocked: (id: string, blocked: boolean): Promise<{ user: AdminUserRow }> =>
    fetchApi(`/admin/users/${id}/block`, {
      method: "POST",
      body: JSON.stringify({ blocked }),
    }),
};
