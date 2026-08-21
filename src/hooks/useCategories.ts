import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../api/categories";
import { useApiClient } from "../api/client";
import type { Category } from "../types/category";
import type { MerchForgeApiError } from "../errors/MerchForgeApiError";
import { merchForgeQueryKeys } from "./queryKeys";

/**
 * Categories available to the business configured on <MerchForgeProvider>, each with
 * the number of products that business has in it.
 */
export function useCategories() {
    const { client, businessId } = useApiClient();

    return useQuery<Category[], MerchForgeApiError>({
        queryKey: merchForgeQueryKeys.categories(businessId),
        queryFn: () => getCategories(client, businessId),
    });
}
