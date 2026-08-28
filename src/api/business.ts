import type { AxiosInstance } from "axios";
import { parseOrThrow } from "../errors/MerchForgeApiError";
import { businessSchema } from "../schemas/business";
import type { Business } from "../types/business";

/**
 * GET /storefront/business?businessId=..., or GET /storefront/preview?businessId=&token=
 * when previewToken is set — the draft overlaid on published, for the dashboard's
 * "Preview" flow. Same response shape either way, so callers never need to branch on
 * which one was actually fetched.
 */
export async function getBusiness(
    client: AxiosInstance,
    businessId: string,
    previewToken?: string | null
): Promise<Business> {
    if (previewToken) {
        const { data } = await client.get("/storefront/preview", {
            params: { businessId, token: previewToken },
        });

        return parseOrThrow(businessSchema, data);
    }

    const { data } = await client.get("/storefront/business", {
        params: { businessId },
    });

    return parseOrThrow(businessSchema, data);
}
