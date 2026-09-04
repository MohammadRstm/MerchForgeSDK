import { useQuery } from "@tanstack/react-query";
import { getProductReviewSummary } from "../api/reviews";
import { useApiClient } from "../api/client";
import type { MerchForgeApiError } from "../errors/MerchForgeApiError";
import type { ProductReviewSummary } from "../types/review";
import { merchForgeQueryKeys } from "./queryKeys";
import { shouldRetryQuery } from "./shouldRetryQuery";

/**
 * Average rating, review count and the per-star breakdown for one product.
 *
 * Product and ProductDetail already carry averageRating/reviewCount, so a grid or a
 * product heading does not need this hook. Reach for it when rendering the ratings
 * histogram, which needs the per-star counts nothing else returns.
 */
export function useProductReviewSummary(productId: string) {
    const { client, businessId } = useApiClient();

    return useQuery<ProductReviewSummary, MerchForgeApiError>({
        queryKey: merchForgeQueryKeys.productReviewSummary(businessId, productId),
        queryFn: () => getProductReviewSummary(client, businessId, productId),
        enabled: !!productId,
        retry: shouldRetryQuery,
    });
}
