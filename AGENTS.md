<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# GearUp Frontend Agent Guide

## Mission

Build a polished frontend for the GearUp sports and outdoor equipment rental API in this repository. Customers discover gear and request rentals, providers manage their inventory and fulfill orders, and admins operate the platform.

This is a frontend assignment. The sibling `backend/` directory is a read-only contract/reference unless the user explicitly asks for backend work. The sibling `example-frontend/` directory is the instructor's read-only teaching reference; learn from its patterns but do not edit or copy it wholesale. Never change the backend merely to make a frontend assumption work. If a required product capability is not supported, document the gap and ask before expanding scope.

Never replace a real API operation with hardcoded success data, browser-only CRUD, an invented endpoint, or a fake payment result.

## Sources of truth

Resolve conflicts in this order:

1. The user's current request.
2. The assignment requirements in the supplied brief.
3. The actual backend implementation under `backend/src/` and `backend/prisma/schema/`.
4. `backend/GearUp Backend - Complete Assignment Scenarios.postman_collection.json`.
5. `backend/README.md`.
6. The installed Next.js documentation under `node_modules/next/dist/docs/`.
7. `example-frontend/` for instructor-preferred frontend patterns only, never for GearUp API facts.
8. Existing frontend conventions and this guide.

The route/service code wins if backend documentation is stale. Do not infer payloads or permissions from endpoint names alone; inspect the route, validation, controller, and service together.

Before changing framework behavior, read the relevant Next.js 16 guide. Useful starting points are:

- `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`
- `node_modules/next/dist/docs/01-app/02-guides/authentication.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md`
- `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/12-images.md`

## Current repositories and stack

### Frontend

- Next.js `16.2.12`, App Router, React `19.2.4`
- Strict TypeScript; application files must be `.ts`/`.tsx`
- Tailwind CSS v4 via `@import "tailwindcss"`
- Native Next.js-enhanced `fetch` for all backend data access; do not add TanStack Query or SWR by default
- Source root `src/`; alias `@/*` maps to `src/*`
- npm and the committed `package-lock.json`
- Checks: `npm run lint` and `npm run build`

The frontend began as a minimal Create Next App starter. Inspect `package.json` before assuming a query library, form library, component library, validation library, test runner, or Stripe browser SDK exists.

### Instructor reference: what to follow

The instructor's `example-frontend/` demonstrates the intended Next.js style. Adapt these patterns to `src/` and the GearUp domain:

- Use native `fetch` from async Server Components and server-only service functions.
- Use Server Actions (`"use server"`) for form submissions and authenticated mutations.
- Use React `useActionState` in small Client Components for pending state and action results.
- Keep JWTs in HttpOnly cookies read through async `cookies()` from `next/headers`.
- Use Next.js 16 `proxy.ts` for optimistic route redirects.
- Use route groups and nested layouts to separate public, auth, and dashboard shells without changing URLs.
- Build query strings with `URLSearchParams`; place shareable search/filter/pagination state in the URL.
- Stream async lists through Suspense and purpose-built skeleton components.
- Use cache tags and server-side invalidation after successful mutations when the data is actually cacheable.
- Configure role-specific navigation from typed arrays instead of scattering role checks through JSX.
- Use a root toast provider and action-result toasts; preserve inline form/page errors too.
- Prefer code-owned UI primitives, a `cn` utility, variant-based buttons, Lucide icons, and accessible dialog/sidebar/dropdown components. Shadcn/Radix and Sonner are appropriate if added to this project.

The example is instructional, not production-complete. Do **not** copy these shortcuts:

- Do not put backend `JWT_ACCESS_SECRET` or `JWT_REFRESH_SECRET` in the frontend. This GearUp frontend must never possess backend signing secrets.
- Do not perform token refresh, subscription/API fetching, or other slow network work in Proxy.
- Do not cache `/auth/me` or private user data globally for a day.
- Do not combine `cache: "no-cache"` with a contradictory `next.revalidate` policy.
- Do not assume `res.json()` succeeds or that a JSON `success` field replaces checking `res.ok`.
- Do not use `any`, suppress type errors, log form payloads, or leave hardcoded sample records in real flows.
- Do not copy the example's news roles, routes, endpoints, secret names, or response types into GearUp.
- Do not forward tokens through ad hoc `Cookie` strings from every action; centralize Bearer forwarding in the GearUp server API client.
- Do not copy its `cacheComponents` setting, image host allowlist, or `unoptimized` image usage without a GearUp-specific need and the relevant local Next.js documentation.

### Backend contract

- Express 5 REST API; default local origin `http://localhost:8080`
- API prefix: `/api`
- PostgreSQL/Prisma data model
- JWT access and refresh tokens
- Auth accepts an `accessToken` cookie or `Authorization: Bearer <token>`
- Roles: `CUSTOMER`, `PROVIDER`, `ADMIN`
- Stripe hosted Checkout; payment truth is updated by signed Stripe webhooks
- Success responses use `{ success, statusCode, message, data, meta? }`
- Errors use `{ success: false, statusCode, name?, message, errorDetails?, stack? }`

