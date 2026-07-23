# Apex Pulse — Premium SaaS Platform

Built in phases. This package contains **all 5 phases**: Foundation & Auth, Marketing Frontend,
User Dashboard, Admin Panel, and Payments/Performance/Deployment.

**Going to production?** See `DEPLOYMENT.md` for the full deployment guide (Vercel, database
hosting, Stripe/Razorpay webhook setup, and a post-deploy checklist).

## What's included

### Phase 1 — Foundation & Auth
- Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS scaffold
- Complete Prisma schema (all models for every future phase — additive only, no breaking migrations later)
- Full JWT authentication: register, login, logout, refresh, email verification, forgot/reset password, change password
- httpOnly secure cookies, bcrypt password hashing, JWT access + refresh token rotation
- Role-Based Access Control middleware (SUPER_ADMIN, ADMIN, EMPLOYEE, CUSTOMER)
- Per-IP rate limiting on sensitive auth routes
- Zod validation on every form/API input
- Audit logging (who did what, when)
- Email sending via Resend (falls back to SMTP, then console logging in dev)

### Phase 2 — Marketing Frontend
- **Design system**: dark theme, glassmorphism, animated aurora gradient background with noise
  texture, cursor glow, sticky glass navbar, magnetic buttons, scroll-reveal animations, page
  transitions, loading screen — all built with Framer Motion
- **Pages**: Home, About, Services, Pricing (with monthly/yearly toggle), Blog (list + detail),
  FAQ (accordion), Careers (with application form), Contact (with honeypot spam protection),
  Testimonials, Gallery, Case Studies (list + detail), Privacy Policy, Refund Policy,
  Terms & Conditions, custom 404
- **All content is database-driven** — plans, blog posts, testimonials, FAQs, gallery items, and
  case studies are fetched from Postgres via Prisma, not hardcoded. The seed script populates
  real starting content for every one of these.
- **7 functional forms**, each validated with Zod, rate-limited, and saved to the database:
  Contact, Newsletter, Career, Callback, Feedback, Lead, Complaint — with admin email
  notifications on submission
- **SEO**: dynamic metadata per page, OpenGraph/Twitter cards, `sitemap.xml` (includes DB-driven
  blog/case-study routes), `robots.txt`
- Responsive down to mobile, keyboard-focus visible, `prefers-reduced-motion` respected on the
  cursor glow effect

### Phase 3 — User Dashboard
- **Layout**: sidebar navigation (desktop) + horizontal tab bar (mobile), unread-notification badge
- **Overview**: account status, order/invoice/ticket/notification stats, recent orders
- **Profile**: edit name/phone, avatar upload via Cloudinary (with graceful "not configured" message
  if Cloudinary env vars are missing)
- **Settings**: change password (revokes all other sessions), self-service account deletion
  (password-confirmed, soft-delete preserving billing history)
- **Notifications**: list, mark individually or all as read
- **Orders**: full order history with plan, gateway, and status
- **Invoices**: invoice history with status and PDF download link (when available)
- **Support tickets**: list, create, and a full reply thread per ticket — reopens automatically if
  a customer replies to a resolved ticket

### Phase 4 — Admin Panel
- **Layout**: role-gated (`SUPER_ADMIN`/`ADMIN`) sidebar with grouped navigation, mobile dropdown nav
- **Dashboard**: revenue chart (last 6 months, Recharts), user/order/ticket/lead stats, recent orders
- **Users**: search, filter by role, inline role change, activate/deactivate — with a
  privilege-escalation guard (only Super Admin can modify Admin-level accounts, and no one can
  deactivate their own account)
- **Orders & Invoices**: full read-only tables with status filters
- **Plans & Coupons**: full CRUD with modal forms
- **Blog & Case Studies**: full CMS CRUD (the same content the Phase 2 public pages render)
- **Testimonials, Reviews (moderation queue), FAQs, Gallery**: full CRUD
- **Leads**: unified inbox for every public form submission, with a status pipeline
  (New → Contacted → Qualified → Lost/Converted)
- **Newsletter** (with CSV export) and **Careers**: read-only review lists
- **Support Tickets**: admin/employee list, full thread view, assign to staff, change
  status/priority, reply (auto-emails the customer, auto-moves OPEN → IN_PROGRESS on first reply)
- **Audit Logs**: paginated, filterable trail of every admin action (who did what, when)

**Not yet built** (deferred — flagged honestly rather than faked): a generic "Pages" editor for
static homepage/about section content, a dedicated Media Library UI (Gallery covers the image-grid
use case but isn't a general file browser), a dedicated SEO Settings UI, and Backup/Restore (a
infrastructure-level feature — pg_dump/restore tooling — rather than a CRUD screen). These are
good candidates for a Phase 6 if you need them.

