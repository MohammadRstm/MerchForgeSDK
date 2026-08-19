import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../api/categories";
import { useApiClient } from "../api/client";
import type { Category } from "../types/category";
import type { MerchForgeApiError } from "../errors/MerchForgeApiError";
import { merchForgeQueryKeys } from "./queryKeys";

/**
 * Distinct product categories for the business configured on <MerchForgeProvider>.
 */
export function useCategories() {
    const { client, businessId } = useApiClient();

    return useQuery<Category[], MerchForgeApiError>({
        queryKey: merchForgeQueryKeys.categories(businessId),
        queryFn: () => getCategories(client, businessId),
    });
}
