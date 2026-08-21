import type { ProductsQuery } from "../types/product";

/**
 * Centralized query keys, every one scoped by businessId. Never key SDK queries as
 * just ["products"] — a storefront that renders inside a shared QueryClient (or
 * simply re-renders with a different businessId) must not see another business's
 * cached data. The "merchforge" prefix also keeps these namespaced away from
 * whatever query keys the host app uses for its own, unrelated data.
 */
export const merchForgeQueryKeys = {
    business: (businessId: string) =>
        ["merchforge", businessId, "business"] as const,

    products: (businessId: string, query: ProductsQuery = {}) =>
        ["merchforge", businessId, "products", query] as const,

    product: (businessId: string, productId: string) =>
        ["merchforge", businessId, "products", productId] as const,

    relatedProducts: (businessId: string, productId: string, limit?: number) =>
        ["merchforge", businessId, "products", productId, "related", limit] as const,

    categories: (businessId: string) =>
        ["merchforge", businessId, "categories"] as const,
};