### Phase 5 — Payments, Email Templates, Performance & Deployment
- **Stripe**: hosted Checkout Sessions (`/api/payments/stripe/checkout`), webhook-confirmed
  (`/api/webhooks/stripe`, verifies signature) — the webhook is the source of truth for marking an
  order PAID, not the client redirect, so a closed tab never leaves money collected but the order
  stuck as PENDING
- **Razorpay**: Orders API (`/api/payments/razorpay/order`) + client-side checkout widget +
  synchronous signature verification (`/api/payments/razorpay/verify`), with a webhook
  (`/api/webhooks/razorpay`) as a redundant confirmation path
- **Coupons**: applied server-side at checkout time for both gateways (`src/lib/pricing.ts`) —
  validates active/expiry/redemption-limit before computing the discounted price
- **Checkout flow**: `/checkout?plan=slug&cycle=monthly|yearly` → plan summary + coupon field →
  pay with either gateway → `/checkout/success` (polls order status — Stripe confirms via webhook
  so this can take a few seconds) or `/checkout/cancel`
- **Order finalization is idempotent** (`src/lib/orders.ts`) — safe against webhook retries;
  creates the Payment record, generates a sequential Invoice, increments coupon redemption, emails
  a receipt, and creates an in-app notification, all in one transaction
- **Email templates**: refactored onto one shared branded layout (`src/lib/email.ts`) — every
  transactional email (verification, password reset, payment receipt, ticket reply, admin form
  notification) now shares consistent visual identity instead of being unstyled snippets
- **Performance**: security headers configured at the framework level (`next.config.ts` — the
  Next.js equivalent of Helmet: X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
  Permissions-Policy, HSTS), response compression enabled, `X-Powered-By` header removed, ISR
  caching added to the public plan-lookup API
- **Deployment**: see `DEPLOYMENT.md` — covers Vercel + managed Postgres (Neon/Supabase/Railway),
  a self-hosted VPS/Railway path with PM2 + Nginx, Stripe/Razorpay webhook registration steps, a
  post-deploy checklist, and an optional CI workflow

## Roadmap

| Phase | Contents |
|---|---|
| **1 ✅** | Foundation, database schema, JWT auth, RBAC |
| **2 ✅** | Marketing frontend, animation system, CMS-driven content, public forms, SEO |
| **3 ✅** | User dashboard — profile, settings, notifications, invoices, orders, support |
| **4 ✅** | Admin panel — analytics, users/roles, CMS editor, leads, support tickets, audit logs |
| **5 ✅** | Payments (Stripe/Razorpay), email templates, performance hardening, deployment guide |

**All five phases are now complete.** See `DEPLOYMENT.md` for going live.

## Setup

### 1. Prerequisites
- Node.js 20+
- A PostgreSQL database (local, [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app) all work)

### 2. Install
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```
Fill in at minimum:
- `DATABASE_URL` — your Postgres connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — any long random strings (`openssl rand -hex 32`)

Everything else (Resend, Cloudinary, Stripe, Razorpay) is optional for Phase 1 — the app degrades
gracefully and logs emails to the console if `RESEND_API_KEY` isn't set.

### 4. Run migrations + seed
```bash
npx prisma migrate dev --name init
npx prisma db seed
```
This creates all tables and prints 4 test logins to your terminal (password for all: `Password123`):
- `superadmin@apexpulse.com`
- `admin@apexpulse.com`
- `employee@apexpulse.com`
- `customer@apexpulse.com`

### 5. Start the dev server
```bash
npm run dev
```
Visit `http://localhost:3000`.

## Testing payments (Phase 5)

Requires test-mode credentials in `.env` (Stripe test keys / Razorpay test keys) — payments won't
work without them, but the app tells you clearly ("Stripe isn't configured yet…") rather than
failing silently.

1. Go to `/pricing`, click "Get started" on any plan → lands on `/checkout?plan=...&cycle=...`.
2. Try the coupon code `LAUNCH20` (seeded, 20% off) in the coupon field — the discount is applied
   server-side when payment is initiated, so you'll see it reflected in the amount charged and the
   resulting invoice rather than live in the UI as you type.
3. **Stripe**: click "Pay with Stripe" → redirects to Stripe's hosted Checkout (use test card
   `4242 4242 4242 4242`, any future expiry/CVC) → redirects back to `/checkout/success`, which
   polls until the webhook confirms the order (needs the Stripe CLI forwarding webhooks locally —
   see `DEPLOYMENT.md` §5).
4. **Razorpay**: click "Pay with Razorpay" → opens the Razorpay checkout widget (use Razorpay's
   test card numbers) → verifies synchronously, no webhook wait needed locally.
5. Check `/dashboard/orders` and `/dashboard/invoices` — the new order/invoice should appear
   immediately after either flow completes.
6. Check `/admin/orders` and `/admin/coupons` — the coupon's `redeemedCount` should have
   incremented.

