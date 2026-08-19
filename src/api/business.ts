import type { AxiosInstance } from "axios";
import { parseOrThrow } from "../errors/MerchForgeApiError";
import { businessSchema } from "../schemas/business";
import type { Business } from "../types/business";

/**
 * GET /Storefront/business?businessId=...
 *
 * NOTE: this endpoint does not exist on the MerchForge backend yet. See the SDK
 * README's "Backend contract" section for the expected request/response shape.
 */
export async function getBusiness(
    client: AxiosInstance,
    businessId: string
): Promise<Business> {
    const { data } = await client.get("/Storefront/business", {
        params: { businessId },
    });

    return parseOrThrow(businessSchema, data);
}
