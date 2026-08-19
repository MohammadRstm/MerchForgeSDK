import { useQuery } from "@tanstack/react-query";
import { getProduct } from "../api/products";
import { useApiClient } from "../api/client";
import type { MerchForgeApiError } from "../errors/MerchForgeApiError";
import type { ProductDetail } from "../types/product";
import { merchForgeQueryKeys } from "./queryKeys";

/**
 * A single product by id, including its description and metadata, for the business
 * configured on <MerchForgeProvider>.
 */
export function useProduct(productId: string) {
    const { client, businessId } = useApiClient();

    return useQuery<ProductDetail, MerchForgeApiError>({
        queryKey: merchForgeQueryKeys.product(businessId, productId),
        queryFn: () => getProduct(client, businessId, productId),
        enabled: !!productId,
    });
}
