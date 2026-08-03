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

| Module | Responsibility |
| --- | --- |
| `src/lib/api/types.ts` | Backend envelopes, pagination metadata, normalized result/error types, and current GearUp wire models |
| `src/lib/api/errors.ts` | Safe JSON/object guards, validation-detail mapping, retryability, and sanitized user-facing problems |
| `src/lib/api/server-client.ts` | Server-only URL construction, `URLSearchParams`, cache checks, one-time response parsing, and HTTP plus envelope validation |
| `src/lib/api/categories.ts` | Category endpoint query and cache policy |
| `src/lib/api/gear.ts` | Reusable gear-list endpoint, filters, pagination, and cache policy |
| `src/lib/api/reviews.ts` | Review-list endpoint, pagination, and cache policy |

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
- `src/app/(auth)` is a layout group only. A future `/auth/login` route must live
  under `(auth)/auth/login`; route groups do not add URL segments.
- The root layout owns fonts, Shadcn semantic tokens, and the single Sonner
  toaster. Root `error.tsx` and `not-found.tsx` provide branded recovery UI.

No `_actions` directory exists yet because all implemented requests are public
reads. Route-local Server Actions and `useActionState` should be introduced with
real auth or mutation forms, not used as wrappers around GET requests.

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
