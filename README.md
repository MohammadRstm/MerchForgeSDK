# @merchforge/storefront-sdk

Shared data/business layer for independent MerchForge storefront React applications.

Each MerchForge business eventually gets its own, completely independent storefront
repo — its own UI, routing, styling, checkout flow, everything. What they all share
is *how* they talk to the MerchForge backend. That's this package. It is **not** a
component library — it ships hooks and data, never `<ProductCard />`-style UI.

```
MerchForge Backend
        |
        v
Storefront API Contract
        |
        v
@merchforge/storefront-sdk
        |
   +----+----+----+
   |         |         |
Business A  Business B  Business C
React app   React app   React app
Custom UI   Custom UI   Custom UI
```

## Status

Catalog stage. The read-side storefront API exists on the MerchForge backend and
every endpoint below has been verified end to end against it with real data —
business/store configuration, domain-scoped categories, product search, filtering,
sorting, pagination, product detail, related products, and flexible product
metadata.

Orders, customer accounts, and product reviews are implemented too — order
placement and lookup, the hosted customer login/silent-refresh handoff, and reviews
(a required 1-5 rating plus an optional comment, restricted to verified purchasers).

Not implemented anywhere yet: cart state (storefronts own their own), payments,
wishlists, shipping, inventory, coupons.

## Install (local development)

Not published yet. Until it is, consume it from a sibling checkout with a `file:`
dependency:

```json
{
  "dependencies": {
    "@merchforge/storefront-sdk": "file:../merchforge-storefront-sdk"
  }
}
```

Then build the SDK before your app picks up changes:

```bash
npm run build     # in this repo
```

## Quick start

```tsx
import { MerchForgeProvider, useBusiness, useProducts } from "@merchforge/storefront-sdk";

function App() {
    return (
        <MerchForgeProvider
            apiUrl="https://localhost:7021/api"
            businessId="b810942d-b92c-4390-aa21-18aa82c84b87"
        >
            <Storefront />
        </MerchForgeProvider>
    );
}

function Storefront() {
    const { data: business, isLoading: businessLoading } = useBusiness();
    const { data: products, isLoading: productsLoading, isError, error } = useProducts();

    // Build whatever UI you want with this — the SDK has no opinion on it.
}
```

`MerchForgeProvider` sets up everything: API config, business context, and its own
internal React Query `QueryClient` (pass your own via the `queryClient` prop if you
need to share one with the rest of your app).

## Public API

```ts
import {
    MerchForgeProvider,
    useBusiness,
    useCategories,
    useProducts,
    useProduct,
    useRelatedProducts,
    MerchForgeApiError,
} from "@merchforge/storefront-sdk";
```

| Export | Purpose |
| --- | --- |
| `MerchForgeProvider` | Establishes `apiUrl` + `businessId` for every hook below. Renders no UI. |
| `useBusiness()` | Store identity, configuration (currency, locale, logo, contact), and its domain. |
| `useCategories()` | Categories available to this store, each with a per-business `productCount`. |
| `useProducts(query?)` | Paginated catalog. `query`: `{ page?, pageSize?, search?, categoryId?, minPrice?, maxPrice?, sortBy?, sortDescending? }`. |
| `useProduct(id)` | A single product, including `description` and `metadata`. |
| `useRelatedProducts(id, limit?)` | Other products in the same category, excluding this one. |
| `MerchForgeApiError` | The error type every hook's `error` field is guaranteed to be. |

### Domains, categories, and metadata

Every MerchForge business belongs to a **domain** (its vertical — Fashion,
Restaurant, Electronics). Categories belong to a domain, and products reference a
category, so a Fashion store's products can only use Fashion categories.
`useBusiness().data.domain` is `null` for a store that has not selected one; such a
store has no categories and therefore no products.

Products carry a `metadata` object of vertical-specific attributes:

```ts
// fashion
{ colors: ["Black", "White"], sizes: ["S", "M", "L"], material: "Cotton" }
// restaurant
{ ingredients: ["Cheese", "Tomato"], spicy: true }
// electronics
{ brand: "Sony", storage: "256GB", ram: "16GB" }
```

Its keys differ per vertical, so it is typed `Record<string, unknown>` and validated
only as "an object" — asserting specific keys would reject valid products from a
vertical this SDK version hadn't anticipated. Narrow before use:

```tsx
const colors = Array.isArray(product.metadata?.colors) ? product.metadata.colors : [];
```

All hooks return standard React Query state (`data`, `isLoading`, `isError`,
`error`, ...) — nothing SDK-specific to learn there.