The frontend should use one server-only base URL such as `GEARUP_API_URL=http://localhost:8080/api`. Do not expose it as `NEXT_PUBLIC_*` unless direct browser access is deliberately required. Keep `.env` untracked and document safe placeholders in `.env.example`.

## Mandatory assignment deliverables

The application is not complete until all of these are satisfied:

1. All backend capabilities required by the selected frontend flows are genuinely integrated. Maintain `API_INTEGRATION.md` with exact frontend consumer-to-endpoint mappings.
2. Every API error has structured, friendly UI feedback: field errors, action toasts, persistent page errors, retry controls, and error boundaries as appropriate.
3. The final history has at least 20 meaningful frontend commits with descriptive Conventional Commit messages. Do not manufacture empty or misleading commits.
4. The submission provides a working deployed demo admin email/password. Use a dedicated grading account, verify it against the deployed stack, and never publish a personal/production credential.
5. The frontend uses the backend's real Stripe Checkout flow and handles both `/payment/success` and `/payment/cancel`. Fake payments, COD, Pay Later, or client-authored paid states are forbidden.
6. The deployed app and talking points are ready for the separately graded 7–10 minute walkthrough video. The assignment calls the list “six requirements” while numbering five; treat the video deliverable as the sixth unless the user says otherwise.

## Backend-backed product rules

### Roles and account states

Use these exact enums:

```ts
type Role = "CUSTOMER" | "PROVIDER" | "ADMIN";
type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
type RentalOrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PAID"
  | "PICKED_UP"
  | "RETURNED"
  | "CANCELLED";
type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";
```

Public registration is only for `CUSTOMER` and `PROVIDER`. Although the request validator recognizes the `ADMIN` enum, the auth service rejects public admin registration with `403`. Never offer ADMIN in the public registration UI. An existing admin creates another admin through `POST /api/users/admins`.

Inactive or suspended users cannot log in, refresh, or access protected endpoints. Show the backend's friendly account-state message and clear the local session when appropriate.

### Role capabilities

| Capability | Customer | Provider | Admin |
| --- | :---: | :---: | :---: |
| Public gear/categories/reviews | Yes | Yes | Yes |
| Create and view own orders/payments | Yes | No | No |
| Cancel own eligible unpaid order | Yes | No | No |
| Create/update/delete own review | Yes | No | Delete only |
| Create/update/delete own gear | No | Yes | No |
| View orders/payments for owned gear | No | Yes | No |
| Progress eligible orders | No | Yes | Yes |
| Manage all gear/orders/payments | No | No | Yes |
| Manage users, admins, and categories | No | No | Yes |

The backend automatically scopes `GET /orders`, `GET /orders/:id`, `GET /payments`, and `GET /payments/:id` by the authenticated role. Do not invent `/customer/*`, `/provider/*`, or `/admin/*` API paths.

Provider gear inventory uses public `GET /gear?providerId=<current-user-id>`; mutations are ownership-checked by the backend. Admin gear creation requires an active provider's ID. Admins can get eligible providers with `GET /users?role=PROVIDER&status=ACTIVE`.

### Rental lifecycle

The backend transition map is exact:

```text
PLACED ──> CONFIRMED ──> PAID ──> PICKED_UP ──> RETURNED
   │            │
   └────────────┴──────> CANCELLED
```

- A customer creates a `PLACED` order.
- A provider/admin can move `PLACED` to `CONFIRMED` or `CANCELLED`.
- A customer can cancel their own `PLACED` or `CONFIRMED` order, but cannot perform any other transition.
- `PAID` is webhook-only. No frontend status request may set `PAID`.
- A provider/admin moves `PAID` to `PICKED_UP`, then `PICKED_UP` to `RETURNED`.
- Returned and cancelled orders are terminal.
- A confirmed order with an open Stripe session can only be cancelled through the status endpoint; the backend verifies/expires the Stripe session first.

Expose buttons from this transition map plus the current role. Still handle `409` because state or inventory can change between render and click.

Use status badges with text as well as color:

| Status | Suggested visual meaning | Action owner |
| --- | --- | --- |
| `PLACED` | Amber, awaiting provider | Provider/admin confirms or either party cancels where permitted |
| `CONFIRMED` | Blue, ready for payment | Customer pays or cancels; provider/admin may cancel |
| `PAID` | Purple, paid and ready | Provider/admin marks picked up |
| `PICKED_UP` | Green, in customer possession | Provider/admin marks returned |
| `RETURNED` | Neutral gray, complete | Customer may review |
| `CANCELLED` | Red, closed | No action |

### Dates, quantity, and availability

- Create orders with `YYYY-MM-DD` date strings and integer `quantity >= 1`.
- The backend converts dates to midnight UTC and charges inclusively: same-day rental is one day.
- The backend calculates `rentalDays` and `totalPrice`; the frontend may preview but must display the authoritative returned total.
- The frontend must prevent past start dates and end-before-start. The current backend validates ordering but does not reject past dates, so do not omit this UI guard.
- Stock is date-aware on order creation and again on confirmation. Only `CONFIRMED`, `PAID`, and `PICKED_UP` reserve stock; `PLACED` does not.
- A placed order is a request awaiting confirmation, not a guaranteed reservation. Write UI copy accordingly.
- There is no date-availability lookup endpoint. Do not claim live availability before order creation. Let the customer select dates and map a backend `409` to clear availability feedback.
- `isAvailable=false` or `stock=0` prevents rental creation/confirmation.

