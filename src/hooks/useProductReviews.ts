import { useQuery } from "@tanstack/react-query";
import { getProductReviews } from "../api/reviews";
import { useApiClient } from "../api/client";
import type { MerchForgeApiError } from "../errors/MerchForgeApiError";
import type { PagedResult } from "../types/pagination";
import type { ProductReview, ProductReviewsQuery } from "../types/review";
import { merchForgeQueryKeys } from "./queryKeys";
import { shouldRetryQuery } from "./shouldRetryQuery";

/**
 * A product's published reviews, newest first. Uses the anonymous client — reviews
 * are public, and a signed-out visitor sees exactly what a signed-in one does.
 * Reviews the merchant has hidden are never returned.
 */
export function useProductReviews(productId: string, query: ProductReviewsQuery = {}) {
    const { client, businessId } = useApiClient();

    return useQuery<PagedResult<ProductReview>, MerchForgeApiError>({
        queryKey: merchForgeQueryKeys.productReviews(businessId, productId, query),
        queryFn: () => getProductReviews(client, businessId, productId, query),
        enabled: !!productId,
        retry: shouldRetryQuery,
    });
}
