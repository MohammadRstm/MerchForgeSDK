import { useQuery } from "@tanstack/react-query";
import { getProduct } from "../api/products";
import { useApiClient } from "../api/client";
import { merchForgeQueryKeys } from "./queryKeys";

/**
 * A single product by id, for the business configured on <MerchForgeProvider>.
 */
export function useProduct(productId: string) {
    const { client, businessId } = useApiClient();

    return useQuery({
        queryKey: merchForgeQueryKeys.product(businessId, productId),
        queryFn: () => getProduct(client, businessId, productId),
        enabled: !!productId,
    });
}
