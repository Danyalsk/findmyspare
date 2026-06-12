export type Role = "buyer" | "supplier" | "admin" | "super_admin";

export type VerificationStatus =
  | "not_submitted"
  | "pending"
  | "approved"
  | "rejected";

export interface BusinessAddress {
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  image?: string | null;
  phone?: string | null;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  profileCompleted?: boolean;
  city?: string | null;
  pincode?: string | null;
  businessName?: string | null;
  verificationStatus?: VerificationStatus | null;
  gstNumber?: string | null;
  panNumber?: string | null;
  gstCertificateUrl?: string | null;
  gstVerification?: GstVerification | null;
  businessAddress?: BusinessAddress | null;
  rejectionReason?: string | null;
}

export interface GstVerification {
  checkedAt: string;
  ok: boolean;
  status?: string;
  legalName?: string;
  tradeName?: string;
  address?: string;
  nameMatch?: boolean;
  error?: string;
}

export type PartCondition = "oem" | "oem_equivalent" | "used";

export interface CartItem {
  id: string;
  productId?: string;
  bidId?: string;
  name: string;
  vehicle: string;
  condition: PartCondition;
  quantity: number;
  unitPrice: number;
  imageLabel?: string;
  supplierId: string;
  supplierName: string;
}

export interface BackendPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Address {
  id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault?: boolean | null;
}

export type InquiryStatus = "pending" | "responded" | "closed";

export interface Inquiry {
  id: string;
  buyerId: string;
  partName: string;
  make: string;
  model: string;
  year: string;
  description: string | null;
  imageUrl: string | null;
  status: InquiryStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  bidCount?: number;
  buyerName?: string | null;
}

export type MessageAttachment = { url: string; type: "image" | "video" };

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  attachments?: MessageAttachment[] | null;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  userId: string;
  name: string;
  role: Role;
  businessName: string | null;
  image: string | null;
  lastMessage: string;
  lastAttachments?: MessageAttachment[] | null;
  lastMessageAt: string;
  unreadCount: number;
}

export type BidStatus = "pending" | "accepted" | "rejected" | "expired";

export interface Bid {
  id: string;
  inquiryId: string;
  supplierId: string;
  price: string;
  condition: PartCondition | string;
  warrantyMonths: number;
  etaDays: number;
  notes: string | null;
  status: BidStatus;
  orderId: string | null;
  createdAt: string;
  supplierName?: string | null;
  supplierBusinessName?: string | null;
  supplierPhone?: string | null;
  completedOrders?: number;
}

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "shipped"
  | "in_transit"
  | "delivered"
  | "completed"
  | "disputed"
  | "cancelled";

export interface OrderListItem {
  id: string;
  status: OrderStatus;
  totalAmount: string;
  trackingNumber: string | null;
  courierService: string | null;
  estimatedDelivery: string | null;
  autoCloseAt: string | null;
  createdAt: string;
  buyerId: string;
  supplierId: string;
  buyerName: string | null;
  supplierName: string | null;
  primaryItemName?: string | null;
  primaryPartNumber?: string | null;
}

export interface OrderEntity {
  id: string;
  buyerId: string;
  supplierId: string;
  status: OrderStatus;
  totalAmount: string;
  shippingAddressId: string | null;
  trackingNumber: string | null;
  courierService: string | null;
  estimatedDelivery: string | null;
  deliveredAt: string | null;
  closedAt: string | null;
  autoCloseAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  productId: string;
  productName: string | null;
  productImage: string[] | null;
  partNumber: string | null;
}

export interface EscrowTransaction {
  id: string;
  orderId: string;
  amount: string;
  status: string;
  createdAt: string;
  releasedAt: string | null;
  refundedAt: string | null;
}

export interface OrderDetail {
  order: OrderEntity;
  items: OrderItem[];
  escrow: EscrowTransaction | null;
  buyer: { id: string; name: string; email: string; phone: string | null } | null;
  supplier: { id: string; name: string; email: string; businessName: string | null } | null;
  shippingAddress: Address | null;
  dispute: { id: string; status: DisputeStatus } | null;
}

export interface ProductSummary {
  id: string;
  name: string;
  partNumber: string | null;
  category: string | null;
  price: string;
  stockQuantity: number;
  images: string[] | null;
  status: string;
  supplierId: string;
  supplierName: string | null;
  createdAt: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  description: string | null;
  partNumber: string | null;
  category: string | null;
  price: string;
  stockQuantity: number;
  lowStockThreshold?: number;
  images: string[] | null;
  specifications: Record<string, string> | null;
  compatibleVehicles: Array<{ make: string; model: string; year?: string }> | null;
  warrantyInfo: string | null;
  status: string;
  viewCount: number;
  supplierId: string;
  supplierName: string | null;
  supplierBusinessName: string | null;
  supplierPhone: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Inventory ───────────────────────────────────────
export type ProductStatus = "active" | "paused" | "out_of_stock" | "draft" | "deleted";

export type StockAdjustReason = "received" | "damaged" | "correction" | "returned";
export type StockMovementReason = StockAdjustReason | "initial" | "order" | "order_cancelled";

export interface InventoryItem {
  id: string;
  name: string;
  partNumber: string | null;
  category: string | null;
  price: string;
  stockQuantity: number;
  lowStockThreshold: number;
  status: string;
  images: string[] | null;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  delta: number;
  previousQuantity: number;
  newQuantity: number;
  reason: StockMovementReason;
  note: string | null;
  createdAt: string;
}

export interface InventorySummary {
  totalItems: number;
  drafts: number;
  listed: number;
  lowStock: number;
  outOfStock: number;
}

export interface SupplierDashboard {
  pendingOrderCount: number;
  activeBids: number;
  openInquiries: number;
}

// ─── Disputes ────────────────────────────────────────
export type IssueType =
  | "wrong_part"
  | "damaged"
  | "not_as_described"
  | "missing_parts"
  | "not_delivered"
  | "other";

export type DisputeStatus =
  | "open"
  | "under_review"
  | "return_approved"
  | "return_rejected"
  | "resolved"
  | "closed";

export interface Dispute {
  id: string;
  orderId: string;
  raisedById: string;
  issueType: IssueType;
  description: string;
  status: DisputeStatus;
  evidence: string[] | null;
  supplierResponse: string | null;
  supplierEvidence: string[] | null;
  returnTrackingNumber: string | null;
  returnConfirmedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  status: "active" | "draft";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  businessName: string | null;
  verificationStatus: VerificationStatus | null;
  isBlocked: boolean;
  createdAt: string;
}

export interface AdminInquiryRow {
  id: string;
  partName: string;
  make: string;
  model: string;
  year: string;
  status: InquiryStatus;
  isActive: boolean;
  createdAt: string;
  buyerId: string;
  buyerName: string | null;
  buyerEmail: string | null;
  bidCount: number;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface ApiError {
  error: string;
}
