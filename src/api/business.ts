import type { AxiosInstance } from "axios";
import { parseOrThrow } from "../errors/MerchForgeApiError";
import { businessSchema } from "../schemas/business";
import type { Business } from "../types/business";

/**
 * GET /storefront/business?businessId=...
 */
export async function getBusiness(
    client: AxiosInstance,
    businessId: string
): Promise<Business> {
    const { data } = await client.get("/storefront/business", {
        params: { businessId },
    });

    return parseOrThrow(businessSchema, data);
}
