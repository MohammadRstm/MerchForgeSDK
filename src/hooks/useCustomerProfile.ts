import { useQuery } from "@tanstack/react-query";
import { getCustomerProfile } from "../api/customerAuth";
import type { MerchForgeApiError } from "../errors/MerchForgeApiError";
import type { CustomerProfile } from "../types/customer";
import { merchForgeQueryKeys } from "./queryKeys";
import { useCustomerApiClient } from "./useCustomerApiClient";
import { useCustomerAuth } from "./useCustomerAuth";

/** The signed-in customer's full profile, including checkout-prefill address fields. */
export function useCustomerProfile() {
    const { client, isAuthenticated } = useCustomerApiClient();
    const { customer } = useCustomerAuth();

    return useQuery<CustomerProfile, MerchForgeApiError>({
        queryKey: merchForgeQueryKeys.customerProfile(customer?.id ?? ""),
        queryFn: () => getCustomerProfile(client),
        enabled: isAuthenticated,
    });
}
