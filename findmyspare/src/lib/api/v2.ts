import { fetchApi } from "./index";

/* Typed client for the v2 backend: marketplace checkout, mock payments,
   vehicles/passport, Garage OS and the public token pages. */

const json = (body: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(body) });
const qs = (p: Record<string, unknown>) => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(p)) if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  const s = q.toString();
  return s ? `?${s}` : "";
};

// ─── Marketplace ─────────────────────────────────────
export type PartType = "genuine" | "oes" | "aftermarket" | "used" | "refurbished";
export interface Fit { make: string; model: string; year?: string }

export interface ShopProduct {
  id: string;
  name: string;
  partNumber: string | null;
  category: string | null;
  price: string;
  mrp: string | null;
  brand: string | null;
  partType: PartType;
  stockQuantity: number;
  images: string[] | null;
  supplierId: string;
  supplierName: string | null;
  supplierBusinessName: string | null;
  supplierCity: string | null;
  compatibleVehicles: Fit[];
  rating: string | null;
  reviewCount: number;
  fitConfirmations: number;
  // v3: every product belongs to an industry (and optionally a machine type).
  industrySlug?: string;
  machineType?: string | null;
  moq?: number;
}

export interface ProductDetailV2 {
  product: ShopProduct & {
    description: string | null;
    specifications: Record<string, string> | null;
    warrantyInfo: string | null;
    supplierSince: string;
    supplierVerified: boolean;
  };
  rating: string | null;
  reviewCount: number;
  supplierRating: string | null;
  supplierReviewCount: number;
  supplierOrders: number;
  reviews: { rating: number; comment: string | null; fit_confirmed: boolean | null; vehicle: { make: string; model: string } | null; created_at: string; buyer_name: string | null }[];
  confirmedFits: { make_name: string; model_name: string; n: number }[];
}

export const shopApi = {
  list: (p: { search?: string; category?: string; make?: string; model?: string; partType?: string; brand?: string; sort?: string; limit?: number; page?: number }) =>
    fetchApi<{ products: ShopProduct[]; pagination: { total: number; totalPages: number; page: number } }>(`/products${qs(p)}`),
  get: (id: string) => fetchApi<ProductDetailV2>(`/products/${id}`),
};

export interface CheckoutPreview {
  sellers: { supplierId: string; supplierName: string; subtotal: string; deliveryFee: string; lines: { productId: string; name: string; quantity: number; unitPrice: string; subtotal: string }[] }[];
  itemsTotal: string;
  deliveryTotal: string;
  total: string;
  freeDeliveryAbove: number;
  deliveryFee: number;
}
export type PayMethod = "upi" | "card" | "netbanking" | "cod";
export interface Payment { id: string; status: "created" | "succeeded" | "failed"; amount: string; method: string | null; providerRef: string | null; failureReason: string | null }

export const checkoutApi = {
  preview: (items: { productId: string; quantity: number }[]) => fetchApi<CheckoutPreview>("/checkout/preview", json({ items })),
  create: (items: { productId: string; quantity: number }[], shippingAddressId?: string) =>
    fetchApi<{ checkoutId: string; total: string }>("/checkout", json({ items, shippingAddressId })),
  get: (id: string) =>
    fetchApi<{
      checkout: { id: string; total: string; itemsTotal: string; deliveryFee: string; createdAt: string };
      orders: { id: string; status: string; paymentStatus: string; totalAmount: string; deliveryFee: string; source: string; supplierName: string | null; items: { name: string; quantity: number; subtotal: string }[] }[];
    }>(`/checkout/${id}`),
  startPayment: (checkoutId: string) => fetchApi<{ payment: Payment }>("/payments", json({ checkoutId })),
  completePayment: (paymentId: string, method: PayMethod, outcome: "success" | "failure") =>
    fetchApi<{ payment: Payment }>(`/payments/${paymentId}/complete`, json({ method, outcome })),
  review: (orderId: string, body: { rating: number; comment?: string; fitConfirmed?: boolean; vehicleId?: string; productId?: string }) =>
    fetchApi<{ ok: true }>(`/orders/${orderId}/review`, json(body)),
};

