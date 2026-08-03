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

The public API integration follows the instructor's native-fetch and async
Server Component approach, with a stricter shared boundary:

The feature fetch functions live in `src/services/` (instructor-style),
sharing one server-only client; domain and envelope types live in
`src/lib/types.ts`.

| Module | Responsibility |
| --- | --- |
| `src/lib/types.ts` | Backend envelopes, pagination metadata, normalized result/error types, auth form state, and current GearUp wire models |
| `src/services/errors.ts` | Safe JSON/object guards, validation-detail mapping, retryability, and sanitized user-facing problems |
| `src/services/server-client.ts` | Server-only URL construction, `URLSearchParams`, cache checks, one-time response parsing, and HTTP plus envelope validation |
| `src/services/auth.ts` | Login and register endpoints (no-store) returning access/refresh tokens |
| `src/services/categories.ts` | Category endpoint query and cache policy |
| `src/services/gear.ts` | Reusable gear-list endpoint, filters, pagination, and cache policy |
| `src/services/reviews.ts` | Review-list endpoint, pagination, and cache policy |

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
| Implemented | `/login` `LoginForm` via `loginAction` | `loginRequest()` | `POST /auth/login` | Public; `{ email, password }` | `data.accessToken`, `data.refreshToken` | `no-store`; server-side field validation then backend; inline field errors + error toast; on success sets HttpOnly `accessToken`/`refreshToken` cookies and redirects to a sanitized `returnTo` or `/` |
| Implemented | `/register` `RegisterForm` via `registerAction` | `registerRequest()` | `POST /auth/register` | Public; `{ name, email, phone, password, role }` where role is `CUSTOMER` or `PROVIDER` | `data.accessToken`, `data.refreshToken` | `no-store`; validates name/email/phone(`^\+?[0-9\s-]{7,20}$`)/password(≥6); maps backend 400 details to fields and 409 duplicate email/phone to a toast; role selector never offers `ADMIN`; sets session cookies and redirects on success |

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

## Session and cookies

- `loginAction`/`registerAction` validate `FormData` on the server, call the
  service functions, and on success store the backend `accessToken` and
  `refreshToken` in frontend-domain `HttpOnly`, `SameSite=Lax` cookies (`Secure`
  in production), lifetimes ~1 day / ~7 days. Tokens are never returned to client
  JavaScript, logged, or placed in `NEXT_PUBLIC_*`.
- `returnTo` is accepted only as a single-slash internal path; anything else
  falls back to `/`. Refresh rotation, `/auth/me`, logout, and Proxy redirects
  are not yet implemented and will be documented when consumed.

## Product-contract limitations

- `GET /gear` has no keyword or date-availability query. The frontend exposes
  category, exact-brand, price, provider, and pagination only; it does not
  filter one returned page and call that global search.
- `PLACED` orders do not reserve stock. Landing copy says a provider confirms
  dates before payment.
- Checkout is not initiated by the current public milestone. The future
  customer flow must call `POST /orders/:id/checkout-session` only after the
  order is `CONFIRMED` and must treat webhook-updated backend state as truth.
- There is no image-upload endpoint. Current cards use code-owned category
  visuals instead of an unsafe catch-all image allowlist.
- Auth, dashboard CRUD, and Stripe rows will be added here only when those
  endpoints are actually consumed; planned endpoints are not presented as
  completed integrations.
