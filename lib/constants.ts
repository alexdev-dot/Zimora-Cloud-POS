import {
  Activity,
  Banknote,
  Barcode,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  CircleHelp,
  CreditCard,
  CupSoda,
  Cpu,
  Droplets,
  Factory,
  FileText,
  Headphones,
  Home,
  Key,
  LayoutDashboard,
  Lock,
  Package,
  Percent,
  Plug,
  ReceiptText,
  Settings,
  Shield,
  ShieldCheck,
  Smartphone,
  Split,
  Store,
  TrendingUp,
  Truck,
  UserCog,
  UserPlus,
  Users,
  UtensilsCrossed,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type {
  Branch,
  Business,
  ReceiptSettings,
  AppNotification,
  Employee,
  Supplier,
  Category,
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

export const CATEGORY_META: Record<
  Category,
  { icon: LucideIcon; tile: string; badge: string; dot: string }
> = {
  Beverages: {
    icon: CupSoda,
    tile: "bg-sky-50 text-sky-700 ring-sky-100",
    badge: "bg-sky-50 text-sky-700 ring-1 ring-sky-200/70",
    dot: "bg-sky-500",
  },
  Food: {
    icon: UtensilsCrossed,
    tile: "bg-amber-50 text-amber-700 ring-amber-100",
    badge: "bg-amber-50 text-amber-800 ring-1 ring-amber-200/70",
    dot: "bg-amber-500",
  },
  Electronics: {
    icon: Cpu,
    tile: "bg-slate-100 text-slate-600 ring-slate-200/60",
    badge: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    dot: "bg-slate-500",
  },
  Household: {
    icon: Home,
    tile: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70",
    dot: "bg-emerald-500",
  },
  "Personal Care": {
    icon: Droplets,
    tile: "bg-rose-50 text-rose-700 ring-rose-100",
    badge: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/70",
    dot: "bg-rose-500",
  },
  Other: {
    icon: Package,
    tile: "bg-violet-50 text-violet-700 ring-violet-100",
    badge: "bg-violet-50 text-violet-700 ring-1 ring-violet-200/70",
    dot: "bg-violet-500",
  },
};

export const CATEGORIES = Object.keys(CATEGORY_META) as Category[];

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
  Administrator: createPermissionMatrix({
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
  "Inventory Manager": createPermissionMatrix({
    sales: ["view"],
    products: ALL_PERMISSIONS,
    inventory: ALL_PERMISSIONS,
    customers: ["view"],
    reports: ["view"],
    expenses: ["view"],
    employees: [],
    settings: ["view"],
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

/* ── Admin navigation ─────────────────────────────────────────────── */

export const ADMIN_NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "System Health", href: "/admin/health", icon: Activity },
    ],
  },
  {
    title: "Tenant Management",
    items: [
      { label: "All Tenants", href: "/admin/tenants", icon: Building2 },
      { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
      { label: "Onboarding", href: "/admin/onboarding", icon: UserPlus },
    ],
  },
  {
    title: "User Management",
    items: [
      { label: "Admin Users", href: "/admin/users", icon: Users },
      { label: "Support and Ticketing", href: "/admin/staff", icon: Headphones },
      { label: "Permissions", href: "/admin/permissions", icon: ShieldCheck },
      { label: "Audit Logs", href: "/admin/audit", icon: FileText },
    ],
  },
  {
    title: "System Operations",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { label: "Reports", href: "/admin/reports", icon: TrendingUp },
      { label: "Notifications", href: "/admin/notifications", icon: Bell },
      { label: "Maintenance", href: "/admin/maintenance", icon: Wrench },
    ],
  },
  {
    title: "Configuration",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
      { label: "Integrations", href: "/admin/integrations", icon: Plug },
      { label: "API Management", href: "/admin/api", icon: Key },
      { label: "Security", href: "/admin/security", icon: Shield },
    ],
  },
];

export const ADMIN_FLAT_NAV: NavItem[] = ADMIN_NAV_GROUPS.flatMap((g) => g.items);

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
  id: "admin",
  name: "Administrator",
  email: "admin@example.com",
  role: "Administrator",
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
    id: "admin",
    employeeNo: "EMP001",
    name: "Administrator",
    role: "Administrator",
    email: "admin@example.com",
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
