# GearUp Frontend API Integration

## Configuration

All backend calls use the native Next.js-enhanced `fetch` API from server-only
modules. The browser never receives the backend base URL or a backend secret.

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `GEARUP_API_URL` | Server only | Backend base URL including `/api` |
| `GEARUP_CURRENCY` | Server only | Currency used to format backend decimal prices; must match Stripe/backend configuration |

Local placeholders are documented in `.env.example`; `.env` remains untracked.

## Shared request boundary

The API integration follows the instructor's native-fetch and async
Server Component approach, with a stricter shared boundary:

The feature fetch functions live in `src/services/` (instructor-style),
sharing one server-only client; domain and envelope types live in
`src/lib/types.ts`.

| Module | Responsibility |
| --- | --- |
| `src/lib/types.ts` | Backend envelopes, pagination metadata, normalized result/error types, auth form state, and current GearUp wire models |
| `src/services/errors.ts` | Safe JSON/object guards, validation-detail mapping, retryability, and sanitized user-facing problems |
| `src/services/server-client.ts` | Server-only URL construction, `URLSearchParams`, centralized Bearer forwarding from the frontend HttpOnly cookie, cache checks, one-time response parsing, and HTTP plus envelope validation |
| `src/services/auth.ts` | Login/register token exchange plus request-cached, no-store `/auth/me` session resolution |
| `src/services/categories.ts` | Category reads plus protected admin create, rename, and delete operations |
| `src/services/gear.ts` | Reusable gear reads, filters, pagination, and protected create/update/delete operations |
| `src/services/orders.ts` | Authenticated, role-scoped order reads, dashboard counts, and protected status transitions |
| `src/services/payments.ts` | Authenticated, role-scoped payment lists and dashboard counts |
| `src/services/reviews.ts` | Public review reads plus protected admin moderation deletion |
| `src/services/users.ts` | Admin-only user reads, account-status updates, and admin-account creation |

Expected API failures are returned as a discriminated result:

```ts
type ApiResult<T> =
  | { ok: true; status: number; message: string; data: T; meta?: ApiMeta }
  | {
      ok: false;
      error: {
        status: number | null;
        code: "configuration" | "network" | "http" | "invalid-response";
        message: string;
        fieldErrors?: Record<string, string[]>;
        retryable: boolean;
      };
    };
```

The client checks both `response.ok` and `payload.success === true`, reads the
body only once, tolerates non-JSON responses, never exposes backend stacks or
gateway HTML, and does not convert connection failures into successful empty
lists.

## Consumed endpoints

Only endpoints currently called by the application are listed here.