### Prices and serialized data

Prisma decimal fields such as `pricePerDay`, `totalPrice`, `amount`, and `rating` may arrive serialized as strings. Model the wire format defensively and convert only through shared parsing/formatting helpers. Do not use truthy/string concatenation arithmetic. Dates arrive as ISO timestamps except order create inputs, which are date-only strings.

## Authentication architecture

Use a same-origin Next.js session/BFF adapter. This follows the useful login/Server Action/cookie pattern from the instructor example while correcting its secret-handling and Proxy-refresh shortcuts:

1. The browser submits login/register to a Next Route Handler or Server Action.
2. That server code calls backend `/auth/login` or `/auth/register`.
3. The backend returns access and refresh JWTs in `data`; store them in frontend-domain `HttpOnly`, `Secure` (production), `SameSite=Lax` cookies. Do not return them to client JavaScript.
4. Server Components, Server Actions, and Route Handlers call the backend through one server-only API helper, forwarding the access JWT as a Bearer token.
5. On access-token `401`, refresh through `/auth/refresh-token`, rotate the frontend access cookie, and retry at most once from a context allowed to set cookies. Server Actions and Route Handlers can do this directly. A Server Component that cannot mutate cookies should redirect through a narrow same-origin refresh Route Handler with a sanitized return path and a loop guard. If refresh fails, clear the session and require login.
6. Logout calls `/auth/logout` where useful and always clears the frontend-domain auth cookies.

Why: cookies set directly by a separately hosted backend belong to the backend domain and are invisible to the frontend's Next.js Proxy. A same-origin adapter enables protected Next routes without exposing tokens in localStorage. Do not mix this design with random direct browser calls using a second auth store.

In Next.js 16, Middleware is named Proxy. Use `src/proxy.ts`, not `middleware.ts`, for quick optimistic redirects based on frontend session-cookie presence. Unlike the instructor example, Proxy must not refresh tokens or call GearUp endpoints; it is not the security boundary. A backend JWT can be decoded for optimistic routing, but the frontend does not have the signing secret and must not pretend it verified the token. Validate `/auth/me` and backend authorization near protected data/mutations.

Suggested route handling:

- Guests accessing `/dashboard/:path*` go to `/auth/login?returnTo=<safe-internal-path>`.
- Authenticated users entering `/auth/login` or `/auth/register` go to their role dashboard.
- Wrong-role dashboard access goes to the actor's own dashboard or `/unauthorized`.
- Sanitize `returnTo`; never redirect to an arbitrary external URL.
- For mutations, rely on backend role/ownership checks even when the button is hidden.

Protect same-origin mutation endpoints against CSRF using `SameSite` cookies, framework origin checks, and explicit origin validation where needed. Never expose backend JWT secrets, Stripe secrets, refresh tokens, or access tokens to client components or `NEXT_PUBLIC_*` variables.

## Exact backend API contract

Base path below is `/api`.

### Common envelopes

```ts
type ApiSuccess<T> = {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number };
};

type ApiFailure = {
  success: false;
  statusCode: number;
  name?: string;
  message: string;
  errorDetails?: unknown;
  stack?: string;
  path?: string;
  date?: string;
};
```

Zod validation failures are currently HTTP `400` with `message: "Validation failed"` and `errorDetails: Array<{ path: string; message: string }>`; they are not `422`. Normalize these paths into inline form errors. Other failures include `401`, `403`, `404`, `409`, `502`, and `500`. The backend not-found middleware has a slightly different shape, so the API adapter must tolerate both.

### Authentication

| Method and path | Access | Input | Frontend use |
| --- | --- | --- | --- |
| `POST /auth/register` | Public | `{ name, email, phone, password, role }`; role is customer or provider | Create account and establish session |
| `POST /auth/login` | Public | `{ email, password }` | Establish session; response data has both JWTs |
| `POST /auth/logout` | Public | No body | Clear backend cookies; frontend adapter also clears its cookies |
| `POST /auth/refresh-token` | Public | `{ refreshToken }` or backend cookie | Refresh access JWT |
| `GET /auth/me` | Authenticated | None | Canonical current user with id/name/email/phone/role/status/timestamps |

Password minimum is six characters. Name is required. Phone must match `^\+?[0-9\s-]{7,20}$`. Email and phone are unique; duplicates return `409`.

### Categories

| Method and path | Access | Input/query | Frontend use |
| --- | --- | --- | --- |
| `GET /categories` | Public | None | Filters and gear forms |
| `POST /categories` | Admin | `{ name }` | Admin category creation |
| `PATCH /categories/:id` | Admin | `{ name }` | Admin rename |
| `DELETE /categories/:id` | Admin | UUID path | Delete only when no gear uses category |

