import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../api/products";
import { useApiClient } from "../api/client";
import type { MerchForgeApiError } from "../errors/MerchForgeApiError";
import type { PagedResult } from "../types/pagination";
import type { Product, ProductsQuery } from "../types/product";
import { merchForgeQueryKeys } from "./queryKeys";
import { shouldRetryQuery } from "./shouldRetryQuery";

/**
 * Paginated product catalog for the business configured on <MerchForgeProvider>.
 * Pass search/category/sort/page params as needed — how they're presented
 * (pagination buttons, "load more", infinite scroll, ...) is entirely up to the
 * storefront.
 */
export function useProducts(query: ProductsQuery = {}) {
    const { client, businessId } = useApiClient();

    return useQuery<PagedResult<Product>, MerchForgeApiError>({
        queryKey: merchForgeQueryKeys.products(businessId, query),
        queryFn: () => getProducts(client, businessId, query),
        retry: shouldRetryQuery,
    });
}
