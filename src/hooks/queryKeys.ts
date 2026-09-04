import type { ProductsQuery } from "../types/product";
import type { ProductReviewsQuery } from "../types/review";

/**
 * Centralized query keys, every one scoped by businessId. Never key SDK queries as
 * just ["products"] — a storefront that renders inside a shared QueryClient (or
 * simply re-renders with a different businessId) must not see another business's
 * cached data. The "merchforge" prefix also keeps these namespaced away from
 * whatever query keys the host app uses for its own, unrelated data.
 */
export const merchForgeQueryKeys = {
    // previewToken is part of the key so switching in/out of preview mode within
    // the same session is a genuinely different cache entry, never a stale mix of
    // published and draft content.
    business: (businessId: string, previewToken: string | null = null) =>
        ["merchforge", businessId, "business", previewToken] as const,

    products: (businessId: string, query: ProductsQuery = {}) =>
        ["merchforge", businessId, "products", query] as const,

    product: (businessId: string, productId: string) =>
        ["merchforge", businessId, "products", productId] as const,

    relatedProducts: (businessId: string, productId: string, limit?: number) =>
        ["merchforge", businessId, "products", productId, "related", limit] as const,

    categories: (businessId: string) =>
        ["merchforge", businessId, "categories"] as const,

    productReviews: (businessId: string, productId: string, query: ProductReviewsQuery = {}) =>
        ["merchforge", businessId, "products", productId, "reviews", query] as const,

    productReviewSummary: (businessId: string, productId: string) =>
        ["merchforge", businessId, "products", productId, "reviews", "summary"] as const,

    // Scoped by businessId and productId but not by customer id: the customer-
    // authenticated client resolves "me" from the bearer token, and logging out clears
    // the whole cache anyway, so adding an id here would only make the key harder to
    // invalidate from the submit mutation.
    myProductReview: (businessId: string, productId: string) =>
        ["merchforge", businessId, "products", productId, "reviews", "me"] as const,

    order: (businessId: string, orderId: string) =>
        ["merchforge", businessId, "orders", orderId] as const,

    // Deliberately NOT businessId-scoped: a Customer is not business-scoped, the same
    // profile is reused across every storefront, so keying by customerId alone is
    // both correct and lets the same cache entry serve any storefront's provider tree.
    customerProfile: (customerId: string) =>
        ["merchforge", "customer", customerId, "profile"] as const,
};