// ─── Vehicles + Passport ─────────────────────────────
export interface Vehicle {
  id: string;
  // null for machines without a number plate (pump, AC, genset…): identified by serialNo.
  regNo: string | null;
  industrySlug?: string;
  machineType?: string | null;
  serialNo?: string | null;
  regNoDisplay: string;
  label: string;
  makeName: string;
  modelName: string;
  variantName: string | null;
  fuel: string | null;
  year: number | null;
  segment: "car" | "bike" | "scooter" | "commercial";
  nickname: string | null;
  odometerKm: number | null;
  shareToken: string | null;
  shareSections: ShareSections | null;
  stats?: { parts: number; warranties: number; services: number };
  pendingAccess?: { id: string; garageName: string; garageCity: string | null; requestedAt: string }[];
}
export interface ShareSections { services: boolean; parts: boolean; odometer: boolean; invoices: boolean }
export interface RcResult { regNo: string; regNoDisplay: string; makeName: string; modelName: string; variantName: string | null; fuel: string | null; year: number | null; segment: Vehicle["segment"]; source: "fms-record" | "mock-rc" }
export interface FittedPart {
  id: string; name: string; brand: string | null; partNumber: string | null; serialNo: string | null; sellerName: string | null; garageName: string | null;
  fittedAt: string; odometerKm: number | null; warrantyUntil: string | null; warrantyActive: boolean; warrantyDaysLeft: number; fitConfirmed: boolean | null;
}
export interface PassportService {
  jobCardId: string; number: string; garageName: string; garageCity: string | null; date: string; odometerKm: number | null; complaint: string | null; status: string;
  items: { kind: "part" | "labour"; name: string; brand: string | null; quantity: number }[];
  invoice: { id: string; number: string; total: string; status: string; verifyCode: string; payToken: string } | null;
}
export interface Passport {
  vehicle: Vehicle;
  services: PassportService[];
  activeJobs: { jobCardId: string; number: string; status: string; garageName: string; estimateToken: string | null; createdAt: string }[];
  parts: FittedPart[];
  invoices: { id: string; number: string; total: string; status: string; issuedAt: string; verifyCode: string; payToken: string; garageName: string }[];
  odometer: { at: string; km: number; source: string }[];
  stats: { services: number; partsFitted: number; activeWarranties: number; totalSpent: string };
  access: { id: string; status: "pending" | "granted" | "revoked"; garageName: string; garageCity: string | null; requestedAt: string }[];
}
export interface CatalogMake { id: string; name: string; slug: string; models: { id: string; name: string; segment: Vehicle["segment"]; variants: { id: string; name: string; fuel: string; yearFrom: number; yearTo: number | null }[] }[] }

export const vehiclesApi = {
  catalog: () => fetchApi<{ makes: CatalogMake[] }>("/catalog/vehicles"),
  lookup: (regNo: string) => fetchApi<{ vehicle: RcResult }>(`/vehicles/lookup${qs({ regNo })}`),
  mine: () => fetchApi<{ vehicles: Vehicle[] }>("/vehicles/mine"),
  add: (body: { regNo: string; nickname?: string }) => fetchApi<{ vehicle: Vehicle; claimed: boolean }>("/vehicles", json(body)),
  passport: (id: string) => fetchApi<Passport>(`/vehicles/${id}/passport`),
  decideAccess: (accessId: string, grant: boolean) => fetchApi(`/vehicles/access/${accessId}`, json({ grant })),
  share: (id: string, sections: ShareSections) => fetchApi<{ shareToken: string }>(`/vehicles/${id}/share`, json({ sections })),
  unshare: (id: string) => fetchApi(`/vehicles/${id}/share`, { method: "DELETE" }),
  confirmFit: (partId: string, fits: boolean) => fetchApi(`/vehicles/parts/${partId}/fit`, json({ fits })),
};

