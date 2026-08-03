# GearUp Frontend API Integration

## Configuration

The landing page uses the native Next.js-enhanced `fetch` API from server-only
modules.

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `GEARUP_API_URL` | Server only | Backend base URL including `/api` |
| `GEARUP_CURRENCY` | Server only | Currency used to format backend decimal prices; must match Stripe/backend configuration |

Local defaults are documented in `.env.example`. No JWT or Stripe secret belongs
in the frontend.

## Landing page endpoints

| Frontend consumer | Method and backend path | Access | Response used | Cache and UI behavior |
| --- | --- | --- | --- | --- |
| `InventorySection` category rail | `GET /categories` | Public | Category `id` and `name` | Revalidates every 60 seconds with `categories` tag; separate loading, empty, and connection-failure states |
| `InventorySection` recently listed grid | `GET /gear?page=1&limit=6` | Public | Gear identity, category, provider, brand, description, stock flag, availability flag, price, pagination metadata | Revalidates every 60 seconds with `gear` tag; labels data “recently listed” because backend sorts newest-first; no unsupported date/search claims |
| `/gear` catalog and `CatalogFilters` | `GET /gear?category?&brand?&minPrice?&maxPrice?&page=1&limit=12` | Public | Filtered gear rows plus `meta.page`, `meta.limit`, and `meta.total` | URL-driven server filtering; revalidates every 60 seconds with `gear` tag; distinct validation, loading, empty, connection-failure, and unexpected-error states; category/brand matching follows the backend’s exact matching behavior |
| `ReviewsSection` field reports | `GET /reviews?page=1&limit=3` | Public | Review rating/comment, customer, gear item, and returned-order status | Revalidates every 60 seconds with `reviews` tag; renders only real returned-order reviews and never fabricates testimonials |

## Error handling

The shared public fetch helper checks the HTTP status and backend `success`
envelope, tolerates empty/non-JSON responses, and returns a safe section-level
error result. A failed categories, gear, or reviews request never crashes the
rest of the landing page or masquerades as a successful empty response.

## Product-contract notes

- Gear list filters do not include keyword or date availability, so the hero has
  no unsupported search form.
- The public catalog lives at `/gear`. It supports the backend’s category,
  exact-brand, and inclusive price-range filters. It explicitly explains that
  keyword and date-availability search require backend support.
- `PLACED` orders do not reserve stock. Landing copy says the provider confirms
  dates before payment.
- Checkout is not initiated on the landing page. The future customer order flow
  must use `POST /orders/:id/checkout-session` only after `CONFIRMED`.
- Gear image URLs can point to arbitrary hosts. This landing milestone uses
  code-owned category visuals instead of an unsafe catch-all Next image allowlist.

## Frontend route organization

- `src/app/(public)` owns the shared public header/footer and the `/` and `/gear`
  pages. The route-group name does not appear in the URL.
- `src/app/(auth)` provides a separate shell for future `/auth/login` and
  `/auth/register` pages without inheriting public navigation.
- The root layout owns global metadata, fonts, Shadcn semantic tokens, and the
  single Sonner toaster used by future mutations.
