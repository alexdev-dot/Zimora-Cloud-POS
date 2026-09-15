# Zimora Cloud POS — Point of Sale & Retail Management SaaS

A production-quality **Next.js 14 + TypeScript + Tailwind CSS** frontend for a modern
POS SaaS platform, designed for supermarkets, retail shops, restaurants and pharmacies
in Kenya (M-Pesa-first payments, KSh currency, EAT timezone).

![Stack](https://img.shields.io/badge/Next.js-14-black) ![TS](https://img.shields.io/badge/TypeScript-strict-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000 → redirects to /dashboard
```

Production:

```bash
npm run build && npm start
```

## Feature map

| Area | Highlights |
| --- | --- |
| **Dashboard** | 5 KPI cards with period deltas, sales/orders analytics chart (Today · 7D · 30D · 12M), payment mix donut, recent sales table, top products, quick actions, CSV export |
| **Point of Sale** | Two-pane till: searchable product grid + category tabs + barcode scan dialog (press `/` to search), sticky cart with customer picker, discounts, VAT; Cash / **M-Pesa STK push** / Card / **Split** payment flows; printable receipt success modal; stock-aware quantity limits; mobile cart sheet |
| **Sales** | Filterable history (payment, status, cashier, branch), detail drawer with receipt preview, refund flow, CSV export, deep-linkable (`/sales?order=…`) |
| **Products** | Sortable/filterable table + grid view, bulk select (export/archive/delete), full add/edit form with validation, detail sheet with barcode, duplicate/archive actions |
| **Inventory** | Stock valuation KPIs, status/location filters, receive/adjust/transfer dialogs that write a transaction log, stock count session, full history tab |
| **Purchases** | PO list & detail, receive stock, draft PO builder, status lifecycle |
| **Customers / Suppliers** | Loyalty profiles, purchase history, type badges; supplier directory with outstanding balances |
| **Employees** | Role badges, status filters, permission matrix editor (8 modules × 5 actions), role presets, deactivate/reactivate confirmations |
| **Expenses** | Summary KPIs, category donut, full CRUD with receipt-attachment placeholder, CSV export |
| **Reports** | 6 tabs — Sales, Products, Inventory, P&L (12-month bar chart + table), Expenses, Employees; CSV/PDF/print actions |
| **Notifications** | Filterable center (stock/payments/refunds/system), unread states, mark-all-read |
| **Settings** | 11 sections: General (KES/EAT), Business profile, Locations, Taxes, Users & Roles, **Barcode generator** (EAN13/CODE128/UPC/CODE39 label sheets), **Receipt template designer** with live preview, Payments (M-Pesa Daraja), Integrations (secrets write-only), Notifications prefs, Security (2FA, sessions, audit log) |

## UX system

- **Design tokens** — teal primary (`hsl(174 76% 24%)`), light-gray canvas, soft borders, `shadow-card`/`shadow-pop` elevation scale, 10px radius scale.
- **States everywhere** — skeleton loaders (`useSimulatedLoading`), empty states with actions, error states with retry, destructive-action confirmation dialogs.
- **Keyboard & a11y** — `⌘K` global search, `/` focuses POS search, focus rings, `aria-*` on sort/tabs/dialogs/radiogroups, skip-to-content link, semantic tables with `aria-sort`.
- **Responsive** — sidebar → drawer under `lg`, tables → card lists under `md` (`mobileCard` per table), sticky mobile cart bar + sheet on POS, touch-sized targets.
- **Toasts** — Sonner for every mutating action (no `alert()` anywhere).

## Architecture

```
app/(app)/…            13 route groups sharing AppShell (sidebar + header + ⌘K search)
app/settings/…         settings sections with secondary nav layout
components/
  ui/                  primitives: Button, Input/FormField, Dialog, Sheet, DropdownMenu,
                       Tabs, Switch, Checkbox, Badge, Table, Card, Tooltip, Skeleton
  layout/              Sidebar, TopHeader, GlobalSearch, AppShell
  shared/              DataTable (sort/filter/paginate/select/mobile cards), MetricCard,
                       ChartCard, PageHeader, StatusBadge, SearchInput, FilterBar,
                       ConfirmationDialog, states (Empty/Error/Skeleton), Receipt, Barcode
  pos/ products/ sales/ charts/ dashboard/ settings/   feature components
lib/data/              centralized typed mock data (swap for API calls later)
lib/utils.ts           formatting (KSh, dates), CSV download, avatar tones
lib/constants.ts       nav, category/payment meta, role permission presets
types/index.ts         Product, Sale, Customer, Employee, InventoryTransaction, Expense,
                       PurchaseOrder, Supplier, Business, Branch, PermissionMatrix…
```

**Data layer** is centralized and typed (`lib/data/*`), imported by pages via hooks and
local state — components never hardcode values, so replacing the mocks with Supabase /
REST / Server Actions is a drop-in change per page.

## Database & POS logic (implemented & validated)

The production database architecture and POS transaction engine live in [`db/`](db/) and
are documented in **[`docs/architecture.md`](docs/architecture.md)**:

- `db/schema.sql` — 22-table PostgreSQL/Supabase schema: multi-tenant (RLS on every
  table), ledger-based inventory, per-branch stock & order numbering, price/cost
  snapshots, permission matrix as data, M-Pesa STK state machine, exactly-once webhooks
- `db/run-tests.mjs` — **61-check validation suite** (PostgreSQL 18 via PGlite, no server
  needed): cash/split sales, idempotency, oversell guards, refunds, stock ops,
  M-Pesa lifecycle incl. callback replay, role/branch isolation under RLS
- `db/grants.sql` — non-superuser app role (Supabase `authenticated` analogue)
- `db/seed.sql` — Zimora demo tenant: 3 branches, 5 roles, permissions, catalog, stock

```bash
cd db && npm install && node run-tests.mjs   # → RESULT: 61 passed, 0 failed
```


## Printing

Receipts, barcode labels and reports use a `.print-area` CSS print isolation —
`Print receipt`, `Print labels` and `Print report` print only the relevant surface at
80mm/58mm receipt widths.
