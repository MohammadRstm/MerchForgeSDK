import type { AxiosInstance } from "axios";
import { parseOrThrow } from "../errors/MerchForgeApiError";
import { pagedResultSchema } from "../schemas/pagination";
import { productDetailSchema, productSchema, productsSchema } from "../schemas/product";
import type { PagedResult } from "../types/pagination";
import type { Product, ProductDetail, ProductsQuery } from "../types/product";

const productsPageSchema = pagedResultSchema(productSchema);

/**
 * GET /storefront/products?businessId=...&page=&pageSize=&search=&categoryId=
 *                          &minPrice=&maxPrice=&sortBy=&sortDescending=
 *
 * Axios drops undefined params, so unset filters are simply not sent.
 */
export async function getProducts(
    client: AxiosInstance,
    businessId: string,
    query: ProductsQuery = {}
): Promise<PagedResult<Product>> {
    const { data } = await client.get("/storefront/products", {
        params: { businessId, ...query },
    });

    return parseOrThrow(productsPageSchema, data);
}

/**
 * GET /storefront/products/{productId}?businessId=...
 *
 * 404s if the product does not exist or belongs to a different business — the
 * backend does not distinguish the two, so one storefront cannot probe another
 * business's catalog by id.
 */
export async function getProduct(
    client: AxiosInstance,
    businessId: string,
    productId: string
): Promise<ProductDetail> {
    const { data } = await client.get(`/storefront/products/${productId}`, {
        params: { businessId },
    });

    return parseOrThrow(productDetailSchema, data);
}

/**
 * GET /storefront/products/{productId}/related?businessId=...&limit=
 *
 * Other products in the same category, excluding this one.
 */
export async function getRelatedProducts(
    client: AxiosInstance,
    businessId: string,
    productId: string,
    limit?: number
): Promise<Product[]> {
    const { data } = await client.get(`/storefront/products/${productId}/related`, {
        params: { businessId, limit },
    });

    return parseOrThrow(productsSchema, data);
}