Category name is 2–255 characters. Deleting a used category returns `409` with the associated gear count; show that message and guide the admin to reassign/delete gear first.

### Gear

| Method and path | Access | Input/query | Frontend use |
| --- | --- | --- | --- |
| `GET /gear` | Public | `providerId?`, `category?`, `brand?`, `price?`, `minPrice?`, `maxPrice?`, `page=1`, `limit=10` | Catalog, provider inventory, admin listing |
| `GET /gear/:id` | Public | UUID path | Detail page; includes category, provider, newest reviews |
| `POST /gear` | Provider/Admin | Gear body below | Provider/admin create |
| `PATCH /gear/:id` | Owner provider/Admin | Any non-empty subset of editable fields | Edit listing |
| `DELETE /gear/:id` | Owner provider/Admin | UUID path | Delete listing after confirmation |

Create body:

```ts
{
  categoryId: string;
  providerId?: string; // admin must supply; provider should omit
  name: string;        // 2–255 chars
  description: string; // at least 10 chars
  stock?: number;      // non-negative integer, defaults to 0
  isAvailable?: boolean;
  pricePerDay: number; // > 0
  imageUrl?: string | null; // URL only; backend has no file-upload endpoint
  brand?: string | null;
}
```

The assignment mentions advanced search and availability-date filters, but this backend supports neither text search nor date filtering on `GET /gear`. Implement the supported category/brand/price/provider filters honestly. Do not filter one page client-side and label it global search. A real global search/date filter requires a separately approved backend enhancement.

### Orders and Checkout

| Method and path | Access | Input/query | Frontend use |
| --- | --- | --- | --- |
| `GET /orders` | Customer/Provider/Admin | `status?`, `paymentStatus?`, `page=1`, `limit=10` | Role-scoped order lists and dashboard counts |
| `POST /orders` | Customer | `{ gearItemId, startDate, endDate, quantity }` | Place rental request |
| `GET /orders/:id` | Customer/Provider/Admin | UUID path | Role-scoped order detail/payment verification |
| `PATCH /orders/:id/status` | Customer/Provider/Admin | `{ status }`; allowed request values follow the transition rules above | Valid role/state transition |
| `POST /orders/:id/checkout-session` | Customer owner | No body | Create/reuse hosted Stripe Checkout |
| `POST /orders/webhook` | Stripe only | Raw signed body | Never call from frontend |

Order creation returns:

```ts
{
  orderId: string;
  status: "PLACED";
  startDate: string;
  endDate: string;
  rentalDays: number;
  quantity: number;
  totalPrice: string | number;
  paymentStatus: "PENDING";
}
```

Checkout is allowed only while the owned order is `CONFIRMED` and its payment is `PENDING`. Its response is:

```ts
{
  orderId: string;
  paymentId: string;
  paymentStatus: "PENDING";
  stripeSessionId: string;
  checkoutUrl: string;
  reused: boolean;
}
```

The backend reuses an existing open session and uses the payment ID as Stripe's idempotency key. An expired session changes payment to `FAILED` and order to `CANCELLED`. A completed session awaiting webhook processing returns a conflict instead of creating another session.

### Payments

| Method and path | Access | Input/query | Frontend use |
| --- | --- | --- | --- |
| `GET /payments` | Customer/Provider/Admin | `status?`, `page=1`, `limit=10` | Role-scoped payment history/counts |
| `GET /payments/:id` | Customer/Provider/Admin | UUID path | Role-scoped payment detail |

There is no frontend payment-create endpoint under `/payments`, no endpoint that looks up a payment by Stripe session ID, and no client confirmation endpoint. Checkout begins only at `/orders/:id/checkout-session`; webhook processing is authoritative.

### Reviews

| Method and path | Access | Input/query | Frontend use |
| --- | --- | --- | --- |
| `GET /reviews` | Public | `gearItemId?`, `rating?`, `page=1`, `limit=10` | Public reviews |
| `GET /reviews/:id` | Public | UUID path | Review detail/edit bootstrap |
| `POST /reviews` | Customer | `{ orderId, rating, comment? }` | Review returned order |
| `PATCH /reviews/:id` | Customer owner | Non-empty `{ rating?, comment? }` | Edit own review |
| `DELETE /reviews/:id` | Customer owner/Admin | UUID path | Delete own/moderate review |

Rating is 1–5 in 0.1 steps. Comment, when present, is 3–2000 characters. Only a returned, owned order can be reviewed and each order can have one review; conflicts return `409`. The backend does not provide a direct `customerId` review filter, so a “my reviews” view must derive links from owned returned orders or use data already available to the authenticated flow without pretending the public list is user-scoped.

### Admin users

| Method and path | Access | Input/query | Frontend use |
| --- | --- | --- | --- |
| `GET /users` | Admin | `search?`, `role?`, `status?`, `page=1`, `limit=10` | User management/provider selection/counts |
| `GET /users/:id` | Admin | UUID path | User detail |
| `POST /users/admins` | Admin | `{ name, email, phone, password }` | Create grading/operations admin |
| `PATCH /users/:id/status` | Admin | `{ status }`; active, inactive, or suspended | Account status management |

