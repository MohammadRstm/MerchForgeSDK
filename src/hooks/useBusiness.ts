import { useQuery } from "@tanstack/react-query";
import { getBusiness } from "../api/business";
import { useApiClient } from "../api/client";
import type { MerchForgeApiError } from "../errors/MerchForgeApiError";
import type { Business } from "../types/business";
import { merchForgeQueryKeys } from "./queryKeys";

/**
 * Public storefront information for the business configured on <MerchForgeProvider>.
 */
export function useBusiness() {
    const { client, businessId } = useApiClient();

    return useQuery<Business, MerchForgeApiError>({
        queryKey: merchForgeQueryKeys.business(businessId),
        queryFn: () => getBusiness(client, businessId),
    });
}