| Status | Frontend consumer | Feature function | Method and backend path | Access and query | Response fields used | Cache, loading, empty, and error behavior |
| --- | --- | --- | --- | --- | --- | --- |
| Implemented | Landing `InventorySection` category rail and `/gear` `CatalogContent` filters | `listCategories()` | `GET /categories` | Public; no query | Category `id` and `name` | Revalidates every 60 seconds with `categories` tag; independent skeleton/empty state; a category failure does not hide gear results |
| Implemented | Landing `InventorySection` recent grid | `listGear({ page: 1, limit: 6 })` | `GET /gear?page=1&limit=6` | Public | Gear identity, category, provider, brand, description, stock/availability, daily price, and pagination metadata | Revalidates every 60 seconds with `gear` tag; labels rows recently listed because the backend sorts newest-first; independent loading, empty, and connection-failure UI |
| Implemented | `/gear` `CatalogContent`, `CatalogFilters`, and `CatalogResults` | `listGear(query)` | `GET /gear?category?&brand?&minPrice?&maxPrice?&page=1&limit=12` | Public; URL-owned category, exact brand, inclusive price range, and page | Filtered gear rows plus `meta.page`, `meta.limit`, and `meta.total` | Revalidates every 60 seconds with `gear` tag; route-level and granular skeletons; distinct validation, successful-empty, retryable API failure, and unexpected-error states; impossible pages recover to the last real page |
| Implemented | Landing `ReviewsSection` | `listReviews({ page: 1, limit: 3 })` | `GET /reviews?page=1&limit=3` | Public | Rating/comment, customer, gear item, and returned-order status | Revalidates every 60 seconds with `reviews` tag; renders only real returned-order reviews and never fabricates testimonials |
| Implemented | `/login` `LoginForm` via `loginAction` | `loginRequest()` | `POST /auth/login` | Public; `{ email, password }` | `data.accessToken`, `data.refreshToken` | `no-store`; server-side field validation then backend; inline field errors + error toast; on success sets HttpOnly `accessToken`/`refreshToken` cookies and redirects to a sanitized `returnTo` or `/dashboard` |
| Implemented | `/register` `RegisterForm` via `registerAction` | `registerRequest()` | `POST /auth/register` | Public; `{ name, email, phone, password, role }` where role is `CUSTOMER` or `PROVIDER` | `data.accessToken`, `data.refreshToken` | `no-store`; validates name/email/phone(`^\+?[0-9\s-]{7,20}$`)/password(≥6); maps backend 400 details to fields and 409 duplicate email/phone to a toast; role selector never offers `ADMIN`; sets session cookies and redirects on success |
| Implemented | `(dashboard)/dashboard/layout.tsx`, dashboard shell, overview pages, and `/dashboard` role redirect | `getCurrentUser()` | `GET /auth/me` | Authenticated with centralized Bearer forwarding | Canonical user id, name, email, phone, role, status, and timestamps | `no-store`; React request cache deduplicates layout/page reads; missing or rejected sessions redirect to `/login` with a sanitized `returnTo`; each role overview explicitly calls `requireDashboardRole()` and redirects cross-role navigation to the actor's own dashboard |
| Implemented | Role overviews and shared `/dashboard/orders` register | `listOrders(query)` | `GET /orders?status?&paymentStatus?&page=&limit=` | Authenticated; backend automatically scopes customer/provider/admin records | Order, gear, provider, customer, payment, status, totals, dates, and pagination metadata | `no-store`; one shared page selects role-specific copy and authorized controls; dashboard totals use `meta.total`; the register paginates through URL state |
| Implemented | Role overviews and shared `/dashboard/payments` register | `listPayments(query)` | `GET /payments?status?&page=&limit=` | Authenticated; backend automatically scopes records by role | Payment amount/status, linked order and gear, timestamps, and pagination metadata | `no-store`; one shared page presents the backend-scoped records; completed/pending totals come from metadata; Stripe/webhook status is backend truth |
| Implemented | Admin overview and `/dashboard/users` | `listUsers(query)` | `GET /users?search?&role?&status?&page=&limit=` | Admin only | User identity, role, account status, timestamps, resource counts, and pagination metadata | `no-store`; the page explicitly requires `ADMIN` and backend authorization remains authoritative; failures never render as an empty user list |
| Implemented | Shared `/dashboard/gear` plus provider/admin overviews | `listGear({ providerId?, page, limit })` | `GET /gear?providerId?&page=&limit=` | Authenticated dashboard page over a public read; provider passes the canonical current-user id, customer/admin omit it | Listing, stock, availability, category, provider, price, and metadata | One shared page renders customer discovery, provider-owned inventory, or admin platform inventory; mutations remain role-conditional and backend-authorized |
| Implemented | Admin category manager | `listCategories()` | `GET /categories` | Public read inside an admin-guarded dashboard route | Category identity, name, and timestamps | 60-second `categories` revalidation; failures remain visibly distinct from a successful empty result |
| Implemented | Admin review moderation register | `listReviews({ page, limit })` | `GET /reviews?page=&limit=` | Public read inside an admin-guarded dashboard route | Review, rating, customer, gear, returned order, timestamps, and metadata | 60-second `reviews` revalidation; paginated UI uses backend records only and presents protected moderation controls |
| Implemented | Admin user register `AdminUserStatusForm` via `updateUserStatusAction` | `updateUserStatus()` | `PATCH /users/:id/status` | Admin; `{ status: "ACTIVE" | "INACTIVE" | "SUSPENDED" }` | Updated user and backend message | The action revalidates the admin role, blocks self-deactivation in the UI and action, preserves backend `409` feedback, refreshes the register, and shows pending, inline, and toast feedback |
| Implemented | `/dashboard/admins/new` `AdminCreateAdminForm` via `createAdminAction` | `createAdmin()` | `POST /users/admins` | Admin; `{ name, email, phone, password }` | Created admin identity and backend message | Server validation mirrors the backend; duplicate email/phone details map to fields/toasts; successful creation invalidates user data and returns to `/dashboard/users` |
| Implemented | Admin category manager via category Server Actions | `createCategory()`, `updateCategory()`, `deleteCategory()` | `POST /categories`, `PATCH /categories/:id`, `DELETE /categories/:id` | Admin; create/update `{ name }`, delete UUID path | Created/updated category or deletion confirmation | Inline create/rename/delete controls use pending states, confirmation before deletion, field errors, and toasts; used-category `409` responses remain visible; `categories` and `gear` tags are invalidated after applicable writes |
| Implemented | `/dashboard/gear/new`, `/dashboard/gear/[id]/edit`, and admin controls on `/dashboard/gear` | `createGearItem()`, `updateGearItem()`, `deleteGearItem()` | `POST /gear`, `PATCH /gear/:id`, `DELETE /gear/:id` | Admin; each route/action explicitly requires admin; create includes an active `providerId`; update sends only editable fields | Created/updated gear or deletion confirmation | Shared gear URLs render controls conditionally; forms validate category/provider, description, stock, price, URL, and availability; destructive actions require confirmation; affected gear paths/tags refresh |
| Implemented | Admin order registers and overview `AdminOrderAction` via `updateOrderStatusAction` | `updateOrderStatus()` | `PATCH /orders/:id/status` | Admin; exact lifecycle-controlled `{ status }` | Updated order and backend message | Controls expose only valid manual transitions, never `PAID`; stale-state/backend `409` errors show inline and as toasts; order/payment paths are revalidated after success |
| Implemented | Admin review register `AdminReviewDeleteControl` via `deleteReviewAction` | `deleteReview()` | `DELETE /reviews/:id` | Admin; UUID path | Deletion confirmation | Requires explicit browser confirmation, disables while pending, surfaces the real backend error, and invalidates review pages/tags on success |