User search covers name, email, and phone. The backend prevents an admin from making their own account inactive/suspended. Keep the control disabled for the signed-in admin and still handle `409`.

## Frontend information architecture

Frontend paths may evolve for better UX; they do not need to mimic API paths. Maintain role-specific dashboard shells and link every reachable action consistently.

### Public and auth

- `/` — original branded landing page, value proposition, featured/recent gear from `GET /gear`
- `/gear` — paginated catalog with supported category, brand, and price filters in URL search params
- `/gear/[id]` — gallery, description, stock/availability flag, provider, reviews, rental CTA
- `/auth/login` — login plus safe return path
- `/auth/register` — customer/provider registration only, including required phone
- `/unauthorized` and root `not-found.tsx`

### Customer

- `/dashboard/customer` — real summary and recent orders/payments
- `/dashboard/customer/orders` — own role-scoped paginated history/filtering
- `/dashboard/customer/orders/[id]` — detail, cancel/pay/review action according to status
- `/dashboard/customer/orders/[id]/pay` — order review and real Checkout initiation
- `/dashboard/customer/payments` — role-scoped payment history
- `/dashboard/customer/reviews/[id]/edit` — optional owned review edit experience
- `/payment/success` and `/payment/cancel` — Stripe return experiences

### Provider

- `/dashboard/provider` — counts and actionable recent orders
- `/dashboard/provider/gear` — `GET /gear?providerId=<me.id>` inventory
- `/dashboard/provider/gear/new`
- `/dashboard/provider/gear/[id]/edit`
- `/dashboard/provider/orders` — role-scoped order table and valid transitions
- `/dashboard/provider/payments` — role-scoped payments for own gear

### Admin

- `/dashboard/admin` — platform overview derived from real paginated totals
- `/dashboard/admin/users` and optional `/users/[id]`
- `/dashboard/admin/categories`
- `/dashboard/admin/gear` plus create/edit flows; admin selects an active provider
- `/dashboard/admin/orders`
- `/dashboard/admin/payments`
- `/dashboard/admin/reviews` for review moderation
- `/dashboard/admin/admins/new` for protected admin creation when appropriate

Do not create dead routes just to match this list. A smaller number of well-composed dashboard routes with tabs is acceptable if every required capability is discoverable, responsive, and URL-addressable where useful.

## Dashboard data strategy

The backend has no dedicated statistics endpoint. Derive exact counts from `meta.total` using small paginated requests, preferably in parallel:

- Admin: `/users?limit=1`, `/gear?limit=1`, `/orders?limit=1`, `/payments?limit=1`.
- Provider inventory: `/gear?providerId=<me.id>&limit=1`.
- Provider pending orders: `/orders?status=PLACED&limit=1`.
- Provider active rentals: combine totals for `PAID` and `PICKED_UP` through separate requests because the API accepts one status at a time.
- Customer status cards: use separate scoped `/orders?status=<status>&limit=1` requests only for cards that add value.

Do not compute platform totals from the length of one paginated page. Avoid a wall of requests: select a few useful metrics and stream/cache appropriately.

## Stripe return flow for this backend

This flow must match the implemented backend exactly:

1. Customer opens an owned `CONFIRMED` order.
2. Frontend calls `POST /orders/:id/checkout-session` with no amount/body.
3. Before redirecting, retain the returned `orderId` and `paymentId` as short-lived same-origin pending-checkout context. Prefer a secure server-set cookie; session storage is an acceptable fallback but must not be the only way to navigate back to orders.
4. Validate that `checkoutUrl` is HTTPS and hosted by the expected Stripe Checkout host before redirecting.
5. Stripe returns to `/payment/success?session_id=...` or `/payment/cancel?order_id=...` because those URLs are hardcoded by the backend from its `APP_URL`.
6. On success, use the saved order/payment IDs to poll/refetch `GET /orders/:id` and/or `GET /payments/:id` for a short bounded period while the webhook changes payment `PENDING -> COMPLETED` and order `CONFIRMED -> PAID`.
7. Never treat `session_id` itself as proof. The current backend cannot query by session ID from the frontend.
8. If webhook processing is delayed, show “Payment confirmation is processing; check your order status shortly” and a link to orders. Do not claim failure or paid status without the API.
9. On `/payment/cancel`, explain that leaving Checkout does not automatically cancel the order. Offer “Retry payment” (which reuses the open session), “Back to order,” and a separate explicit “Cancel rental” action that calls `PATCH ... { status: "CANCELLED" }`.
10. Clear pending-checkout context after a verified terminal result or explicit cancellation.

No Stripe.js dependency is needed for backend-created hosted Checkout unless the implementation deliberately uses it for redirect behavior. Never use a Stripe secret key in the frontend.

## Native fetch, Server Actions, and caching

Native `fetch` is the project standard, matching the instructor example and the assignment. Do not install TanStack Query, SWR, Axios, or a global API-state store unless the user later requests it or a concrete need cannot be met cleanly with Next.js fetch, Server Actions, and revalidation.

Create one typed fetch boundary under `src/lib/api/` (or `src/services/` if that convention is established):

