export type Role = "buyer" | "supplier";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  image?: string | null;
  phone?: string | null;
  businessName?: string | null;
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
  images: string[] | null;
  specifications: Record<string, string> | null;
  compatibleVehicles: Array<{ make: string; model: string; year?: string }> | null;
  warrantyInfo: string | null;
  status: string;
  viewCount: number;
  supplierId: string;
  supplierName: string | null;
  supplierBusinessName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierDashboard {
  pendingEscrow: number;
  pendingOrderCount: number;
  releasedThisWeek: number;
  releasedChange: number;
  activeBids: number;
  openInquiries: number;
}

export interface ApiError {
  error: string;
}