// ─── Garage OS ───────────────────────────────────────
export type JobStatus = "open" | "estimate_sent" | "approved" | "in_progress" | "ready" | "invoiced" | "paid" | "cancelled";
export interface Garage { id: string; name: string; gstin: string | null; phone: string | null; addressLine: string | null; city: string | null; state: string | null; pincode: string | null; upiId: string | null; invoicePrefix: string; verified: boolean }
export interface GarageStats { open_jobs: number; ready_jobs: number; unpaid_count: number; unpaid_total: string; today_collected: string; month_revenue: string; vehicles: number }
export interface InspectionPoint { label: string; status: "ok" | "attention" | "urgent"; note?: string }
export interface JobCard {
  id: string; number: string; status: JobStatus; vehicleId: string; customerName: string | null; customerPhone: string | null; odometerKm: number | null;
  complaint: string | null; inspection: InspectionPoint[]; estimateToken: string | null; createdAt: string; updatedAt: string;
  regNo?: string; regNoDisplay?: string; vehicleLabel?: string; estimateTotal?: string; itemCount?: number;
}
export interface JobItem {
  id: string; kind: "part" | "labour"; name: string; partNumber: string | null; brand: string | null; hsnSac: string | null; quantity: number; unitPrice: string; gstRate: number;
  approved: boolean; source: "own_stock" | "marketplace" | "customer"; inquiryId: string | null; orderId: string | null; sellerName: string | null; warrantyMonths: number; serialNo: string | null; fitted: boolean;
  quotes: { n: number; best: string } | null;
  order: { id: string; status: string; paymentStatus: string; checkoutId: string | null } | null;
}
export interface InvoiceLine { kind: "part" | "labour"; name: string; partNumber?: string | null; brand?: string | null; hsnSac?: string | null; quantity: number; unitPrice: string; gstRate: number; taxable: string; tax: string; total: string }
export interface Invoice {
  id: string; number: string; issuedAt: string; jobCardId: string; vehicleId: string;
  seller: { name: string; gstin?: string | null; address?: string | null; phone?: string | null };
  customer: { name?: string | null; phone?: string | null };
  vehicle: { regNo: string; label: string; odometerKm?: number | null };
  lines: InvoiceLine[]; taxable: string; cgst: string; sgst: string; total: string;
  contentHash: string; verifyCode: string; payToken: string; status: "unpaid" | "paid" | "void"; paidAt: string | null; paymentMethod: string | null;
}