- `server-client.ts` — server-only `gearupFetch<T>()`, base URL joining, Bearer forwarding, refresh coordination
- `types.ts` — success/failure envelopes and domain wire types
- `errors.ts` — safe parsing and normalized UI errors
- `auth.ts`, `categories.ts`, `gear.ts`, `orders.ts`, `payments.ts`, `reviews.ts`, `users.ts` — feature fetch functions
- Colocated route `_actions/` files — thin Server Actions for forms/mutations that call feature functions and invalidate affected UI

The shared fetch function must:

- Use only the server-only `GEARUP_API_URL` and mark server-only modules with `import "server-only"` where appropriate.
- Join the configured `/api` base URL without duplicate/missing slashes.
- Accept typed method, body, query, headers, auth requirement, cache policy, tags, and `AbortSignal` options.
- Build query strings with `URLSearchParams`, never string concatenation. Omit empty values; the backend rejects empty `search`, `category`, and `brand`.
- Set `Content-Type: application/json` only when a JSON body exists.
- Forward the access JWT as `Authorization: Bearer <token>` from the server cookie; do not repeat raw Cookie-header construction in each feature action.
- Check `response.ok` **and** the envelope's `success` flag.
- Read response text safely and parse JSON conditionally so HTML/empty gateway failures become a normalized error instead of a second exception.
- Normalize failures into `{ status, code?, message, fieldErrors?, retryable }`.
- Map `errorDetails[{ path, message }]` to fields after stripping a leading `body.` where necessary.
- Retry authentication at most once and only where cookies can legally be updated; never create a refresh loop.
- Never log tokens, passwords, form payloads, card data, cookies, or sensitive user data.

### Read pattern

- Keep pages/layouts as Server Components by default.
- Put reusable reads in server-only feature services and call them from the async component that needs the data.
- Wrap independent slow lists/cards in Suspense with domain-shaped skeletons, as the instructor example does.
- Render a distinct empty state only for a successful empty response. A failed request must render error UI, not “no items found.”
- Use URL `searchParams` as the input for catalog/table filters and pagination; pass normalized values to service functions.
- Use `Promise.all` for independent dashboard count calls.

### Mutation and form pattern

- Put `"use server"` actions close to their route in `_actions/` when route-specific; share only genuinely reusable actions/services.
- Parse and validate `FormData` on the server before calling the backend. Do not send `$ACTION_*` fields from a blind `Object.fromEntries()` payload.
- Verify the authenticated user/role inside every protected action even though Proxy and the UI already guard the route.
- Return a discriminated action state such as `{ success, message, fieldErrors?, data? }` for expected API/validation errors.
- In the smallest practical Client Component, use `useActionState` to show pending UI, inline errors, and a success/error toast. Disable the submit control while pending.
- Use `bind` for trusted route IDs when convenient, but treat every bound/hidden ID as untrusted and let the backend enforce ownership.
- After success, close/reset dialogs deliberately, invalidate the affected data, and redirect only when the workflow calls for it.
- Sanitize all redirect targets and payment URLs before calling `redirect()` or assigning browser location.

### Cache policy for GearUp

Next.js 16 fetches are not assumed cached. Choose an explicit policy based on the data; do not reproduce the example's blanket one-day profile cache.

- `/auth/me`, protected orders, protected payments, users, dashboard totals, checkout creation, and all payment-return polling: use `cache: "no-store"`.
- Public categories: may use a moderate revalidation window and tag `categories`.
- Public gear lists/details: favor freshness because stock/availability changes; either use `no-store` or a short revalidation window with `gear` and `gear:<id>` tags.
- Public reviews: may use a short revalidation window with `reviews` and `reviews:<gearId>` tags.
- Mutating fetch requests must not be cached.
- Never combine `cache: "no-store"`/`"no-cache"` with `next.revalidate` on the same request.

For cached data in Next.js 16:

- Assign tags through `next: { tags: [...] }` on the fetch call.
- In a Server Action, use `updateTag(tag)` when the actor must immediately read their own write.
- In a Route Handler, use `revalidateTag(tag, "max")` for stale-while-revalidate, or `{ expire: 0 }` only when immediate expiration is truly required.
- Do not use the deprecated single-argument `revalidateTag(tag)` form.
- Use `revalidatePath()` when route output outside tagged fetches also needs regeneration.

Typical invalidation:

| Mutation | Invalidate or refresh |
| --- | --- |
| Gear create/update/delete | `gear`, affected `gear:<id>`, provider/admin inventory paths |
| Category create/update/delete | `categories`; also `gear` if displayed category information changed |
| Order create/status change | Relevant customer/provider/admin order paths; protected order reads are no-store |
| Review create/update/delete | `reviews`, `reviews:<gearId>`, `gear:<gearId>`, relevant order path |
| User status/admin creation | Admin user/dashboard paths; protected reads are no-store |
| Checkout return | No cache tags; poll/refetch order/payment with no-store |

Limits must be 1–100 and pages positive integers. Debounce URL updates for text search where supported, preserve the other existing query parameters, and reset `page` when a filter changes.

## `API_INTEGRATION.md`

