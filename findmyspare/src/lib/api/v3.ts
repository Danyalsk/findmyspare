import { fetchApi } from "./index";
import type { ShopProduct, JobCard, Vehicle } from "./v2";

/* Typed client for the v3 network: taxonomy for every industry, Business OS
   (trade links, purchase orders, khata, counter bills, radar, import), Fix
   service requests, admin network console and public storefronts. */

const json = (body: unknown, method = "POST"): RequestInit => ({ method, body: JSON.stringify(body) });
const qs = (p: Record<string, unknown>) => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(p)) if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  const s = q.toString();
  return s ? `?${s}` : "";
};

// ─── Taxonomy ────────────────────────────────────────
export interface MachineType { id: string; industryId: string; slug: string; name: string; attributes: { key: string; label: string; unit?: string }[]; brands: string[]; sortOrder: number }
export interface PartCategory { id: string; industryId: string; name: string; icon: string; sortOrder: number }
export interface Industry {
  id: string; slug: string; name: string; tagline: string | null; icon: string; tint: string; ink: string;
  identifierLabel: string; sortOrder: number; active: boolean; parts: number; sellers: number;
  machineTypes: MachineType[]; categories: PartCategory[];
}
export const BUSINESS_ROLE_LABEL: Record<string, string> = {
  raw_material_supplier: "Raw material supplier",
  manufacturer: "Manufacturer",
  super_stockist: "Super stockist",
  distributor: "Distributor",
  wholesaler: "Wholesaler",
  retailer: "Retailer / shop",
  service_center: "Service centre / workshop",
  technician: "Technician / mechanic",
  refurbisher: "Refurbisher",
  recycler: "Recycler / scrap",
  logistics: "Logistics",
  business_buyer: "Business buyer (fleet, factory, society)",
};
export const SELLER_ROLES = ["raw_material_supplier", "manufacturer", "super_stockist", "distributor", "wholesaler", "retailer", "refurbisher", "recycler"];

let taxonomyCache: Promise<{ industries: Industry[]; roles: string[] }> | null = null;
export const taxonomyApi = {
  get: () => (taxonomyCache ??= fetchApi<{ industries: Industry[]; roles: string[] }>("/catalog/taxonomy").catch((e) => { taxonomyCache = null; throw e; })),
  refresh: () => { taxonomyCache = null; return taxonomyApi.get(); },
};

// ─── Marketplace (industry-aware) ────────────────────
export type NetProduct = ShopProduct & { industrySlug: string; machineType: string | null; moq: number };
export const marketApi = {
  list: (p: { industry?: string; machineType?: string; city?: string; search?: string; category?: string; brand?: string; partType?: string; make?: string; model?: string; sort?: string; limit?: number; page?: number }) =>
    fetchApi<{ products: NetProduct[]; pagination: { total: number; totalPages: number; page: number } }>(`/products${qs(p)}`),
};

// ─── Business OS ─────────────────────────────────────
export interface BizMe {
  me: { id: string; name: string | null; businessName: string | null; city: string | null; role: string; verificationStatus: string; businessRoles: string[] | null; industries: string[] | null };
  today: {
    orders_to_pack: number; pos_to_accept: number; pos_to_ship: number; pos_to_receive: number; pos_waiting: number; low_stock: number; listings: number;
    receivable: string; payable: string; sales_today: string; bills_today: number; sales_month: string; link_requests: number; buyers: number; suppliers: number; open_requests: number;
  };
}
export interface DirectoryBiz { id: string; businessName: string | null; name: string | null; city: string | null; businessRoles: string[] | null; industries: string[] | null; listings: number; linkAsBuyer: string | null; linkAsSupplier: string | null }
export interface TradeLink {
  id: string; status: "pending" | "active" | "blocked"; supplier_id: string; buyer_id: string; requested_by: string; credit_limit: string; credit_days: number;
  price_list_id: string | null; price_list_name: string | null; other_id: string; other_name: string | null; other_city: string | null; other_roles: string[] | null;
  direction: "supplier" | "buyer"; balance: string;
}
export interface PriceList { id: string; name: string; discountPct: string; items: { id: string; productId: string; price: string; minQty: number; name: string; listPrice: string }[] }
export interface SupplierCatalog {
  supplier: { id: string; businessName: string | null; city: string | null };
  terms: { creditDays: number; creditLimit: string; priceList: string | null };
  products: { id: string; name: string; brand: string | null; partNumber: string | null; category: string | null; industrySlug: string; stockQuantity: number; moq: number; listPrice: string; yourPrice: string; tier: { price: string; minQty: number } | null }[];
}
export type PoStatus = "sent" | "accepted" | "rejected" | "shipped" | "received" | "cancelled";
export interface PoLine { productId: string; name: string; partNumber?: string | null; brand?: string | null; quantity: number; unitPrice: string; gstRate: number; total: string }
export interface PurchaseOrder {
  id: string; number: string; buyerId: string; sellerId: string; status: PoStatus; lines: PoLine[]; subtotal: string; tax: string; total: string;
  paymentTerms: "credit" | "advance"; dueDate: string | null; note: string | null; sellerNote: string | null; trackingNote: string | null; createdAt: string; updatedAt: string;
  buyerName?: string; sellerName?: string;
}
export interface Party { id: string; name: string; city: string | null; gst: string | null }
export interface KhataRow { key: string; counterparty_id: string | null; name: string | null; phone: string | null; balance: string; last_at: string; overdue: string }
export interface LedgerEntry { id: string; type: "invoice" | "payment" | "credit_note" | "opening"; amount: string; refType: string | null; refId: string | null; note: string | null; method: string | null; createdAt: string }
export interface BillLine { productId?: string | null; name: string; quantity: number; unitPrice: string; gstRate: number; total: string }
export interface SalesBill { id: string; number: string; customerName: string | null; customerPhone: string | null; lines: BillLine[]; subtotal: string; tax: string; total: string; paymentMode: "cash" | "upi" | "card" | "credit"; createdAt: string }
export interface RadarRow { term: string; searches: number; zero_result: number; my_listings: number }
export interface ImportRow { name: string; price: string | number; brand?: string; partNumber?: string; category?: string; industry?: string; machineType?: string; mrp?: string | number; stock?: string | number; moq?: string | number; fitsBrand?: string; fitsModel?: string }

