# GearUp Frontend API Integration

## Configuration

All backend calls use the native Next.js-enhanced `fetch` API from server-only
modules. The browser never receives the backend base URL or a backend secret.

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `GEARUP_API_URL` | Server only | Backend base URL including `/api` |
| `GEARUP_CURRENCY` | Server only | Currency used to format backend decimal prices; must match Stripe/backend configuration |
| `CLOUDINARY_CLOUD_NAME` | Server only | Cloudinary product-environment name used by signed image uploads |
| `CLOUDINARY_API_KEY` | Server only | Cloudinary API key used by the Node SDK |
| `CLOUDINARY_API_SECRET` | Server only | Cloudinary signing secret; never exposed through `NEXT_PUBLIC_*` or action state |
| `CLOUDINARY_GEAR_FOLDER` | Server only, optional | Upload folder; defaults to `gearup/gear` |

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
| `src/components/providers/auth-session-provider.tsx` | Client-safe React Context hydrated from the server-resolved `/auth/me` result; exposes authenticated, anonymous, or temporarily unavailable state without exposing either JWT |
| `src/app/(auth)/validation/auth.schema.ts` | Route-owned Zod schemas matching backend login and customer/provider registration constraints |
| `src/app/(dashboard)/validation/admin.schema.ts` | Dashboard-owned Zod schemas for admin creation, categories, gear/file coercion, statuses, and bound UUID validation |
| `src/app/(dashboard)/validation/order.schema.ts` | Customer rental-request validation for UUID, real date-only values, non-past start, ordered dates, and positive integer quantity |
| `src/app/(dashboard)/validation/review.schema.ts` | Returned-order review validation for UUID, 1–5 rating with one decimal place, and optional 3–2,000 character comment |
| `src/components/shared/photo-upload.tsx` | Accessible multi-image picker with local object-URL previews, primary-image ordering, instant count/type/size feedback, replace, and cancel controls |
| `src/components/ui/slider.tsx` | Reusable Shadcn/Radix multi-thumb Slider primitive with theme styling and per-thumb accessible labels |
| `src/components/ui/date-range-picker.tsx` | Shadcn Calendar + Popover date-range composition that submits timezone-safe paired `YYYY-MM-DD` hidden fields |
| `src/app/(public)/_components/gear/price-range-slider.tsx` | Accessible dual-handle Shadcn price control whose hidden draft minimum/maximum values submit only through the catalog Apply action |
| `src/lib/image-upload.ts` | Browser-safe accepted image MIME types, file-input accept value, four-file cap, and the 5 MB per-file limit |
| `src/lib/validations/zod-errors.ts` | Cross-route adapter from flattened Zod failures to the shared `FieldErrors` action-state shape |
| `src/services/errors.ts` | Safe JSON/object guards, validation-detail mapping, retryability, and sanitized user-facing problems |
| `src/services/server-client.ts` | Server-only URL construction, `URLSearchParams`, centralized Bearer forwarding from the frontend HttpOnly cookie, cache checks, one-time response parsing, and HTTP plus envelope validation |
| `src/services/auth.ts` | Login/register token exchange plus request-cached, no-store `/auth/me` session resolution |
| `src/services/categories.ts` | Category reads plus protected admin create, rename, and delete operations |
| `src/services/cloudinary.ts` | Server-only signed Cloudinary stream upload, secure URL validation, and best-effort orphan cleanup |
| `src/services/gear.ts` | Reusable gear reads, filters, pagination, and protected create/update/delete operations |
| `src/services/orders.ts` | Authenticated, role-scoped order reads, dashboard counts, and protected status transitions |
| `src/services/payments.ts` | Authenticated, role-scoped payment lists and dashboard counts |
| `src/services/reviews.ts` | Public review reads, exact returned-order review lookup, protected customer creation, and admin moderation deletion |
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

Every form Server Action validates an explicitly selected input object with a
reusable Zod schema before calling a service. Zod failures are flattened into
the same `FieldErrors` shape used for normalized backend validation failures,
so client forms render consistent inline feedback and toasts. Passwords and
other secret values are never copied into returned action state.

