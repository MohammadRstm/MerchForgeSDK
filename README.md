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

Foundation stage. `useBusiness`, `useProducts`, `useProduct`, and `useCategories`
exist and are correctly wired end to end — but **the backend endpoints they call do
not exist yet** (see [Backend contract](#backend-contract) below). This package
defines the contract and is ready the moment those endpoints ship.

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
    useProducts,
    useProduct,
    useCategories,
    MerchForgeApiError,
} from "@merchforge/storefront-sdk";
```

| Export | Purpose |
| --- | --- |
| `MerchForgeProvider` | Establishes `apiUrl` + `businessId` for every hook below. Renders no UI. |
| `useBusiness()` | Public info for the configured business. |
| `useProducts(query?)` | Paginated product catalog. `query`: `{ page?, pageSize?, search?, category?, sortBy?, sortDescending? }`. |
| `useProduct(id)` | A single product. |
| `useCategories()` | Distinct category names for the business. |
| `MerchForgeApiError` | The error type every hook's `error` field is guaranteed to be. |

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
  a `businessId` ever changes at runtime.
- **Zod validates every response.** Backend DTOs are not exposed as-is; `types/` +
  `schemas/` define the intentional public storefront contract, which is narrower
  than the backend's internal models (e.g. `Product.BusinessId`/`UpdatedAt` are
  dropped — redundant/internal for a storefront).
- **One error shape.** `api/client.ts` installs a response interceptor that converts
  every failure into a `MerchForgeApiError` before it reaches a hook, so storefronts
  never handle raw Axios errors or the backend's wire format.
- **businessId is not a security boundary.** It's a public "which catalog" selector,
  same as any public storefront API. The backend must still enforce that these
  endpoints only ever return genuinely public data, regardless of what businessId is
  passed — never mount authenticated/merchant data behind these routes.

## Backend contract

**None of the endpoints below exist on the MerchForge API yet.** This repo does not
modify the backend — these are the routes the SDK is built against and that need to
be implemented there.

Business ID is passed as a query parameter (not baked into the URL path) so it can
later be made optional/inferred from the storefront's hostname without changing the
route shape or any SDK code.

Conventions carried over from the rest of MerchForge: camelCase JSON, the existing
`PagedResult<T>` shape (`items`/`page`/`pageSize`/`totalCount`/`totalPages`), UTC
ISO-8601 datetimes, and the existing `ApiErrorResponse` shape
(`type`/`code`/`message`/`traceId`/`errors?`) for error bodies.

### `GET /api/Storefront/business?businessId={id}`

```json
{ "id": "guid", "name": "string" }
```

Only `Business.Id`/`Business.Name` — no owner, member, or subscription info.

### `GET /api/Storefront/products?businessId={id}&page=&pageSize=&search=&category=&sortBy=&sortDescending=`

`sortBy` ∈ `CreatedAt | Title | Price` (same field set as `ProductSortField` in the
dashboard API).

```json
{
  "items": [
    {
      "id": "guid",
      "title": "string",
      "description": "string",
      "price": 0,
      "category": "string",
      "imageUrl": "string | null",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 0,
  "totalPages": 0
}
```

### `GET /api/Storefront/products/{productId}?businessId={id}`

Same shape as one item above. `404` if the product doesn't exist or doesn't belong
to `businessId`.

### `GET /api/Storefront/categories?businessId={id}`

```json
["Electronics", "Clothing"]
```

There is no `Category` entity in MerchForge — `Product.Category` is a plain string
column. This is the distinct values of that column for the business. If richer
category data (id, image, description, product count) is ever needed, that requires
a real `Category` table first; don't invent one just to satisfy this endpoint.

### Also needed: CORS

Each storefront's origin (dev and eventually production, per business domain) needs
to be added to the API's CORS allow-list before a browser-based storefront can call
these endpoints at all — confirmed while testing the example app here: requests to
the real backend were correctly constructed but blocked by CORS since this SDK's
example app's origin isn't allow-listed.

## Example app

`example/` is a minimal integration test, not a template for a real storefront. It
proves the full chain (`MerchForgeProvider` → hooks → API client → MerchForge API)
works, nothing more.

```bash
npm install
npm run build
npm run dev --workspace example
```

Since the Storefront endpoints don't exist on the backend yet, the example currently
shows loading/empty states rather than real product data — that's expected until
the backend contract above is implemented.