export const bizApi = {
  me: () => fetchApi<BizMe>("/biz/me"),
  setProfile: (businessRoles: string[], industries: string[]) => fetchApi<{ profile: { businessRoles: string[]; industries: string[] } }>("/biz/profile", json({ businessRoles, industries }, "PATCH")),
  directory: (p: { role?: string; industry?: string; q?: string } = {}) => fetchApi<{ businesses: DirectoryBiz[] }>(`/biz/directory${qs(p)}`),
  links: () => fetchApi<{ links: TradeLink[] }>("/biz/links"),
  connect: (p: { supplierId?: string; buyerId?: string }) => fetchApi<{ link: TradeLink }>("/biz/links", json(p)),
  decide: (id: string, accept: boolean) => fetchApi("/biz/links/" + id + "/decision", json({ accept })),
  updateLink: (id: string, p: { priceListId?: string; creditLimit?: number; creditDays?: number }) => fetchApi("/biz/links/" + id, json(p, "PATCH")),
  priceLists: () => fetchApi<{ priceLists: PriceList[] }>("/biz/price-lists"),
  createPriceList: (name: string, discountPct: number) => fetchApi<{ priceList: PriceList }>("/biz/price-lists", json({ name, discountPct })),
  setPriceListItem: (id: string, productId: string, price: number, minQty = 1) => fetchApi(`/biz/price-lists/${id}/items`, json({ productId, price, minQty })),
  supplierCatalog: (supplierId: string, q?: string) => fetchApi<SupplierCatalog>(`/biz/suppliers/${supplierId}/catalog${qs({ q })}`),
  createPo: (p: { sellerId: string; lines: { productId: string; quantity: number }[]; note?: string; paymentTerms?: "credit" | "advance" }) => fetchApi<{ po: PurchaseOrder }>("/biz/pos", json(p)),
  pos: (direction: "in" | "out") => fetchApi<{ pos: PurchaseOrder[] }>(`/biz/pos?direction=${direction}`),
  po: (id: string) => fetchApi<{ po: PurchaseOrder; buyer: Party; seller: Party; role: "seller" | "buyer" }>(`/biz/pos/${id}`),
  poAction: (id: string, action: "accept" | "reject" | "ship" | "receive" | "cancel", extra: { note?: string; tracking?: string } = {}) =>
    fetchApi<{ po: PurchaseOrder }>(`/biz/pos/${id}/action`, json({ action, ...extra })),
  khata: () => fetchApi<{ receivable: KhataRow[]; payable: { owner_id: string; name: string | null; balance: string }[] }>("/biz/khata"),
  khataEntries: (p: { counterpartyId?: string; supplierId?: string; phone?: string; name?: string }) => fetchApi<{ entries: LedgerEntry[] }>(`/biz/khata/entries${qs(p)}`),
  addEntry: (p: { counterpartyId?: string; name?: string; phone?: string; type: "invoice" | "payment" | "credit_note"; amount: number; note?: string; method?: string }) => fetchApi("/biz/khata/entries", json(p)),
  createBill: (p: { customerName?: string; customerPhone?: string; paymentMode: SalesBill["paymentMode"]; lines: { productId?: string; name: string; quantity: number; unitPrice: number; gstRate: number }[] }) =>
    fetchApi<{ bill: SalesBill }>("/biz/bills", json(p)),
  bills: () => fetchApi<{ bills: SalesBill[] }>("/biz/bills"),
  bill: (id: string) => fetchApi<{ bill: SalesBill; seller: { name: string; gst: string | null; city: string | null; phone: string | null } }>(`/biz/bills/${id}`),
  radar: () => fetchApi<{ searches: RadarRow[]; requests: { id: string; partName: string; make: string | null; model: string | null; city: string | null; createdAt: string }[]; city: string | null }>("/biz/radar"),
  importRows: (rows: ImportRow[]) => fetchApi<{ created: number; updated: number; errors: string[] }>("/biz/import", json({ rows })),
};

