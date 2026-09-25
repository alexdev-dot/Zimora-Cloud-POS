import {
  Banknote,
  Barcode,
  BarChart3,
  Bell,
  Boxes,
  CircleHelp,
  CreditCard,
  CupSoda,
  Cpu,
  Droplets,
  Factory,
  Home,
  LayoutDashboard,
  Lock,
  Package,
  Percent,
  Plug,
  ReceiptText,
  Settings,
  Shield,
  Smartphone,
  Split,
  Store,
  Truck,
  UserCog,
  Users,
  UtensilsCrossed,
  Wallet,
  Tag,
  type LucideIcon,
} from "lucide-react";
import type {
  Branch,
  Business,
  ReceiptSettings,
  AppNotification,
  Employee,
  Supplier,
  PaymentMethod,
  PermissionAction,
  PermissionModule,
} from "@/types";

export const APP_NAME = "Zimora Cloud POS";

/* ── Navigation ───────────────────────────────────────────────────── */

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Terminal", href: "/terminal", icon: Lock },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Point of Sale", href: "/pos", icon: Store },
      { label: "Sales", href: "/sales", icon: ReceiptText },
      { label: "Products", href: "/products", icon: Package },
      { label: "Categories", href: "/categories", icon: Tag },
      { label: "Inventory", href: "/inventory", icon: Boxes },
      { label: "Purchases", href: "/purchases", icon: Truck },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Customers", href: "/customers", icon: Users },
      { label: "Suppliers", href: "/suppliers", icon: Factory },
      { label: "Employees", href: "/employees", icon: UserCog },
      { label: "Expenses", href: "/expenses", icon: Wallet },
    ],
  },
  {
    title: "Insights",
    items: [
      { label: "Reports", href: "/reports", icon: BarChart3 },
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Help & Support", href: "/help", icon: CircleHelp },
    ],
  },
];

export const FLAT_NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/settings")) return "Settings";
  const match = [...FLAT_NAV]
    .sort((a, b) => b.href.length - a.href.length)
    .find((n) => pathname === n.href || pathname.startsWith(n.href + "/"));
  return match?.label ?? "Dashboard";
}

/* ── Catalog meta ─────────────────────────────────────────────────── */



export const PAYMENT_META: Record<
  PaymentMethod,
  { label: string; icon: LucideIcon; className: string }
> = {
  cash: { label: "Cash", icon: Banknote, className: "text-emerald-700 bg-emerald-50" },
  mpesa: { label: "M-Pesa", icon: Smartphone, className: "text-emerald-700 bg-emerald-50" },
  card: { label: "Card", icon: CreditCard, className: "text-sky-700 bg-sky-50" },
  split: { label: "Split", icon: Split, className: "text-violet-700 bg-violet-50" },
};

export const EXPENSE_CATEGORIES = [
  "Rent",
  "Utilities",
  "Transport",
  "Salaries",
  "Supplies",
  "Marketing",
  "Maintenance",
  "Other",
] as const;

export const UNITS = ["pc", "pack", "box", "kg", "ltr", "carton"] as const;

/* ── Roles & permissions ──────────────────────────────────────────── */

export const PERMISSION_MODULES: { id: PermissionModule; label: string }[] = [
  { id: "sales", label: "Sales" },
  { id: "products", label: "Products" },
  { id: "inventory", label: "Inventory" },
  { id: "customers", label: "Customers" },
  { id: "reports", label: "Reports" },
  { id: "expenses", label: "Expenses" },
  { id: "employees", label: "Employees" },
  { id: "settings", label: "Settings" },
];

export const PERMISSION_ACTIONS: PermissionAction[] = [
  "view",
  "create",
  "edit",
  "delete",
  "export",
];

// TODO: These helper functions should be moved to your backend API
// when implementing dynamic role management
type Matrix = Record<PermissionModule, Record<PermissionAction, boolean>>;

export function createPermissionMatrix(
  spec: Partial<Record<PermissionModule, PermissionAction[]>>
): Matrix {
  const out = {} as Matrix;
  for (const m of PERMISSION_MODULES) {
    out[m.id] = { view: false, create: false, edit: false, delete: false, export: false };
    for (const a of spec[m.id] ?? []) out[m.id][a] = true;
  }
  return out;
}

/**
 * Create a full permissions matrix with all actions enabled
 */
export function createFullPermissionsMatrix(): Matrix {
  const fullSpec: any = {};
  PERMISSION_MODULES.forEach(m => {
    fullSpec[m.id] = ALL_PERMISSIONS;
  });
  return createPermissionMatrix(fullSpec);
}

export const ALL_PERMISSIONS: PermissionAction[] = ["view", "create", "edit", "delete", "export"];

// TODO: Remove this - role presets should be stored in your database
// and fetched via API. This is kept for reference during migration.
export const DEFAULT_ROLE_PRESETS: Record<string, Matrix> = {
  // Example: These should be migrated to your database
  // Owner: createPermissionMatrix(
  //   Object.fromEntries(PERMISSION_MODULES.map((m) => [m.id, ALL_PERMISSIONS])) as never
  // ),
};

