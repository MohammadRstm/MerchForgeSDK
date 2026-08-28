import { useQuery } from "@tanstack/react-query";
import { getBusiness } from "../api/business";
import { useApiClient } from "../api/client";
import type { MerchForgeApiError } from "../errors/MerchForgeApiError";
import type { Business } from "../types/business";
import { merchForgeQueryKeys } from "./queryKeys";

/**
 * Public storefront information for the business configured on <MerchForgeProvider>.
 *
 * Transparently returns the draft (not the published data) when this page was
 * opened in preview mode — see previewMode.ts. Template code never needs to branch
 * on this; the response shape is identical either way.
 */
export function useBusiness() {
    const { client, businessId, previewToken } = useApiClient();

    return useQuery<Business, MerchForgeApiError>({
        queryKey: merchForgeQueryKeys.business(businessId, previewToken),
        queryFn: () => getBusiness(client, businessId, previewToken),
    });
}