## Testing the admin panel (Phase 4)

Log in as `admin@apexpulse.com` or `superadmin@apexpulse.com` (password `Password123`), then visit `/admin`:
1. `/admin` — dashboard shows revenue chart and stats from seeded orders/leads/tickets.
2. `/admin/users` — search, filter by role, change a user's role, deactivate/reactivate. Try
   changing `admin@apexpulse.com`'s role while logged in as `admin@apexpulse.com` — it should be
   blocked (`only a Super Admin can modify admin-level accounts`).
3. `/admin/plans`, `/admin/coupons`, `/admin/blog`, `/admin/case-studies`, `/admin/testimonials`,
   `/admin/faqs`, `/admin/gallery` — create, edit, and delete records; changes should appear
   immediately on the corresponding public page (e.g. edit a plan, then check `/pricing`).
4. `/admin/reviews` — approve the seeded pending review, then check it appears on `/testimonials`.
5. `/admin/leads` — filter by form type/status, change a lead's status.
6. `/admin/support` — open the seeded tickets, reply as an admin (this reopens/advances the
   ticket and emails the customer), assign a ticket to `employee@apexpulse.com`.
7. `/admin/audit-logs` — every action above should appear here with the acting admin's identity.

## Testing the dashboard (Phase 3)

Log in as `customer@apexpulse.com` (password `Password123`):
1. `/dashboard` — overview shows 1 paid order, 1 invoice, 1 open support ticket, 1 unread notification.
2. `/dashboard/profile` — update your name/phone; try uploading an avatar (needs `CLOUDINARY_*` env vars, otherwise shows a clear "not configured" message instead of failing silently).
3. `/dashboard/settings` — change password (logs you out everywhere); try the account-deletion flow (soft-deletes, requires password confirmation).
4. `/dashboard/notifications` — mark one as read, then "mark all as read".
5. `/dashboard/orders` and `/dashboard/invoices` — seeded records should be visible.
6. `/dashboard/support` — open the seeded ticket, reply to it; create a new ticket via "New ticket".

## Testing the marketing site + forms

1. Visit `/` — hero, features, DB-driven pricing preview, and testimonials should render (from seed data).
2. Visit `/blog`, `/case-studies`, `/gallery`, `/faq`, `/testimonials` — all pull from Postgres.
3. Submit `/contact` — creates a `Lead` row (`formType: "contact"`) and emails `ADMIN_EMAIL` if set.
4. Submit the newsletter form in the footer — upserts a `NewsletterSubscriber`.
5. Submit `/careers` application form — creates a `CareerApplication` row.
6. Check `/sitemap.xml` and `/robots.txt`.

## Testing the auth flow end-to-end

1. Go to `/register`, create an account → check your terminal (or inbox, if Resend is configured)
   for the verification email/link.
2. Click the verification link → lands on `/verify-email` → account is now verified.
3. Go to `/login` → sign in → redirected to `/dashboard` (protected route, enforced by
   `src/middleware.ts`).
4. Try visiting `/dashboard` in an incognito window (no cookie) → redirected to `/login`.
5. On `/dashboard`, click "Sign out" → session revoked in the database, cookies cleared.
6. Try `/forgot-password` → `/reset-password?token=...` to test the reset flow.

## Project structure

```
src/
  app/
    api/auth/          # register, login, logout, refresh, me, verify-email,
                        # forgot-password, reset-password, change-password
    login/ register/ verify-email/ forgot-password/ reset-password/
    dashboard/          # minimal protected page (full UI in Phase 3)
    layout.tsx  page.tsx  globals.css
  lib/
    auth.ts             # JWT signing/verification, cookie helpers
    prisma.ts           # Prisma client singleton
    email.ts             # Resend/SMTP email sending + templates
    tokens.ts             # secure random token generation/hashing
    rate-limit.ts         # in-memory rate limiter
    validations/auth.ts    # Zod schemas
  middleware.ts           # RBAC route protection
prisma/
  schema.prisma           # full data model (all phases)
  seed.ts                 # seed script
```

## Notes on the Prisma schema

The schema already defines models for content (blog, CMS pages, testimonials, gallery, case studies,
FAQs), commerce (plans, coupons, orders, payments, invoices), and support (tickets, notifications,
leads) — even though only the auth-related models (`User`, `Session`, `Token`, `AuditLog`) are wired
into the app in Phase 1. This is intentional: it means Phase 2–5 only ever **add** functionality on
top of this schema, and you'll never need a destructive migration as the project grows.

## A note on `prisma generate` in restricted/offline environments

`prisma generate` downloads a small query-engine binary from `binaries.prisma.sh` the first time it
runs. If you're behind a firewall that blocks that domain, set
`PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` in your shell, or allow that domain — this is unrelated
to the app code and won't be an issue on a normal machine with internet access.
