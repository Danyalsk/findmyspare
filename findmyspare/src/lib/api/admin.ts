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

  reject: (
    id: string,
    payload: { reason?: string; reasonSlug?: string }
  ): Promise<{ supplier: User }> =>
    fetchApi(`/admin/suppliers/${id}/reject`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  requestInfo: (id: string, note: string): Promise<{ ok: true }> =>
    fetchApi(`/admin/suppliers/${id}/request-info`, {
      method: "POST",
      body: JSON.stringify({ note }),
    }),

  rejectionReasons: (): Promise<{ items: Array<{ id: string; slug: string; title: string; body: string }> }> =>
    fetchApi(`/admin/rejection-reasons`),

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

  // ─── New super-admin endpoints ─────────────────────
  banUser: (id: string, reason: string, expiresAt?: string): Promise<{ ok: true }> =>
    fetchApi(`/admin/users/${id}/ban`, {
      method: "POST",
      body: JSON.stringify({ reason, expiresAt }),
    }),

  unbanUser: (id: string): Promise<{ ok: true }> =>
    fetchApi(`/admin/users/${id}/unban`, { method: "POST" }),

  deleteUser: (id: string): Promise<{ ok: true }> =>
    fetchApi(`/admin/users/${id}`, { method: "DELETE" }),

  impersonate: (id: string): Promise<{ accessToken: string; expiresInSeconds: number }> =>
    fetchApi(`/admin/users/${id}/impersonate`, { method: "POST" }),

  auditLog: (params?: {
    actorId?: string;
    targetId?: string;
    action?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    items: Array<{
      id: string;
      actorId: string;
      actorName: string | null;
      actorEmail: string | null;
      action: string;
      targetType: string;
      targetId: string | null;
      metadata: Record<string, unknown> | null;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: string;
    }>;
    pagination: BackendPagination;
  }> => fetchApi(`/admin/audit-log${qs(params)}`),

  metrics: (range: "7d" | "30d" | "90d" = "7d"): Promise<{
    series: Array<{
      day: string;
      buyerSignups: number;
      supplierSignups: number;
      inquiries: number;
      bids: number;
      messages: number;
    }>;
  }> => fetchApi(`/admin/metrics?range=${range}`),

  health: (): Promise<{
    db: { ok: boolean; error: string | null };
    activeSessions: number;
    uptime: number;
    timestamp: string;
  }> => fetchApi(`/admin/health`),

  getConfig: (): Promise<{
    config: {
      maintenanceMode: boolean;
      waitlistOnly: boolean;
      signupsOpen: boolean;
      bannerText: string | null;
      updatedAt: string;
    };
  }> => fetchApi(`/admin/config`),

  updateConfig: (payload: {
    maintenanceMode?: boolean;
    waitlistOnly?: boolean;
    signupsOpen?: boolean;
    bannerText?: string;
  }): Promise<{ ok: true }> =>
    fetchApi(`/admin/config`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  listFlags: (params?: {
    status?: "open" | "reviewed" | "actioned" | "dismissed";
    page?: number;
  }): Promise<{
    items: Array<{
      id: string;
      reporterId: string | null;
      contentType: string;
      contentId: string;
      reason: string;
      status: string;
      createdAt: string;
    }>;
    pagination: BackendPagination;
  }> => fetchApi(`/admin/flags${qs(params)}`),

  actionFlag: (id: string, action: "hide" | "dismiss", notes?: string): Promise<{ ok: true }> =>
    fetchApi(`/admin/flags/${id}/action`, {
      method: "POST",
      body: JSON.stringify({ action, notes }),
    }),

  // Ops runbook — config + integration snapshot (super_admin only).
  runbook: (): Promise<RunbookData> => fetchApi(`/admin/runbook`),
};

type EnvField = { set: boolean; hint?: string; value?: string };
export interface RunbookData {
  runtime: {
    nodeEnv: string;
    port: string;
    uptimeSeconds: number;
    bunVersion: string;
    timestamp: string;
  };
  integrations: {
    database: { status: string; host: string; error: string | null };
    email_resend: { configured: boolean; from: string };
    gst_rapidapi: { configured: boolean; host: string };
    storage_blob: { configured: boolean; provider: string };
    whatsapp_otp: { configured: boolean; note: string };
  };
  env: Record<string, Record<string, EnvField>>;
}