Everything not listed above (the Axios client, query key internals, context
plumbing) is a private implementation detail. Only import from
`"@merchforge/storefront-sdk"`, never from its `dist`/`src` internals.

## Architecture

```
MerchForgeProvider
        |
        v
SDK configuration/context   (context/)
        |
        v
API client                  (api/client.ts — one Axios instance, one error interceptor)
        |
        v
API modules                 (api/business.ts, api/products.ts, api/categories.ts
        |                     — plain functions: client + params in, parsed data out)
        v
React Query hooks           (hooks/ — useQuery wrapping the API modules)
```

- **No hidden global state.** The Axios client is created per `<MerchForgeProvider>`
  tree (memoized on `apiUrl`), not a module-level singleton — multiple providers
  never share connection state.
- **Query keys are business-scoped.** Every key is `["merchforge", businessId, ...]`.
  Never `["products"]` alone — that would let cached data leak across businesses if
  a `businessId` ever changes at runtime. Concretely: if the `businessId` prop passed
  to `<MerchForgeProvider>` changes without unmounting, React Query treats it as a
  disjoint set of cache entries (different key = different entry), so a stale
  business's data can never be returned under a new business's key — proven by a
  regression test (`hooks/businessIsolation.test.tsx`), not just asserted here.
- **Zod validates every response.** Backend DTOs are not exposed as-is; `types/` +
  `schemas/` define the intentional public storefront contract, which is narrower
  than the backend's internal models (`Product.BusinessId` is redundant once every
  request is business-scoped, and `UpdatedAt` is internal audit data — both dropped).
  `metadata` is the deliberate exception: validated as an object but not against
  fixed keys, since it is schemaless by design.
- **One error shape.** `api/client.ts` installs a response interceptor that converts
  every failure into a `MerchForgeApiError` before it reaches a hook, so storefronts
  never handle raw Axios errors or the backend's wire format.
- **businessId is not a security boundary.** It's a public "which catalog" selector,
  same as any public storefront API. The backend must still enforce that these
  endpoints only ever return genuinely public data, regardless of what businessId is
  passed — never mount authenticated/merchant data behind these routes.

## Backend contract

These endpoints exist on the MerchForge API. This repo does not modify the backend;
they are documented here because the SDK is the contract between MerchForge and
independent storefronts.

`businessId` is a query parameter rather than part of the path, so hostname-based
resolution can replace it later without changing any route shape or SDK function.
It identifies which catalog to read — it is **not** authorization. These endpoints
are anonymous and must only ever return publicly safe data.

Conventions shared with the rest of MerchForge: camelCase JSON, the platform
`PagedResult<T>` envelope (`items`/`page`/`pageSize`/`totalCount`/`totalPages`), UTC
ISO-8601 datetimes, and the `ApiErrorResponse` shape
(`type`/`code`/`message`/`traceId`/`errors?`) with `type` as a **string** enum
(`Validation` | `Authentication` | `Authorization` | `NotFound` | `Conflict` |
`Unexpected`).

| Endpoint | SDK function | Hook |
| --- | --- | --- |
| `GET /api/storefront/business` | `getBusiness` | `useBusiness()` |
| `GET /api/storefront/categories` | `getCategories` | `useCategories()` |
| `GET /api/storefront/products` | `getProducts` | `useProducts(query?)` |
| `GET /api/storefront/products/{id}` | `getProduct` | `useProduct(id)` |
| `GET /api/storefront/products/{id}/related` | `getRelatedProducts` | `useRelatedProducts(id, limit?)` |
| `GET /api/storefront/products/{id}/reviews` | `getProductReviews` | `useProductReviews(id, query?)` |
| `GET /api/storefront/products/{id}/reviews/summary` | `getProductReviewSummary` | `useProductReviewSummary(id)` |
| `GET /api/storefront/products/{id}/reviews/me` | `getMyProductReview` | `useMyProductReview(id)` |
| `POST /api/storefront/products/{id}/reviews` | `submitProductReview` | `useSubmitProductReview(id)` |

### `GET /api/storefront/business?businessId={id}`

```json
{
  "id": "guid",
  "name": "string",
  "description": "string | null",
  "logoUrl": "string | null",
  "currency": "USD",
  "locale": "en-US",
  "contactEmail": "string | null",
  "contactPhone": "string | null",
  "domain": { "id": "guid", "name": "Fashion", "slug": "fashion" }
}
```

`domain` is `null` when the business has not selected one. No owner, members,
roles, subscription, or audit data is exposed.

### `GET /api/storefront/categories?businessId={id}`

```json
[{ "id": "guid", "name": "Shoes", "slug": "shoes", "displayOrder": 1, "productCount": 2 }]
```