// Role presets for employee management (temporary until moved to database)
export const ROLE_PRESETS: Record<string, Matrix> = {
  Owner: createPermissionMatrix({
    sales: ALL_PERMISSIONS,
    products: ALL_PERMISSIONS,
    inventory: ALL_PERMISSIONS,
    customers: ALL_PERMISSIONS,
    reports: ALL_PERMISSIONS,
    expenses: ALL_PERMISSIONS,
    employees: ALL_PERMISSIONS,
    settings: ALL_PERMISSIONS,
  }),
  Manager: createPermissionMatrix({
    sales: ALL_PERMISSIONS,
    products: ["view", "create", "edit"],
    inventory: ALL_PERMISSIONS,
    customers: ALL_PERMISSIONS,
    reports: ALL_PERMISSIONS,
    expenses: ["view", "create"],
    employees: ["view"],
    settings: ["view"],
  }),
  Cashier: createPermissionMatrix({
    sales: ALL_PERMISSIONS,
    products: ["view"],
    inventory: ["view"],
    customers: ["view", "create"],
    reports: ["view"],
    expenses: [],
    employees: [],
    settings: [],
  }),
};

/* ── Settings nav ─────────────────────────────────────────────────── */

export const SETTINGS_NAV: {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
}[] = [
  { label: "General", href: "/settings", icon: Settings, description: "App preferences, currency & regional formats" },
  { label: "Business", href: "/settings/business", icon: Home, description: "Business profile, KRA PIN & branding" },
  { label: "Locations", href: "/settings/locations", icon: Factory, description: "Branches & storage locations" },
  { label: "Taxes", href: "/settings/taxes", icon: Percent, description: "VAT rates & tax configuration" },
  { label: "Users & Roles", href: "/settings/users", icon: UserCog, description: "Team access & role permissions" },
  { label: "Barcode Generator", href: "/settings/barcode", icon: Barcode, description: "Create & print product barcode labels" },
  { label: "Receipt and Invoice Templates", href: "/settings/receipts", icon: ReceiptText, description: "Design your receipts and invoices with live preview" },
  { label: "Payments", href: "/settings/payments", icon: Smartphone, description: "M-Pesa, cards & cash drawer" },
  { label: "Integrations", href: "/settings/integrations", icon: Plug, description: "Connect third-party tools" },
  { label: "Notifications", href: "/settings/notifications", icon: Bell, description: "Choose what you get alerted about" },
  { label: "Security", href: "/settings/security", icon: Shield, description: "Password, 2FA, sessions & audit log" },
];

/* ── Chart palette ────────────────────────────────────────────────── */

export const CHART_COLORS = {
  primary: "#0F766E",
  sky: "#0284C7",
  amber: "#D97706",
  violet: "#7C3AED",
  slate: "#64748B",
  rose: "#E11D48",
  emerald: "#059669",
};

export const DONUT_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.sky,
  CHART_COLORS.amber,
  CHART_COLORS.violet,
  CHART_COLORS.slate,
  CHART_COLORS.rose,
];

/* ── Default Data ─────────────────────────────────────────────────── */

export const branches: Branch[] = [
  {
    id: "main",
    name: "Main Branch",
    area: "Downtown",
    city: "Nairobi",
    address: "123 Main Street",
    isMain: true,
    status: "open"
  }
];

export const currentUser = {
  id: "owner",
  name: "Owner",
  email: "owner@example.com",
  role: "Owner",
  avatar: null,
};

export const business: Business = {
  name: "",
  legalName: "",
  type: "",
  kraPin: "",
  email: "",
  phone: "",
  address: "",
  website: "",
  currency: "KES",
  currencySymbol: "KSh",
  timezone: "Africa/Nairobi",
  dateFormat: "DD/MM/YYYY",
  taxInclusive: true,
};

export const defaultReceiptSettings: ReceiptSettings = {
  template: "classic",
  width: "80mm",
  showLogo: true,
  showCashier: true,
  showTax: true,
  showBarcode: true,
  showQR: false,
  showCustomer: true,
  showBusinessInfo: true,
  showPaymentDetails: true,
  showItemSku: false,
  footer: "Thank you for shopping with us!",
  headerMessage: "Official Receipt",
  documentTitle: "RECEIPT",
} as const;

export const notifications: AppNotification[] = [];

export const employees: Employee[] = [
  {
    id: "owner",
    employeeNo: "EMP001",
    name: "Owner",
    role: "Owner",
    email: "owner@example.com",
    phone: "+254700000000",
    branch: "Main Branch",
    status: "active",
    lastActive: new Date().toISOString(),
    permissions: {
      sales: { view: true, create: true, edit: true, delete: true, export: true },
      products: { view: true, create: true, edit: true, delete: true, export: true },
      inventory: { view: true, create: true, edit: true, delete: true, export: true },
      customers: { view: true, create: true, edit: true, delete: true, export: true },
      reports: { view: true, create: true, edit: true, delete: true, export: true },
      expenses: { view: true, create: true, edit: true, delete: true, export: true },
      employees: { view: true, create: true, edit: true, delete: true, export: true },
      settings: { view: true, create: true, edit: true, delete: true, export: true }
    }
  }
];

export const suppliers: Supplier[] = [
  {
    id: "default",
    name: "Default Supplier",
    contactPerson: "Contact Person",
    phone: "+254700000000",
    email: "supplier@example.com",
    supplies: "General Products",
    products: 0,
    outstanding: 0,
    status: "active"
  }
];
