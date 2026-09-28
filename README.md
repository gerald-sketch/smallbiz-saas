# SmallBiz — Small Business Management SaaS

One platform for small businesses to manage their entire operation:
inventory, POS, purchasing, suppliers, customers, staff, expenses, and reporting.

Built for the Philippine market — VAT-inclusive pricing, PayMongo billing
(GCash / Maya / cards), peso formatting throughout.

## Stack

| Layer      | Technology                                                           |
| ---------- | -------------------------------------------------------------------- |
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query  |
| Backend    | Node.js, Express 5, TypeScript                                       |
| Database   | PostgreSQL 16, Prisma 7 (driver adapter)                             |
| Validation | Zod — shared schemas between frontend and backend                    |
| Auth       | JWT (15-min access + 7-day refresh), bcrypt, HTTP-only cookies, RBAC |
| Payments   | PayMongo (hosted checkout + HMAC-verified webhooks)                  |
| Structure  | npm workspaces monorepo                                              |

## Modules

- **Auth** — register, login, refresh, logout, RBAC (OWNER / MANAGER / STAFF)
- **Dashboard** — today's sales, MTD revenue, inventory value, low stock, recent activity
- **POS** — cart, discounts, cash tender + change, receipt printing, idempotent checkout
- **Products** — CRUD, categories, pricing, soft delete
- **Inventory** — stock in/out/adjust, low-stock alerts, row-level locking
- **Customers** — profiles, purchase history, loyalty points
- **Suppliers** — directory, contact info, purchase history
- **Purchases** — purchase orders, receive-to-stock-in flow
- **Employees** — staff accounts, role management
- **Expenses** — categorized operating costs, monthly totals
- **Reports** — sales summary (day/week/month), P&L, inventory valuation, top products, CSV export
- **Billing** — PayMongo subscription plans (Free / Starter / Pro)

## Engineering Highlights

These are the parts worth reading the code for:

- **Idempotency keys on every write** — client generates a UUID per operation; the
  server stores the response and replays it on retry. Double-clicking "Checkout"
  cannot create two sales.
- **Row-level locking on stock** — `SELECT ... FOR UPDATE` inside a transaction,
  with deterministic lock ordering to prevent deadlocks. Concurrent checkouts
  serialize correctly and stock never goes negative.
- **HMAC-verified webhooks** — raw body preserved via `express.raw()`, signature
  compared with `timingSafeEqual`, events deduplicated by ID. Responds 200 before
  processing so PayMongo never retries unnecessarily.
- **Multi-tenancy from day one** — every query filters by `businessId`. No
  retrofit, no accidental cross-tenant leaks.
- **VAT-inclusive pricing** — per Philippine BIR standard, the shelf price includes
  VAT; the VAT portion is extracted for reporting rather than added on top.

## Project Structure