The active categories of this business's domain. `productCount` is scoped to this
business, so a storefront can decide for itself whether to hide empty categories.

### `GET /api/storefront/products`

Query: `businessId`, `page`, `pageSize`, `search`, `categoryId`, `minPrice`,
`maxPrice`, `sortBy` (`CreatedAt` | `Title` | `Price`), `sortDescending`.

```json
{
  "items": [
    {
      "id": "guid",
      "title": "Urban Sneakers",
      "price": 120.0,
      "imageUrl": "string | null",
      "category": { "id": "guid", "name": "Shoes", "slug": "shoes" },
      "metadata": { "colors": ["Black"], "sizes": ["41"] },
      "createdAt": "2026-02-01T10:00:00Z"
    }
  ],
  "page": 1, "pageSize": 20, "totalCount": 4, "totalPages": 1
}
```

List items carry `metadata` but not `description` — grids need metadata to render,
while description is the large field. Filtering is by `categoryId`, not name: names
are display values and are not unique across domains ("Accessories" exists under
both Fashion and Electronics).

There is deliberately no "featured products" endpoint (no field backs it) and no
separate "new products" or "products by category" routes — those are already
`?sortBy=CreatedAt` and `?categoryId=`.

### `GET /api/storefront/products/{productId}?businessId={id}`

Same shape as a list item, plus `description`. Returns `404` if the product does not
exist **or belongs to a different business** — the two are indistinguishable by
design, so one storefront cannot probe another's catalog by id.

### `GET /api/storefront/products/{productId}/related?businessId={id}&limit=4`

Array of list-shaped products in the same category, excluding this one. `limit`
defaults to 4 and is clamped to 20. An empty array is a normal result; an unknown
product id is a `404`.


### Reviews

A review is a required 1-5 star rating plus an optional comment. Only customers who
have actually ordered the product can post one — the API answers 409
`REVIEW_REQUIRES_PURCHASE` otherwise — and each customer has at most one review per
product, so `POST` is an upsert: submitting again edits their existing review rather
than adding a second.

Reviews a merchant has hidden never appear in the public list and are excluded from
the average. `Product.averageRating` / `Product.reviewCount` carry the same aggregate
on every product, so grids and headings do not need a separate request;
`useProductReviewSummary` exists for the per-star histogram.

`useMyProductReview` and `useSubmitProductReview` use the customer-authenticated
client. `useMyProductReview` stays disabled while signed out rather than 401ing.
Gate the form on `useCustomerAuth().isLoading` as well as `isAuthenticated` — during
the initial silent refresh on page load `isAuthenticated` is still `false`, so a
signed-in customer would otherwise see the signed-out state flash.

```json
// GET /reviews -> PagedResult<ProductReview>
{ "id": "guid", "rating": 5, "comment": "string | null",
  "authorDisplayName": "Mia S.", "createdAt": "iso" }

// GET /reviews/summary -> ProductReviewSummary
{ "averageRating": 4.5, "reviewCount": 2,
  "ratingBreakdown": { "1": 0, "2": 0, "3": 0, "4": 1, "5": 1 } }

// GET /reviews/me -> ProductReviewEligibility   (401 without a customer token)
{ "canReview": true, "myReview": null }

// POST /reviews  body { rating, comment? } -> MyProductReview
{ "id": "guid", "rating": 4, "comment": null, "isHidden": false,
  "createdAt": "iso", "updatedAt": "iso" }
```
### CORS

The storefront API uses a dedicated anonymous, credential-free CORS policy that
allows any origin, because independent storefronts deploy to origins MerchForge
cannot know in advance. Storefronts do **not** need to be added to any allow-list.
(The authenticated dashboard API keeps its separate credentialed allow-list policy.)


## Testing

```bash
npm test          # run once
npm run test:watch
```

Vitest + `@testing-library/react`, focused on protecting the architecture rather
than chasing coverage: provider configuration/validation, query key business
scoping, business isolation across a runtime `businessId` change, product query
parameter construction, response schema validation (including that metadata keeps
its value types and that the old bare-string category shape is rejected), and error
normalization (`toMerchForgeApiError` across all three failure modes: structured
backend error, unstructured-but-real HTTP response, and true network failure).

## Example app

`example/` is a minimal integration test, not a template for a real storefront. It
proves the full chain (`MerchForgeProvider` → hooks → API client → MerchForge API)
works, nothing more.

```bash
npm install
npm run build
npm run dev --workspace example
```

It exercises every hook: store configuration, category filtering, sorted/paginated
products with metadata, product detail, and related products. It needs the
MerchForge API running and a `businessId` that has a domain selected — a business
with no domain has no categories and therefore no products.
