/* ── Core domain types for Zimora Cloud POS ─────────────────────────────── */



// Dynamic category interface for the new database-driven categories
export interface CategoryEntity {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export type PaymentMethod = "cash" | "mpesa" | "card" | "split";
export type SaleStatus = "completed" | "pending" | "refunded" | "partially_refunded";
export type ProductStatus = "active" | "archived";
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";
export type Unit = "pc" | "pack" | "box" | "kg" | "ltr" | "carton";

// TODO: Change to `string` when implementing dynamic role management
// For now, keeping as union type for type safety during migration
export type Role = string;

export interface RoleConfig {
  id: string;
  name: string;
  description: string;
  permissions: PermissionMatrix;
  isSystem?: boolean; // Whether this is a system role that cannot be deleted
  memberCount?: number;
}

export type EmployeeStatus = "active" | "on_shift" | "inactive";
export type PermissionAction = "view" | "create" | "edit" | "delete" | "export";
export type PermissionModule =
  | "sales"
  | "products"
  | "inventory"
  | "customers"
  | "reports"
  | "expenses"
  | "employees"
  | "settings";
export type PermissionMatrix = Record<PermissionModule, Record<PermissionAction, boolean>>;

export type InventoryTxType = "purchase" | "sale" | "adjustment" | "transfer" | "return";
export type NotificationType =
  | "low_stock"
  | "payment"
  | "failed_payment"
  | "refund"
  | "employee"
  | "subscription"
  | "system";
export type POStatus = "draft" | "sent" | "partial" | "received" | "cancelled";
export type ExpensePayment = PaymentMethod | "bank";
export type CustomerType = "Regular" | "Wholesale" | "Corporate";

/* ── Entities ─────────────────────────────────────────────────────── */

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  description?: string;
  price: number;
  cost: number;
  taxRate: number;
  stock: number;
  minStock: number;
  maxStock: number;
  unit: Unit;
  location: string;
  supplier: string;
  status: ProductStatus;
  updatedAt: string;
  createdAt: string;
  sold: number;
  imageUrl?: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  sku?: string;
  unitPrice: number;
  qty: number;
}

export interface CartLine {
  product: Product;
  qty: number;
}

export interface Sale {
  id: string;
  orderNo: string;
  date: string;
  customerId: string;
  customerName: string;
  cashier: string;
  branch: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentRef?: string;
  status: SaleStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: CustomerType;
  orders: number;
  totalSpent: number;
  loyaltyPoints: number;
  lastVisit: string;
  notes?: string;
}

export interface Employee {
  id: string;
  employeeNo: string;
  name: string;
  role: Role;
  email: string;
  phone: string;
  branch: string;
  status: EmployeeStatus;
  lastActive: string;
  permissions: PermissionMatrix;
  pin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryTransaction {
  id: string;
  date: string;
  productId: string;
  productName: string;
  sku: string;
  type: InventoryTxType;
  qty: number;
  previousStock: number;
  newStock: number;
  createdBy: string;
  reference: string;
  note?: string;
}

export interface Expense {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  addedBy: string;
  paymentMethod: ExpensePayment;
  notes?: string;
}

export interface PurchaseOrderItem {
  productId: string;
  name: string;
  sku: string;
  qty: number;
  unitCost: number;
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  items: PurchaseOrderItem[];
  total: number;
  orderDate: string;
  expectedDate: string;
  status: POStatus;
  branch: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  supplies: string;
  products: number;
  outstanding: number;
  status: "active" | "inactive";
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  href?: string;
}

export interface Branch {
  id: string;
  name: string;
  area: string;
  city: string;
  address: string;
  isMain: boolean;
  status: "open" | "closed";
}

export interface Business {
  name: string;
  legalName: string;
  type: string;
  kraPin: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  dateFormat: string;
  taxInclusive: boolean;
}

export interface ReceiptSettings {
  template: "classic" | "modern" | "minimal" | "professional" | "elegant" | "bold";
  width: "58mm" | "80mm";
  showLogo: boolean;
  showCashier: boolean;
  showTax: boolean;
  showBarcode: boolean;
  showQR: boolean;
  showCustomer: boolean;
  showBusinessInfo: boolean;
  showPaymentDetails: boolean;
  showItemSku: boolean;
  footer: string;
  headerMessage?: string;
  documentTitle?: string;
}

export interface SaleTrendSet {
  labels: string[];
  sales: number[];
  orders: number[];
}

export interface PnlMonth {
  month: string;
  revenue: number;
  cogs: number;
  expenses: number;
}

export interface CashierPerformance {
  name: string;
  role: Role;
  orders: number;
  sales: number;
  avgOrder: number;
  refunds: number;
}

export interface Setting {
  id: string;
  key: string;
  value: string | number | boolean | object;
  category: string;
  description?: string;
  updatedAt: string;
}