// ─── Fix (service requests) ──────────────────────────
export type FixStatus = "open" | "accepted" | "completed" | "cancelled";
export interface ServiceRequest {
  id: string; customerId: string; industrySlug: string; machineType: string | null; brand: string | null; model: string | null; vehicleId: string | null;
  problem: string; city: string | null; address: string | null; phone: string | null; preferredTime: string | null; status: FixStatus;
  garageId: string | null; jobCardId: string | null; createdAt: string;
  garageName?: string | null; garagePhone?: string | null; jobStatus?: string | null; jobNumber?: string | null; customerName?: string;
}
export const fixApi = {
  create: (p: { industrySlug: string; machineType?: string; brand?: string; model?: string; vehicleId?: string; problem: string; city?: string; address?: string; phone?: string; preferredTime?: string }) =>
    fetchApi<{ request: ServiceRequest; notified: number }>("/fix/requests", json(p)),
  mine: () => fetchApi<{ requests: ServiceRequest[] }>("/fix/requests/mine"),
  cancel: (id: string) => fetchApi(`/fix/requests/${id}/cancel`, json({})),
  nearby: () => fetchApi<{ industries: string[]; city: string | null; requests: ServiceRequest[] }>("/fix/requests/nearby"),
  accept: (id: string) => fetchApi<{ request: ServiceRequest; job: JobCard }>(`/fix/requests/${id}/accept`, json({})),
};

// Machines without plates, and walk-in jobs for any machine.
export const machineApi = {
  add: (p: { industrySlug: string; machineType?: string; makeName: string; modelName: string; serialNo?: string; nickname?: string; year?: number }) =>
    fetchApi<{ vehicle: Vehicle }>("/vehicles", json(p)),
  openJob: (p: { industrySlug: string; machineType?: string; makeName: string; modelName: string; serialNo?: string; customerName?: string; customerPhone?: string; complaint?: string }) =>
    fetchApi<{ job: JobCard; vehicle: Vehicle & { regNoDisplay: string; label: string } }>("/garage/jobs", json(p)),
};

// ─── Admin network console ───────────────────────────
export interface NetworkOverview {
  roles: { role: string; n: number }[];
  industries: { slug: string; name: string; parts: number; sellers: number; businesses: number; searches: number; zero: number; requests: number }[];
  trade: { links: number; pos: number; po_value: string; bills: number; bill_value: string; receivable: string };
  fix: { status: string; n: number }[];
  searchGaps: { term: string; industry: string | null; n: number }[];
}
export interface AdminBiz { id: string; name: string | null; businessName: string | null; city: string | null; role: string; businessRoles: string[] | null; industries: string[] | null; verificationStatus: string; createdAt: string; listings: number; buyers: number; suppliers: number }
export const adminNetworkApi = {
  overview: () => fetchApi<NetworkOverview>("/admin/network/overview"),
  businesses: (p: { role?: string; industry?: string; q?: string } = {}) => fetchApi<{ businesses: AdminBiz[] }>(`/admin/network/businesses${qs(p)}`),
  taxonomy: () => fetchApi<{ industries: Omit<Industry, "parts" | "sellers">[] }>("/admin/network/taxonomy"),
  addIndustry: (p: { name: string; tagline?: string; icon?: string; identifierLabel?: string }) => fetchApi<{ industry: Industry }>("/admin/network/industries", json(p)),
  updateIndustry: (id: string, p: Partial<{ name: string; tagline: string; icon: string; identifierLabel: string; sortOrder: number; active: boolean }>) => fetchApi(`/admin/network/industries/${id}`, json(p, "PATCH")),
  addMachineType: (industryId: string, p: { name: string; brands?: string[] }) => fetchApi(`/admin/network/industries/${industryId}/machine-types`, json(p)),
  addCategory: (industryId: string, p: { name: string; icon?: string }) => fetchApi(`/admin/network/industries/${industryId}/categories`, json(p)),
  removeMachineType: (id: string) => fetchApi(`/admin/network/machine-types/${id}`, { method: "DELETE" }),
  removeCategory: (id: string) => fetchApi(`/admin/network/categories/${id}`, { method: "DELETE" }),
};

// ─── Public storefront ───────────────────────────────
export interface Storefront {
  store: { id: string; businessName: string | null; name: string | null; city: string | null; businessRoles: string[] | null; industries: string[] | null; since: string; verified: boolean; rating: string | null; reviews: number; delivered: number };
  products: { id: string; name: string; brand: string | null; partType: string; category: string | null; industrySlug: string; price: string; mrp: string | null; stockQuantity: number }[];
}
export const storeApi = { get: (id: string) => fetchApi<Storefront>(`/public/store/${id}`) };
