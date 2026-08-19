import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../api/categories";
import { useApiClient } from "../api/client";
import { merchForgeQueryKeys } from "./queryKeys";

/**
 * Distinct product categories for the business configured on <MerchForgeProvider>.
 */
export function useCategories() {
    const { client, businessId } = useApiClient();

    return useQuery({
        queryKey: merchForgeQueryKeys.categories(businessId),
        queryFn: () => getCategories(client, businessId),
    });
}