export const garageApi = {
  me: () => fetchApi<{ garage: Garage | null; stats?: GarageStats }>("/garage/me"),
  save: (body: Partial<Omit<Garage, "id" | "verified">> & { name: string }) => fetchApi<{ garage: Garage }>("/garage", json(body)),
  jobs: (status?: "active" | "billed") => fetchApi<{ jobs: JobCard[] }>(`/garage/jobs${qs({ status })}`),
  openJob: (body: { regNo: string; customerName?: string; customerPhone?: string; odometerKm?: number; complaint?: string }) =>
    fetchApi<{ job: JobCard; vehicle: Vehicle }>("/garage/jobs", json(body)),
  job: (id: string) =>
    fetchApi<{ job: JobCard; vehicle: Vehicle & { ownerId: string | null }; access: { status: string } | null; ownerLinked: boolean; items: JobItem[]; totals: { taxable: string; cgst: string; sgst: string; total: string }; invoice: Invoice | null }>(`/garage/jobs/${id}`),
  updateJob: (id: string, body: Partial<{ inspection: InspectionPoint[]; complaint: string; odometerKm: number; status: "in_progress" | "ready" | "cancelled" }>) =>
    fetchApi<{ job: JobCard }>(`/garage/jobs/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  addItem: (id: string, body: { kind: "part" | "labour"; name: string; unitPrice: string; quantity?: number; gstRate?: number; brand?: string; partNumber?: string; warrantyMonths?: number; source?: string }) =>
    fetchApi<{ item: JobItem }>(`/garage/jobs/${id}/items`, json(body)),
  updateItem: (id: string, itemId: string, body: Partial<{ fitted: boolean; serialNo: string; unitPrice: string; quantity: number }>) =>
    fetchApi(`/garage/jobs/${id}/items/${itemId}`, { method: "PATCH", body: JSON.stringify(body) }),
  removeItem: (id: string, itemId: string) => fetchApi(`/garage/jobs/${id}/items/${itemId}`, { method: "DELETE" }),
  sendEstimate: (id: string) => fetchApi<{ job: JobCard; estimatePath: string }>(`/garage/jobs/${id}/send-estimate`, { method: "POST" }),
  requestQuotes: (id: string, itemId: string, note?: string) => fetchApi<{ inquiryId: string }>(`/garage/jobs/${id}/items/${itemId}/request-quotes`, json({ note })),
  invoice: (id: string) => fetchApi<{ invoice: Invoice }>(`/garage/jobs/${id}/invoice`, { method: "POST" }),
  invoices: () => fetchApi<{ invoices: Invoice[] }>("/garage/invoices"),
  getInvoice: (id: string) => fetchApi<{ invoice: Invoice; garage: Garage }>(`/garage/invoices/${id}`),
  markPaid: (id: string, method: "cash" | "upi" | "card") => fetchApi<{ invoice: Invoice }>(`/garage/invoices/${id}/mark-paid`, json({ method })),
  customers: () => fetchApi<{ customers: { vehicle_id: string; reg_no: string; reg_no_display: string; make_name: string; model_name: string; customer_name: string | null; customer_phone: string | null; visits: number; last_visit: string; spent: string }[] }>("/garage/customers"),
};

// ─── Public token pages (no login) ───────────────────
export interface PublicEstimate {
  garage: { name: string; city: string | null; phone: string | null; verified: boolean };
  vehicle: { regNoDisplay: string; label: string };
  job: { number: string; status: JobStatus; complaint: string | null; inspection: InspectionPoint[]; odometerKm: number | null; approvedAt: string | null; customerName: string | null };
  items: { id: string; kind: "part" | "labour"; name: string; brand: string | null; quantity: number; unitPrice: string; gstRate: number; approved: boolean; total: string; warrantyMonths: number }[];
  total: string;
}
export interface VerifyResult {
  found: boolean;
  genuine?: boolean;
  hash?: string;
  garageVerified?: boolean;
  invoice?: Omit<Invoice, "id" | "jobCardId" | "vehicleId" | "contentHash" | "payToken">;
}
export const publicApi = {
  estimate: (token: string) => fetchApi<PublicEstimate>(`/public/estimates/${token}`),
  approveEstimate: (token: string, approvedItemIds: string[]) => fetchApi<{ ok: true; approved: number; declined: number }>(`/public/estimates/${token}/approve`, json({ approvedItemIds })),
  verify: (code: string) => fetchApi<VerifyResult>(`/public/invoices/verify/${encodeURIComponent(code.trim())}`),
  invoiceForPay: (token: string) => fetchApi<{ invoice: Invoice; upiId: string | null }>(`/public/invoices/pay/${token}`),
  payInvoice: (token: string, method: Exclude<PayMethod, "cod">, outcome: "success" | "failure") => fetchApi<{ payment: Payment }>(`/public/invoices/pay/${token}`, json({ method, outcome })),
  passport: (token: string) =>
    fetchApi<{ vehicle: { regNoDisplay: string; label: string; segment: string }; sections: ShareSections; stats: Passport["stats"]; services: PassportService[]; parts: FittedPart[]; odometer: Passport["odometer"] }>(`/public/passport/${token}`),
};

export const adminV2Api = {
  health: () => fetchApi<Record<string, string | number | null> & { fillRate: number | null }>("/admin/marketplace-health"),
};

// ─── Formatting helpers ──────────────────────────────
export const inr = (v: string | number | null | undefined, opts: { decimals?: boolean } = {}) => {
  const n = typeof v === "string" ? parseFloat(v) : v ?? 0;
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: opts.decimals ? 2 : 0, maximumFractionDigits: opts.decimals ? 2 : 0 });
};
export const discountPct = (price: string, mrp: string | null) => {
  if (!mrp) return 0;
  const p = parseFloat(price), m = parseFloat(mrp);
  return m > p ? Math.round(((m - p) / m) * 100) : 0;
};
export const PART_TYPE_LABEL: Record<PartType, string> = {
  genuine: "Genuine OEM",
  oes: "OES",
  aftermarket: "Aftermarket",
  used: "Used · graded",
  refurbished: "Refurbished",
};
