# Deployment Guide

This guide covers taking Apex Pulse from local development to a production deployment.

---

## 1. Architecture overview

- **Frontend + API routes**: Next.js 15 (App Router) — deploy to **Vercel**.
- **Database**: PostgreSQL — use **Railway**, **Neon**, **Supabase**, or a self-managed VPS.
- **File storage**: Cloudinary (no separate infra needed).
- **Email**: Resend (or SMTP via Nodemailer as a fallback).
- **Payments**: Stripe (Checkout + webhook) and Razorpay (Orders API + webhook).

Because Next.js API routes run alongside the frontend on Vercel, you generally **don't need a
separate Express backend or Railway service for the app itself** — only for the database (unless
you use a managed Postgres provider like Neon/Supabase, in which case you don't need Railway at
all). Railway is listed as an option for teams that prefer a single dashboard for both Postgres
and a containerized deployment, or that want to self-host outside Vercel.

---

## 2. Database setup

Pick one:

- **Neon** (recommended for Vercel — serverless Postgres, generous free tier): create a project,
  copy the pooled connection string into `DATABASE_URL`.
- **Supabase**: create a project, use the connection string under Settings → Database →
  Connection string → URI (use the "Transaction" pooler string for serverless compatibility).
- **Railway**: add a Postgres plugin to a project, copy `DATABASE_URL` from its Variables tab.
- **Self-managed VPS**: install Postgres 15+, create a database and user, and use a
  `postgresql://user:password@host:5432/dbname` connection string.

Once you have a `DATABASE_URL`, run migrations against it:

```bash
DATABASE_URL="your-production-url" npx prisma migrate deploy
DATABASE_URL="your-production-url" npx prisma db seed   # optional — creates demo accounts
```

`prisma migrate deploy` (not `migrate dev`) is the correct command for production — it applies
existing migrations without prompting or generating new ones.

---

## 3. Deploying the frontend + API to Vercel

1. Push this repository to GitHub/GitLab/Bitbucket.
2. In Vercel, "Add New Project" → import the repository.
3. Framework preset: Next.js (auto-detected).
4. Add every variable from `.env.example` under Project Settings → Environment Variables. At minimum:
   - `DATABASE_URL`
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (generate with `openssl rand -hex 32`)
   - `NEXT_PUBLIC_APP_URL` — set this to your real production URL (e.g. `https://apexpulse.com`)
   - `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_EMAIL`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
5. Deploy. Vercel runs `npm install` (which triggers `prisma generate` via `postinstall`) then
   `npm run build`.
6. After the first deploy, run `prisma migrate deploy` against the production database (from your
   local machine or a CI step) — Vercel's build step does **not** run migrations automatically by
   design, so this stays a deliberate action.

### Custom domain
Add your domain under Project Settings → Domains, then update `NEXT_PUBLIC_APP_URL` and
`COOKIE_DOMAIN` to match, and redeploy so emails/links use the correct URL.

---

## 4. Alternative: self-hosted (Railway / VPS)

If you'd rather not use Vercel:

```bash
npm install
npm run build
npm run start   # serves on port 3000 by default; put a reverse proxy (Nginx/Caddy) in front
```

On a VPS, use a process manager so the app survives reboots and crashes:

```bash
npm install -g pm2
pm2 start npm --name apex-pulse -- start
pm2 save
pm2 startup
```

Put Nginx or Caddy in front for TLS termination (Let's Encrypt) and to serve on port 443. A
minimal Nginx reverse proxy:

```nginx
server {
    listen 443 ssl;
    server_name apexpulse.com;
    ssl_certificate     /etc/letsencrypt/live/apexpulse.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/apexpulse.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

On Railway specifically: create a new service from the repo, set the start command to
`npm run build && npm run start`, and attach the Postgres plugin — Railway injects `DATABASE_URL`
automatically if you reference it as `${{Postgres.DATABASE_URL}}`.

---

## 5. Payments — webhook setup (required for orders to mark as PAID)

Both gateways confirm payment via webhook, not just the client-side redirect — this is
intentional so a closed browser tab or flaky connection never leaves an order stuck as PENDING
after money has actually moved.

### Stripe
1. Dashboard → Developers → Webhooks → **Add endpoint**.
2. Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
3. Events to send: `checkout.session.completed`, `checkout.session.async_payment_failed`,
   `checkout.session.expired`.
4. Copy the **Signing secret** into `STRIPE_WEBHOOK_SECRET`.
5. Test locally with the Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

### Razorpay
1. Dashboard → Settings → Webhooks → **Add new webhook**.
2. Webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
3. Active events: `payment.captured`.
4. Set a webhook secret and copy it into `RAZORPAY_WEBHOOK_SECRET`.

Note: the app also verifies Razorpay payments synchronously via `/api/payments/razorpay/verify`
right after checkout, so the webhook acts as a redundant safety net rather than the only
confirmation path (unlike Stripe Checkout, which relies on the webhook as the source of truth).

---

## 6. Post-deploy checklist

- [ ] `prisma migrate deploy` run against the production database
- [ ] Seed data run once if you want demo accounts (`prisma db seed`) — **remove or change the
      seeded passwords before going live publicly**
- [ ] Stripe + Razorpay webhooks registered and secrets set
- [ ] `NEXT_PUBLIC_APP_URL` matches your real domain (affects email links, Stripe redirect URLs,
      sitemap)
- [ ] Cloudinary credentials set (avatar upload will otherwise return a clear "not configured"
      error instead of failing silently — check `/dashboard/profile`)
- [ ] `ADMIN_EMAIL` set so form submissions and new support tickets notify a real inbox
- [ ] Visit `/sitemap.xml` and `/robots.txt` to confirm they resolve on the production domain
- [ ] Change the default seeded admin passwords, or delete the seeded accounts entirely, before
      any real traffic hits the site

---

## 7. CI suggestion (optional)

A minimal GitHub Actions workflow to run type-checking and linting on every PR:

```yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npx prisma generate
      - run: npx tsc --noEmit
      - run: npm run lint
```

Add a deploy step (`vercel --prod` with a Vercel token, or `railway up`) once you've picked a
host, gated on the check job passing.
