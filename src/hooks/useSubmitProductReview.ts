import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitProductReview } from "../api/reviews";
import { useApiClient } from "../api/client";
import type { MerchForgeApiError } from "../errors/MerchForgeApiError";
import type { CreateProductReviewInput, MyProductReview } from "../types/review";
import { useCustomerApiClient } from "./useCustomerApiClient";

/**
 * Submits or edits the signed-in customer's review of a product.
 *
 * An upsert: a customer has at most one review per product, so calling this again
 * replaces their previous rating and comment rather than adding a second review.
 * Requires a signed-in customer who has actually ordered the product — otherwise the
 * API rejects it with a MerchForgeApiError carrying code REVIEW_REQUIRES_PURCHASE,
 * which is worth surfacing rather than swallowing.
 *
 * Like useCreateOrder this is a mutation: call `mutate`/`mutateAsync` from a submit
 * handler rather than expecting it to run on render.
 */
export function useSubmitProductReview(productId: string) {
    const { businessId } = useApiClient();
    const { client } = useCustomerApiClient();
    const queryClient = useQueryClient();

    return useMutation<MyProductReview, MerchForgeApiError, CreateProductReviewInput>({
        mutationFn: (input) => submitProductReview(client, businessId, productId, input),
        onSuccess: () => {
            // One review changes the public list, the summary histogram, this
            // customer's own review, the product detail, and every grid — all of which
            // carry averageRating/reviewCount. Every one of those keys is nested under
            // ["merchforge", businessId, "products"], so a single prefix invalidation
            // covers them; patching five caches by hand would be more code and easier
            // to get wrong.
            queryClient.invalidateQueries({
                queryKey: ["merchforge", businessId, "products"],
            });
        },
    });
}