## Global client session state

React Context is intentionally the only global client store. The public layout
resolves the current user through the HttpOnly-cookie-backed `GET /auth/me`
service and hydrates `AuthSessionProvider` with one of three explicit states:
`authenticated`, `anonymous`, or `unavailable`. The dashboard layout reuses the
same provider with its already-required canonical user, avoiding a duplicate
request. The Context contains only the safe `CurrentUser` response and never a
JWT, cookie, password, or backend secret.

`SiteHeader` uses the snapshot for account-aware navigation, and
`RentalRequestCard` uses it for immediate customer/guest/other-role routing.
This client state is presentation and navigation assistance only. Protected
pages and every mutation still resolve `/auth/me` and enforce the role on the
server because Context can be stale or modified in browser memory.

## External media integration

Gear images use Cloudinary because the GearUp backend accepts image URLs but
does not accept multipart files. The protected gear form submits files to
the Next.js Server Action. Zod accepts up to four JPEG, PNG, WebP, or AVIF files
of 5 MB each; Next.js permits 22 MB action bodies for the bounded multipart
gallery. The shared `PhotoUpload` component previews all selected browser files
locally and lets the user replace or cancel the gallery before any network
request. During edits, canceling a replacement restores the saved Cloudinary
gallery. The server-only Cloudinary SDK streams signed uploads and returns HTTPS
`secure_url` values. The first becomes backward-compatible `imageUrl`; the full
ordered set is sent as `imageUrls`. If any upload or the backend mutation fails,
all newly uploaded public IDs are destroyed as best-effort compensation. No
Cloudinary secret or raw image is forwarded to the GearUp API.

## Consumed endpoints

Only endpoints currently called by the application are listed here.

