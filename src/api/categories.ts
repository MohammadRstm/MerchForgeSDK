import type { AxiosInstance } from "axios";
import { categoriesSchema } from "../schemas/category";
import type { Category } from "../types/category";

/**
 * GET /Storefront/categories?businessId=...
 *
 * NOTE: this endpoint does not exist on the MerchForge backend yet — there isn't
 * even a Category entity, only the distinct values of Product.Category. See the SDK
 * README's "Backend contract" section for the expected request/response shape.
 */
export async function getCategories(
    client: AxiosInstance,
    businessId: string
): Promise<Category[]> {
    const { data } = await client.get("/Storefront/categories", {
        params: { businessId },
    });

    return categoriesSchema.parse(data);
}
