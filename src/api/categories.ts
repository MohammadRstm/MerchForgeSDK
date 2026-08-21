import type { AxiosInstance } from "axios";
import { parseOrThrow } from "../errors/MerchForgeApiError";
import { categoriesSchema } from "../schemas/category";
import type { Category } from "../types/category";

/**
 * GET /storefront/categories?businessId=...
 *
 * Returns the active categories of this business's domain, each with the number of
 * products this business has in it. Empty for a business with no domain selected.
 */
export async function getCategories(
    client: AxiosInstance,
    businessId: string
): Promise<Category[]> {
    const { data } = await client.get("/storefront/categories", {
        params: { businessId },
    });

    return parseOrThrow(categoriesSchema, data);
}