| Status | Frontend consumer | Feature function | Method and backend path | Access and query | Response fields used | Cache, loading, empty, and error behavior |
| --- | --- | --- | --- | --- | --- | --- |
| Implemented | Landing `InventorySection` category rail and `/gear` `CatalogContent` filters | `listCategories()` | `GET /categories` | Public; no query | Category `id` and `name` | Revalidates every 60 seconds with `categories` tag; independent skeleton/empty state; a category failure does not hide gear results |
| Implemented | Landing `InventorySection` recent grid | `listGear({ page: 1, limit: 6 })` | `GET /gear?page=1&limit=6` | Public | Gear identity, category, provider, brand, description, stock/availability, daily price, and pagination metadata | Revalidates every 60 seconds with `gear` tag; labels rows recently listed because the backend sorts newest-first; independent loading, empty, and connection-failure UI |
| Implemented | `/gear` price slider bounds | `getGearPriceRange()` | `GET /gear/price-range` | Public; no query | Database-aggregated `minPrice` and `maxPrice`, or `null` values for an empty inventory | Revalidates every 60 seconds with the `gear` tag; invalid/empty bounds disable the price control without breaking the remaining catalog filters |
| Implemented | `/gear` `CatalogContent`, `CatalogFilters`, and `CatalogResults` | `listGear(query)` | `GET /gear?search?&category?&brand?&minPrice?&maxPrice?&startDate?&endDate?&page=1&limit=12` | Public; URL-owned keyword, category, exact brand, inclusive price range, paired date availability, and page | Filtered gear rows plus exact post-availability `meta.page`, `meta.limit`, and `meta.total` | Revalidates every 60 seconds with `gear` tag; keyword input alone replaces the URL after a 450 ms debounce, while category/brand/price/date drafts call the API only when Apply filters is submitted; the backend searches name/description/brand/category/provider and subtracts overlapping `CONFIRMED`/`PAID`/`PICKED_UP` quantities; distinct validation, successful-empty, API-failure, and unexpected-error states; impossible pages recover to the last real page |
| Implemented | `/gear/[id]` `GearDetail`, `GearGallery`, and catalog-card links | `getGearItem(id)` | `GET /gear/:id` | Public; UUID path validated before the request | Full listing, category, provider name, stock/availability, price, ordered trusted Cloudinary `imageUrls`, legacy `imageUrl`, and newest embedded customer reviews | Revalidates every 60 seconds with `gear` and item tags; accessible thumbnail buttons switch the main image; route-shaped skeleton and error boundary; backend `404` or malformed UUID renders the contextual not-found screen, while other failures retain retry/catalog recovery actions |
| Implemented | Landing `ReviewsSection` | `listReviews({ page: 1, limit: 3 })` | `GET /reviews?page=1&limit=3` | Public | Rating/comment, customer, gear item, and returned-order status | Revalidates every 60 seconds with `reviews` tag; renders only real returned-order reviews and never fabricates testimonials |
| Implemented | `/login` `LoginForm` via `loginAction` | `loginRequest()` | `POST /auth/login` | Public; `{ email, password }` | `data.accessToken`, `data.refreshToken` | `no-store`; server-side field validation then backend; inline field errors + error toast; on success sets HttpOnly `accessToken`/`refreshToken` cookies and redirects to a sanitized `returnTo` or `/dashboard` |
| Implemented | `/register` `RegisterForm` via `registerAction` | `registerRequest()` | `POST /auth/register` | Public; `{ name, email, phone, password, role }` where role is `CUSTOMER` or `PROVIDER` | `data.accessToken`, `data.refreshToken` | `no-store`; validates name/email/phone(`^\+?[0-9\s-]{7,20}$`)/password(≥6); maps backend 400 details to fields and 409 duplicate email/phone to a toast; role selector never offers `ADMIN`; sets session cookies and redirects on success |
| Implemented | Same-origin `/auth/refresh` Route Handler reached from protected dashboard guards | `refreshAccessTokenRequest(refreshToken)` | `POST /auth/refresh-token` | Refresh token is read only from the frontend-domain HttpOnly cookie and sent in `{ refreshToken }` | Rotated `accessToken` | `no-store`; the handler verifies the new token with `/auth/me`, replaces only the access cookie, and returns to a sanitized dashboard path; any missing/rejected refresh or account-state failure clears both cookies and terminates at `/login?reason=session-expired` |
| Implemented | `(dashboard)/dashboard/layout.tsx`, dashboard shell, overview pages, and `/dashboard` role redirect | `getCurrentUser()` | `GET /auth/me` | Authenticated with centralized Bearer forwarding | Canonical user id, name, email, phone, role, status, and timestamps | `no-store`; React request cache deduplicates layout/page reads; missing or rejected sessions redirect to `/login` with a sanitized `returnTo`; each role overview explicitly calls `requireDashboardRole()` and redirects cross-role navigation to the actor's own dashboard |
| Implemented | Role overviews and shared `/dashboard/orders` register | `listOrders(query)` | `GET /orders?status?&paymentStatus?&page=&limit=` | Authenticated; backend automatically scopes customer/provider/admin records | Order, gear, provider, customer, payment, status, totals, dates, and pagination metadata | `no-store`; one shared page selects role-specific copy and authorized controls; dashboard totals use `meta.total`; the register paginates through URL state |
| Implemented | Gear-detail `RentalRequestCard`, `/dashboard/orders/new` `CustomerOrderForm`, and `createRentalOrderAction` | `createRentalOrder(input)` | `POST /orders` | Customer only; `{ gearItemId, startDate, endDate, quantity }` | Authoritative `orderId`, `PLACED` status, inclusive `rentalDays`, quantity, total price, and `PENDING` payment status | Context routes guests through login and blocks non-customer UI; the page and action independently require `CUSTOMER`; Zod rejects invalid/past/reversed dates and non-integer quantity; backend availability/stock conflicts remain inline and toast errors; success refreshes real order views |
| Implemented | Shared `/dashboard/orders/[id]` detail page `OrderDetail` | `getOrder(id)` | `GET /orders/:id` | Authenticated; backend scopes the record to the customer, owning provider, or admin | Order status, inclusive rental period, quantity, authoritative total, gear/category/provider, customer contact (provider/admin), and linked payment | `no-store`; invalid UUID and backend `404`/`403` render `notFound()`; other failures show a retry alert; parties/payment cards render conditionally by role |
| Implemented | Order detail `PayNowButton` and `/payment/cancel` retry via `startCheckoutAction` | `createCheckoutSession(id)` | `POST /orders/:id/checkout-session` | Customer owner; no body; only while order is `CONFIRMED` and payment `PENDING` | `orderId`, `paymentId`, `stripeSessionId`, `checkoutUrl`, and `reused` flag | `no-store`; the action requires `CUSTOMER`; `checkoutUrl` must be HTTPS on a Stripe host before the direct redirect; `{ orderId, paymentId }` are saved to an HttpOnly `gearup_pending_checkout` cookie; backend `409` (state/reused/expired) and `502` (Stripe) surface as inline/toast errors |
| Implemented | `/payment/success` `PaymentSuccessPoller` via `refreshCheckoutStatusAction` | `getOrder(id)` | `GET /orders/:id` | Customer; order id read from the pending-checkout cookie (never from `session_id`) | Order status and linked payment status | `no-store`; polls up to ~25s while the webhook moves payment `PENDING→COMPLETED` / order `CONFIRMED→PAID`; renders paid only after API verification and non-committal processing on timeout; if the cookie is missing it explicitly says verification is unavailable instead of claiming payment; detected failure clears context and routes to `/payment/failed?order_id=` |
| Implemented | `/payment/failed` outcome screen | `getOrder(id)` | `GET /orders/:id` | Customer; order id from the URL (refresh-safe) | Gear name for context | `no-store`; best-effort read only for copy; terminal screen (order is `CANCELLED`) so it offers view-order and browse-gear, not retry |
| Implemented | Role overviews and shared `/dashboard/payments` register | `listPayments(query)` | `GET /payments?status?&page=&limit=` | Authenticated; backend automatically scopes records by role | Payment amount/status, linked order and gear, timestamps, and pagination metadata | `no-store`; one shared page presents the backend-scoped records; completed/pending totals come from metadata; Stripe/webhook status is backend truth |
| Implemented | Admin overview and `/dashboard/users` search/filter register | `listUsers(query)` | `GET /users?search?&role?&status?&page=&limit=` | Admin only; URL-owned name/email/phone search, role, status, and page | User identity, role, account status, timestamps, resource counts, and pagination metadata | `no-store`; filters are preserved across pagination; the page explicitly requires `ADMIN` and backend authorization remains authoritative; failures never render as an empty user list |
| Implemented | Shared `/dashboard/gear` plus provider/admin overviews | `listGear({ providerId?, isAvailable?, inStock?, page, limit })` | `GET /gear?providerId?&isAvailable?&inStock?&page=&limit=` | Authenticated dashboard page over a public read; provider passes the canonical current-user id; admin metric requests available listings with stock | Listing, stock, availability, category, provider, price, and metadata | One shared page renders customer discovery, provider-owned inventory, or admin platform inventory; the admin “Active gear” total comes from exact metadata rather than all gear/page length; mutations remain role-conditional and backend-authorized |
| Implemented | Admin category manager | `listCategories()` | `GET /categories` | Public read inside an admin-guarded dashboard route | Category identity, name, and timestamps | 60-second `categories` revalidation; failures remain visibly distinct from a successful empty result |
| Implemented | Admin review moderation register | `listReviews({ page, limit })` | `GET /reviews?page=&limit=` | Public read inside an admin-guarded dashboard route | Review, rating, customer, gear, returned order, timestamps, and metadata | 60-second `reviews` revalidation; paginated UI uses backend records only and presents protected moderation controls |
| Implemented | Returned customer order detail `OrderReviewCard` | `findReviewForOrder(gearItemId, orderId)` via `listReviews()` | `GET /reviews?gearItemId=&page=&limit=100` | Public read only after a backend-scoped customer order resolves as `RETURNED`; the frontend scans backend pages because there is no direct order-id review filter | Existing review identity, rating, comment, customer, gear, returned order, and timestamps | 60-second `reviews` revalidation; an existing review replaces the form with its backend record; lookup failure stays visible while submission remains available and backend duplicate protection remains authoritative |
| Implemented | Returned customer order detail `OrderReviewCard` via `createReviewAction` | `createReview(input)` | `POST /reviews` | Customer only; `{ orderId, rating, comment? }`; the action rechecks the canonical role and the backend verifies order ownership, `RETURNED` state, and one-review-per-order | Created review, linked gear/order/customer, rating/comment, and backend success message | `no-store`; Zod and backend field errors render inline plus toast; backend `409` explains non-returned or already-reviewed orders; success immediately updates `reviews`, `gear`, and `gear:<id>` tags plus order/customer paths |
| Implemented | Admin user register `AdminUserStatusForm` via `updateUserStatusAction` | `updateUserStatus()` | `PATCH /users/:id/status` | Admin; `{ status: "ACTIVE" | "INACTIVE" | "SUSPENDED" }` | Updated user and backend message | The action revalidates the admin role, blocks self-deactivation in the UI and action, preserves backend `409` feedback, refreshes the register, and shows pending, inline, and toast feedback |
| Implemented | `/dashboard/admins/new` `AdminCreateAdminForm` via `createAdminAction` | `createAdmin()` | `POST /users/admins` | Admin; `{ name, email, phone, password }` | Created admin identity and backend message | Server validation mirrors the backend; duplicate email/phone details map to fields/toasts; successful creation invalidates user data and returns to `/dashboard/users` |
| Implemented | Admin category manager via category Server Actions | `createCategory()`, `updateCategory()`, `deleteCategory()` | `POST /categories`, `PATCH /categories/:id`, `DELETE /categories/:id` | Admin; create/update `{ name }`, delete UUID path | Created/updated category or deletion confirmation | Inline create/rename/delete controls use pending states, confirmation before deletion, field errors, and toasts; used-category `409` responses remain visible; `categories` and `gear` tags are invalidated after applicable writes |
| Implemented | `/dashboard/gear/new`, `/dashboard/gear/[id]/edit`, and admin/provider controls on `/dashboard/gear` | `uploadGearImages()` then `createGearItem()`/`updateGearItem()`; `deleteGearItem()` | Up to four signed Cloudinary `image/upload` calls, then `POST /gear`, `PATCH /gear/:id`, or `DELETE /gear/:id` | Admin or Provider; gallery is optional and each file is limited to approved image types/5 MB; admin create requires an active `providerId`, provider create omits it; backend ownership remains authoritative; backend receives only HTTPS `imageUrl`/`imageUrls` | Ordered Cloudinary HTTPS URLs plus created/updated gear, or deletion confirmation | Upload and backend errors share inline/toast feedback; submit stays pending through the sequence; all newly uploaded assets are destroyed if a later upload/backend write fails; affected gear paths/tags refresh |
| Implemented | Admin order registers and overview `AdminOrderAction` via `updateOrderStatusAction` | `updateOrderStatus()` | `PATCH /orders/:id/status` | Admin; exact lifecycle-controlled `{ status }` | Updated order and backend message | Controls expose only valid manual transitions, never `PAID`; stale-state/backend `409` errors show inline and as toasts; order/payment paths are revalidated after success |
| Implemented | Order detail plus provider overview/register `OrderStatusActions` via `changeOrderStatusAction` | `updateOrderStatus()` | `PATCH /orders/:id/status` | Any authenticated user; buttons follow the role+transition map (customer cancels own `PLACED`/`CONFIRMED`; provider/admin confirm, cancel, pick up, return); `PAID`/`PLACED` are never requestable | Updated order and backend message | Provider fulfillment actions are available inline in order lists; cancel requires confirmation; the action re-verifies the session and lets the backend enforce ownership/state, mapping `403`/`409` to toasts; affected paths refresh after success |
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
- `/gear/[id]/page.tsx` validates its dynamic UUID, resolves the exact backend
  listing, and delegates the composed product experience to the public-only
  `GearDetail` component. Its colocated loading, error, and not-found files
  provide route-specific recovery without converting an API failure into an
  empty product state.
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
- `/dashboard/orders/new?gearItemId=<uuid>` is the customer-only create route.
  Guests arrive through login with this internal return path preserved; the
  page and Server Action both require the CUSTOMER role before reading or
  creating an order.
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
- `src/proxy.ts` performs only optimistic, cookie-based redirects for
  `/dashboard/:path*`, `/login`, and `/register`: guests are sent to
  `/login?returnTo=…`, signed-in users are bounced off the auth pages to their
  role home, and an obviously wrong-role visitor is redirected to their own
  dashboard. Expired or malformed cookies are not treated as usable session
  hints; an unexpired refresh-token hint on an auth page enters the same-origin
  refresh adapter instead of bouncing directly back to a protected page. It
  decodes the JWT payload (`{ id, name, email, role, exp }`) with an
  Edge-safe, secret-free decoder (`src/lib/auth/session-token.ts`) purely to
  route — it never calls the API, refreshes a token, or verifies the signature.
  Role→path rules live in `src/lib/auth/dashboard-routes.ts` (`ROLE_HOME`,
  `requiredRoleForPath`). Authorization is enforced authoritatively near the
  data by `requireDashboardRole`/`requireDashboardRoles` and `/auth/me`; the
  proxy redirects are never the security boundary.