## Route and component organization

- `src/app/(public)` owns the shared public shell and the `/` and `/gear` URLs;
  the route-group name never appears in the URL.
- `src/app/(public)/_components` owns every public-only component, grouped into
  `shared` (header/footer), `landing`, and `gear`; the folder is private and does
  not create a URL segment.
- `src/app/(public)/_utils/catalog-query.ts` owns shared catalog query parsing,
  validation, and pagination URLs. It is a pure helper, not a Server Action.
- `/gear/page.tsx` is a thin route shell. It streams the async
  `CatalogContent` through Suspense, following the instructor's list pattern.
- The brand mark remains in `src/components/shared` because both public and auth
  shells use it. Shadcn primitives remain globally reusable in
  `src/components/ui`.
- `src/app/(auth)` is a layout group only, so login and register resolve to
  `/login` and `/register` (mirroring the instructor example's `(authGroup)`).
  Route groups do not add URL segments; an `/auth/login` URL would instead need
  `(auth)/auth/login`.
- `src/app/(auth)/_actions/authActions.ts` holds the `loginAction` and
  `registerAction` Server Actions; `src/app/(auth)/_components` holds the client
  forms (`login-form`, `register-form`), the shared `auth-shell`, and
  `field-error`. Forms use `useActionState` for pending state and inline errors.
- The root layout owns fonts, Shadcn semantic tokens, and the single Sonner
  toaster. Root `error.tsx` and `not-found.tsx` provide branded recovery UI.
- `src/app/(dashboard)` mirrors the instructor's dashboard route-group pattern:
  private `_components`, `_config`, `_actions`, and `_utils` folders support one
  shared `/dashboard` layout without adding group names to URLs. The shell uses
  typed role navigation, a desktop rail, a Shadcn mobile Sheet, and a single
  logout action.
- `/dashboard` resolves the canonical `/auth/me` user and redirects to one of
  three role-specific overview pages: `/dashboard/customer`,
  `/dashboard/provider`, or `/dashboard/admin`. Only overview routes carry a
  role segment.
- `/dashboard/orders`, `/dashboard/payments`, and `/dashboard/gear` are single
  canonical resource routes. Each resolves the current user, relies on backend
  record scoping, and conditionally selects role copy and permitted controls.
  This follows the instructor reference's one dashboard group and role-selected
  typed navigation without maintaining three copies of the same register page.
- `/dashboard/users`, `/dashboard/categories`, `/dashboard/reviews`, and
  `/dashboard/admins/new` use role-neutral URLs but explicitly require `ADMIN`
  inside their pages and actions.
- Dashboard overview totals are derived from `meta.total` with small parallel
  requests. Orders, payments, users, gear, and reviews registers use URL-owned
  `?page=` pagination, persistent error feedback, successful empty states, and
  route-level skeleton/error boundaries.
- `src/app/(dashboard)/_actions/admin-actions.ts` contains the thin admin Server
  Actions. Every action resolves `/auth/me` again, requires `ADMIN`, validates
  untrusted form and bound values, calls a typed service operation, and then
  invalidates only the affected paths/tags.
- Admin mutation client components use `useActionState` for pending state,
  structured inline errors, and Sonner toasts. Full-page forms serve admin and
  gear creation/editing; compact register controls handle user status, category
  maintenance, order transitions, gear deletion, and review moderation.
- Admin mutation routes include `/dashboard/admins/new`,
  `/dashboard/gear/new`, and `/dashboard/gear/[id]/edit`.

## Session and cookies

- `loginAction`/`registerAction` validate `FormData` on the server, call the
  service functions, and on success store the backend `accessToken` and
  `refreshToken` in frontend-domain `HttpOnly`, `SameSite=Lax` cookies (`Secure`
  in production), lifetimes ~1 day / ~7 days. Tokens are never returned to client
  JavaScript, logged, or placed in `NEXT_PUBLIC_*`.
- `returnTo` is accepted only as a single-slash internal path; anything else
  falls back to `/dashboard`. Successful login/registration enters the role
  resolver at `/dashboard`.
- `src/proxy.ts` performs only an optimistic cookie-presence redirect for
  `/dashboard/:path*`; it never calls the API, refreshes a token, or pretends to
  verify a backend JWT. The dashboard layout validates the session through
  `/auth/me` near protected data.
- Dashboard logout deletes both frontend-domain HttpOnly cookies and redirects
  to `/login`. Access-token refresh rotation is not yet implemented; an expired
  access token currently requires signing in again.

## Product-contract limitations

- `GET /gear` has no keyword or date-availability query. The frontend exposes
  category, exact-brand, price, provider, and pagination only; it does not
  filter one returned page and call that global search.
- `PLACED` orders do not reserve stock. Landing copy says a provider confirms
  dates before payment.
- Checkout is not initiated by the current dashboard milestone. The future
  customer flow must call `POST /orders/:id/checkout-session` only after the
  order is `CONFIRMED` and must treat webhook-updated backend state as truth.
- There is no image-upload endpoint. Current cards use code-owned category
  visuals instead of an unsafe catch-all image allowlist.
- Admin gear, category, user, order, and review mutations now consume their real
  protected endpoints. Payments intentionally remain read-only, and no admin
  control can author `PAID`; Stripe's signed webhook remains authoritative.
- Customer/provider mutations and real Stripe Checkout are not part of this
  admin-mutation milestone. Their dashboards do not present placeholder CRUD,
  invented paid states, or fake success data.