Create this file early and update it in the same commit as integrations. It must contain:

- Actual backend base URL variable name and deployment URL.
- The Next BFF/session-cookie architecture and refresh behavior.
- One row for every consumed endpoint: method/path, frontend route/component, role, request/query, response fields used, loading/empty/error UI, and invalidation/refetch behavior.
- The native fetch cache policy and tags used by each cacheable public request; private requests should record `no-store`.
- Stripe Checkout response, pending context, return parameters, webhook polling, and cancel semantics.
- Known backend limitations: no gear text search, no date-availability endpoint, no stats endpoint, no session-ID payment lookup, no image upload endpoint.
- Any deliberate frontend route changes.

Do not list suggested assignment endpoints that the application does not call.

## Error, loading, validation, and empty states

Every asynchronous feature must deliberately handle loading, success, empty, and failure.

- Use `loading.tsx` skeletons for data-heavy route segments and granular Suspense boundaries for slower cards/tables.
- Add route-level `error.tsx` boundaries with the current Next.js 16 retry API from local docs.
- Use `notFound()` for genuinely missing detail resources and root `not-found.tsx` for unknown routes.
- Expected form/API failures should be returned as typed UI state, not thrown into a generic boundary.
- Use inline field errors with `aria-invalid` and `aria-describedby`.
- Use toasts for mutation success/failure; keep page/form failures persistently visible as well.
- Disable only the submitting action, show progress, and prevent duplicate checkout/order/status requests.
- Confirm gear deletion, category deletion, user status changes, order cancellation, review deletion, and other consequential actions.
- Empty catalog results, inventories, orders, payments, reviews, categories, and users need purposeful messages and next steps.

Important mappings:

- `400`: validation/bad request; map `errorDetails` to fields where possible.
- `401`: attempt the single refresh path; otherwise clear session and redirect to login.
- `403`: wrong role, suspended/inactive account, or ownership restriction; do not retry.
- `404`: resource missing or inaccessible under role scope.
- `409`: duplicate identity, unavailable stock, invalid order transition, existing review, category in use, self-suspension, or checkout state conflict. Show the backend message in sanitized user-friendly form and refetch stale data.
- `502`: Stripe could not be reached/verified; keep order state authoritative and offer retry.
- `500`: generic service problem with retry/support guidance; never show stack output.

## Form constraints

- Registration: name required, valid email, phone pattern from backend, password at least six characters, customer/provider role only.
- Login: valid email and password at least six characters.
- Category: trimmed name 2–255 characters.
- Gear: name 2–255, description at least 10, non-negative integer stock, positive price, valid category UUID, optional valid image URL, optional brand 1–255.
- Order: UUID gear ID, date-only UTC-safe strings, non-past start, end on/after start, positive integer quantity.
- Review: rating 1–5 with at most one decimal place, optional comment 3–2000; update body must be non-empty.
- Admin creation: name 2–255, valid email/phone, password at least six.

The browser validates for usability; the backend remains authoritative. Preserve safe input on failure and surface conflicts at the relevant control.

## UI/UX and accessibility bar

- Replace all starter branding, metadata, copy, and imagery with an original GearUp identity.
- Follow the instructor's component approach: code-owned Shadcn-style primitives under `src/components/ui/`, Radix behavior for complex controls, Lucide icons, `class-variance-authority` variants, a shared `cn` helper, and Sonner toasts are preferred when those dependencies are added.
- Mount one accessible `<Toaster />` in the root layout. Do not create a toaster per route.
- Mobile-first design must work on narrow phones through desktops. Convert complex tables into cards, scrollable regions, or compact rows on small screens.
- Use consistent public navigation and distinct role-aware dashboard shells.
- Define customer/provider/admin sidebar items in typed configuration modules and select them from the authenticated role, following the example's navigation pattern without copying its USER/AUTHOR roles.
- Use `next/image` with stable dimensions/sizes, useful alt text, fallback imagery, and trusted `remotePatterns`. The backend stores only an `imageUrl`; there is no upload API, so label the form as an image URL unless another service is explicitly added.
- Make focus visible, labels explicit, icon buttons named, dialogs keyboard/focus safe, and dynamic updates announced.
- Do not communicate status only with color.
- Reuse buttons, inputs, cards, badges, skeletons, dialogs, toasts, pagination, date fields, and tables, but avoid premature abstraction.
- Dark mode is optional bonus work and comes after API/auth/CRUD/payment/error/responsive requirements.

## Suggested frontend organization

Adapt to established conventions, but keep boundaries similar to:

```text
src/
  app/
    (public)/
    auth/
    dashboard/
      customer/
      provider/
      admin/
    payment/
    api/auth/          # same-origin session adapter if Route Handlers are used
    error.tsx
    not-found.tsx
    (feature)/_actions/ # route-specific Server Actions
  components/
    ui/
    layout/
    gear/
    orders/
    payments/
    reviews/
    dashboards/
  lib/
    api/
    auth/
    validation/
    utils/
  services/            # optional instructor-style server fetch functions
  providers/
  types/
  proxy.ts
```