- Dashboard logout deletes both frontend-domain HttpOnly cookies and redirects
  to `/login`. When an authoritative `/auth/me` check returns `401` or `403`,
  the dashboard guard redirects through `/auth/refresh?returnTo=…`. That Route
  Handler exchanges the HttpOnly refresh token with `POST /auth/refresh-token`,
  verifies the rotated access token against `/auth/me`, sets the new access
  cookie, and resumes the sanitized dashboard path. Missing, invalid, expired,
  inactive, or suspended sessions clear both cookies and stop at login with a
  persistent session-ended message, preventing dashboard/login redirect loops.

## Product-contract limitations

- `GET /gear` was extended in the authorized local backend with keyword,
  active/in-stock, and paired date-availability filters. Date filtering is
  global (before pagination) and subtracts all overlapping stock-reserving
  orders; it answers whether at least one unit remains. Order creation and
  confirmation still recheck the requested quantity authoritatively.
- `PLACED` orders do not reserve stock. Landing copy says a provider confirms
  dates before payment.
- Checkout is now wired end to end. The customer calls
  `POST /orders/:id/checkout-session` only after the order is `CONFIRMED` and the
  payment is `PENDING`; the returned `checkoutUrl` is verified as an HTTPS Stripe
  host and the `{ orderId, paymentId }` context is stored in a short-lived
  HttpOnly cookie before redirecting. The backend hardcodes the return URLs
  (`/payment/success?session_id=...`, `/payment/cancel?order_id=...`). There is
  no frontend payment-create or session-id lookup; `session_id` is never treated
  as proof and the success screen only trusts polled `GET /orders/:id` state.
  Because Stripe Checkout has no failure URL, the browser always lands on
  `/payment/success`; when polling detects a webhook-set `FAILED`/`CANCELLED`
  result, the customer is redirected to a dedicated, refresh-safe
  `/payment/failed?order_id=` screen.
  `/payment/cancel` explains that leaving Checkout does not cancel the order and
  offers retry (reuses the open session), back-to-order, and an explicit
  `PATCH /orders/:id/status { CANCELLED }` action.
- The backend still has no binary image-upload endpoint. Protected gear forms
  therefore use the documented server-side Cloudinary adapter and persist only
  returned HTTPS URLs. The authorized backend extension adds an ordered
  `imageUrls` array while retaining `imageUrl` as the compatible catalog cover;
  public fallback visuals remain available for records with no image.
- Admin gear, category, user, order, and review mutations now consume their real
  protected endpoints. Payments intentionally remain read-only, and no admin
  control can author `PAID`; Stripe's signed webhook remains authoritative.
- Customer order creation and the real Stripe Checkout return flow now use the
  backend mutations end to end. No dashboard presents placeholder CRUD, invented
  paid states, COD/Pay-Later, or fake success data; `PAID` only ever arrives from
  the signed webhook.
