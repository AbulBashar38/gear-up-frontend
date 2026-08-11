# GearUp Frontend

GearUp is a role-based sports and outdoor equipment rental marketplace. Customers search gear and request rentals, providers manage inventory and fulfillment, and admins operate users, categories, listings, orders, payments, and review moderation.

## Stack

- Next.js 16.2 App Router, React 19, strict TypeScript
- Tailwind CSS 4 and code-owned accessible UI components
- Native server-side `fetch`, Server Actions, Zod, and HttpOnly JWT cookies
- Cloudinary signed server uploads for gear galleries
- Stripe hosted Checkout through the GearUp Express/Prisma backend

## Implemented flows

- Public landing page, paginated catalog, keyword/category/brand/price filters, and date-aware availability search
- Gear details with up to four images, specifications, reviews, availability state, and rental CTA
- Customer/provider registration, login, logout, access-token refresh, and role-aware route protection
- Customer rental requests, order/payment history, Stripe success/cancel/failure handling, and returned-order reviews
- Provider inventory CRUD, gallery upload, dashboard metrics, and inline order fulfillment actions
- Admin platform totals, user search/role/status filters, status management, admin creation, categories, all gear/orders/payments, and review moderation

The exact frontend-to-endpoint map and error/cache behavior are documented in [API_INTEGRATION.md](./API_INTEGRATION.md).

## Local setup

Requirements: Node.js 20+, npm, a running GearUp backend, PostgreSQL for the backend, Stripe test credentials/webhook forwarding, and Cloudinary credentials for image uploads.

```bash
npm install
cp .env.example .env
npm run dev
```

The frontend runs at `http://localhost:3000`. The default `.env.example` points to `http://localhost:8080/api`.

For this workspace's backend reference:

```bash
cd backend
npm install
npx prisma migrate deploy
npm run dev
```

The current frontend depends on the included backend extension for `GET /gear` keyword/date/active-stock filters and the `imageUrls` gallery field. Apply the migration before testing those flows.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEARUP_API_URL` | Yes | Server-only API base including `/api` |
| `GEARUP_CURRENCY` | Yes | Display currency matching backend Stripe configuration |
| `CLOUDINARY_CLOUD_NAME` | For uploads | Server-only Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | For uploads | Server-only Cloudinary API key |
| `CLOUDINARY_API_SECRET` | For uploads | Server-only signing secret |
| `CLOUDINARY_GEAR_FOLDER` | No | Optional upload folder |

Never prefix backend URLs, JWTs, Stripe secrets, or Cloudinary secrets with `NEXT_PUBLIC_`.

## Verification

```bash
npm run lint
npm run build
cd backend && npm run build
```

The repository currently has no automated test suite; lint, strict TypeScript production builds, API smoke tests, and manual role/Stripe walkthroughs are the verification path.

## Stripe return behavior

The frontend never treats `session_id` as payment proof. It stores the backend order/payment references in a short-lived HttpOnly cookie before redirecting to Stripe, then polls the authenticated order while the signed webhook updates payment truth. If that context is missing, the success route asks the customer to inspect their API-backed order status and does not claim payment was received.

## Demo access

A dedicated review account is published on the sign-in screen so the admin
experience can be explored without provisioning anything. The sign-in form also
offers a one-click fill for it.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin+23247886@example.com` | `12345678Aa#` |

This is a shared assessment account, not a personal or production login. It is
defined in [`src/lib/demo-credentials.ts`](./src/lib/demo-credentials.ts);
rotating it means editing that file and redeploying. It must exist as an
`ACTIVE` admin on whichever backend the deployed frontend points at — verify it
against the deployed stack, not only locally.

## Deployment checklist

- Deploy the backend and apply all Prisma migrations, including the gear gallery migration.
- Set the backend `APP_URL` to the deployed frontend so Stripe return URLs are correct.
- Configure the deployed Stripe webhook and verify a real test Checkout lifecycle.
- Configure all server-only frontend environment variables.
- Create the grading admin above on the deployed backend and confirm it can sign in there.
- Add the deployed frontend URL and record the required 7–10 minute walkthrough video.

Beyond the shared demo account documented above, do not commit real credentials. The deployed URL and video link are submission artifacts and are intentionally not fabricated in this repository.