Route groups do not affect URLs. Underscore folders such as `_actions` and `_components` are acceptable for private route-local modules, as shown in the instructor reference. Keep backend access, envelope parsing, role/status rules, currency/date formatting, and form schemas out of page markup. Avoid components that combine every network call, business rule, and visual state in one file.

The established public convention is `src/app/(public)/_components/` with
`shared/`, `landing/`, and `gear/` subfolders. Keep public-only shell and feature
components there. Put pure route-group helpers such as catalog URL parsing in
`src/app/(public)/_utils/`; do not mislabel read helpers as Server Actions.
Reserve `src/components/ui/` for global Shadcn primitives and
`src/components/shared/` for components genuinely reused across route groups,
such as `BrandMark` in both public and auth layouts.

## Deployment and credentials

- Frontend `GEARUP_API_URL` should end at the backend `/api` base.
- Backend `APP_URL` must exactly match the deployed frontend origin because it controls CORS and Stripe success/cancel URLs.
- Configure Stripe test-mode secrets and webhook endpoint in the backend deployment; the frontend does not own these secrets.
- Test production cross-origin behavior, frontend cookies, refresh, redirects, and Stripe webhooks. Local success is not enough.
- Provide deployed frontend/backend links and verified grading accounts in the final README/submission handoff.
- The Postman collection contains scenario credentials/variables, but they are not proof of a deployed working admin. Verify the actual grading admin immediately before submission.

## Commit discipline

The repository currently began with an initialization commit. Build the frontend through at least 20 additional meaningful, reviewable milestones unless existing later history already qualifies. Commit a coherent change after relevant checks; do not split completed work artificially at the end.

Examples:

- `feat: add typed backend response and error adapters`
- `feat: establish httponly jwt session bridge`
- `feat: build filterable paginated gear catalog`
- `feat: add customer rental request workflow`
- `feat: integrate stripe checkout return verification`
- `feat: add provider inventory and order actions`
- `feat: add admin category and user management`
- `fix: handle delayed stripe webhook on success page`
- `docs: map frontend consumers to gearup endpoints`

Never rewrite user-owned history without explicit permission. Before claiming the requirement is met, inspect `git log --oneline`, count substantive frontend commits, and verify each message matches its diff. Empty commits, generated churn, and deceptive micro-commits do not count.

## Verification workflow

Before a feature:

1. Inspect the working tree and applicable frontend files.
2. Inspect the backend route, validator, controller, service, and Prisma model involved.
3. Inspect the corresponding instructor example pattern when useful, but verify it against this backend and current local Next.js 16 docs.
4. Read the relevant installed Next.js 16 guide.
5. Define role, status, loading, empty, failure, responsive, and accessibility behavior.
6. Add/update its `API_INTEGRATION.md` row.

Before handoff:

1. Run `npm run lint` in the frontend.
2. Run `npm run build` in the frontend.
3. Run relevant frontend tests if configured.
4. Exercise changed paths at mobile and desktop widths.
5. Test success plus validation, `401`, `403`, `404`, `409`, server/network, and empty-data cases relevant to the feature.
6. Verify guest/customer/provider/admin direct URL access and wrong-role redirects.
7. Test Stripe in real test mode: confirmed-order requirement, new/reused session, cancel return, explicit order cancel, success return, webhook delay, refresh, duplicate click, expired session, and failed webhook state.
8. Check logs/browser output for leaked tokens, hydration errors, unhandled promises, and image/CORS/cookie issues.

When the backend is needed locally, its documented checks/startup are separate from frontend checks. Do not run migrations, seed data, or modify backend state unless the user's task authorizes it.

## Definition of done

The assignment is done only when:

- Public categories, gear catalog/detail, supported filters, reviews, responsive images, loading, and errors use the real backend.
- Registration/login/logout/refresh/me, secure session cookies, Next.js 16 Proxy redirects, and backend authorization work for all roles/account states.
- Customer order creation, authoritative pricing, history/detail, eligible cancellation, hosted Checkout, webhook-aware return UI, payments, and returned-order reviews work.
- Provider-owned gear CRUD, order management, and payment visibility work through the unified backend endpoints.
- Admin users/admin creation/status management, categories, all gear, all orders/payments, and review moderation work.
- Dashboards use real scoped queries and `meta.total`, not fake statistics.
- Data access uses the shared typed native-fetch boundary, server-only JWT forwarding, Server Actions for mutations, and deliberate Next.js cache/invalidation rules.
- Every asynchronous feature has accessible loading, empty, success, and friendly failure feedback.
- `API_INTEGRATION.md` contains only accurate, consumed endpoints and records backend limitations.
- `.env.example` and submission docs are complete without secrets.
- A real test-mode Stripe success and cancel flow is verified against the deployed backend/webhook.
- The deployed grading admin credential is working and provided.
- `npm run lint` and `npm run build` pass; responsive/accessibility/manual role checks are complete.
- At least 20 meaningful frontend commits have been audited.
- The deployed app can support the 7–10 minute walkthrough without fake/local-only core data.

Report implemented, locally verified, deployed verified, and blocked/unverified work separately. Never claim end-to-end success without evidence.
