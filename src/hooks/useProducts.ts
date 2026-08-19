import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../api/products";
import { useApiClient } from "../api/client";
import type { ProductsQuery } from "../types/product";
import { merchForgeQueryKeys } from "./queryKeys";

/**
 * Paginated product catalog for the business configured on <MerchForgeProvider>.
 * Pass search/category/sort/page params as needed — how they're presented
 * (pagination buttons, "load more", infinite scroll, ...) is entirely up to the
 * storefront.
 */
export function useProducts(query: ProductsQuery = {}) {
    const { client, businessId } = useApiClient();

    return useQuery({
        queryKey: merchForgeQueryKeys.products(businessId, query),
        queryFn: () => getProducts(client, businessId, query),
    });
}
