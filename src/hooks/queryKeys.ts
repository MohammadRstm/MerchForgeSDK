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

    order: (businessId: string, orderId: string) =>
        ["merchforge", businessId, "orders", orderId] as const,

    // Deliberately NOT businessId-scoped: a Customer is not business-scoped, the same
    // profile is reused across every storefront, so keying by customerId alone is
    // both correct and lets the same cache entry serve any storefront's provider tree.
    customerProfile: (customerId: string) =>
        ["merchforge", "customer", customerId, "profile"] as const,
};
