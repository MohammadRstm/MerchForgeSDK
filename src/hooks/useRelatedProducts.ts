import { useQuery } from "@tanstack/react-query";
import { getRelatedProducts } from "../api/products";
import { useApiClient } from "../api/client";
import type { MerchForgeApiError } from "../errors/MerchForgeApiError";
import type { Product } from "../types/product";
import { merchForgeQueryKeys } from "./queryKeys";

/**
 * Other products in the same category as the given product, excluding it.
 *
 * Returns an empty array when the product is the only one in its category — that is
 * a normal result, not an error. An unknown product id errors with NotFound.
 */
export function useRelatedProducts(productId: string, limit?: number) {
    const { client, businessId } = useApiClient();

    return useQuery<Product[], MerchForgeApiError>({
        queryKey: merchForgeQueryKeys.relatedProducts(businessId, productId, limit),
        queryFn: () => getRelatedProducts(client, businessId, productId, limit),
        enabled: !!productId,
    });
}
