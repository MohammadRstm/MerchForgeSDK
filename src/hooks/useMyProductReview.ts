import { useQuery } from "@tanstack/react-query";
import { getMyProductReview } from "../api/reviews";
import { useApiClient } from "../api/client";
import type { MerchForgeApiError } from "../errors/MerchForgeApiError";
import type { ProductReviewEligibility } from "../types/review";
import { merchForgeQueryKeys } from "./queryKeys";
import { shouldRetryQuery } from "./shouldRetryQuery";
import { useCustomerApiClient } from "./useCustomerApiClient";

/**
 * Whether the signed-in customer may review this product, plus their existing review
 * if they have one — one request that answers everything a storefront needs to choose
 * between showing the form, a "sign in to review" prompt, and a "buyers only" notice.
 *
 * Disabled while signed out rather than firing and 401ing: a signed-out visitor has
 * no eligibility to report, and the storefront already knows to show the sign-in
 * prompt from useCustomerAuth().isAuthenticated.
 *
 * Note that `isAuthenticated` is false during the initial silent refresh on page load.
 * Gate the UI on useCustomerAuth().isLoading as well, or a signed-in customer sees the
 * signed-out state flash before this can run.
 */
export function useMyProductReview(productId: string) {
    const { businessId } = useApiClient();
    const { client, isAuthenticated } = useCustomerApiClient();

    return useQuery<ProductReviewEligibility, MerchForgeApiError>({
        queryKey: merchForgeQueryKeys.myProductReview(businessId, productId),
        queryFn: () => getMyProductReview(client, businessId, productId),
        enabled: !!productId && isAuthenticated,
        retry: shouldRetryQuery,
    });
}
