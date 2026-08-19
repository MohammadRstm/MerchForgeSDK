import type { AxiosInstance } from "axios";
import { parseOrThrow } from "../errors/MerchForgeApiError";
import { pagedResultSchema } from "../schemas/pagination";
import { productSchema } from "../schemas/product";
import type { PagedResult } from "../types/pagination";
import type { Product, ProductsQuery } from "../types/product";

const productsPageSchema = pagedResultSchema(productSchema);

/**
 * GET /Storefront/products?businessId=...&page=&pageSize=&search=&category=&sortBy=&sortDescending=
 *
 * NOTE: this endpoint does not exist on the MerchForge backend yet. See the SDK
 * README's "Backend contract" section for the expected request/response shape.
 */
export async function getProducts(
    client: AxiosInstance,
    businessId: string,
    query: ProductsQuery = {}
): Promise<PagedResult<Product>> {
    const { data } = await client.get("/Storefront/products", {
        params: { businessId, ...query },
    });

    return parseOrThrow(productsPageSchema, data);
}

/**
 * GET /Storefront/products/{productId}?businessId=...
 *
 * NOTE: this endpoint does not exist on the MerchForge backend yet. See the SDK
 * README's "Backend contract" section for the expected request/response shape.
 */
export async function getProduct(
    client: AxiosInstance,
    businessId: string,
    productId: string
): Promise<Product> {
    const { data } = await client.get(`/Storefront/products/${productId}`, {
        params: { businessId },
    });

    return parseOrThrow(productSchema, data);
}
