import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCustomerProfile } from "../api/customerAuth";
import type { MerchForgeApiError } from "../errors/MerchForgeApiError";
import type { CustomerProfile, UpdateCustomerProfileInput } from "../types/customer";
import { merchForgeQueryKeys } from "./queryKeys";
import { useCustomerApiClient } from "./useCustomerApiClient";
import { useCustomerAuth } from "./useCustomerAuth";

/**
 * Saves the signed-in customer's profile. Never called automatically from checkout —
 * a checkout form prefilled from useCustomerProfile() should call this only on an
 * explicit "save to my profile" action, never just because the customer edited a
 * field for one order ("we never assume").
 */
export function useUpdateCustomerProfile() {
    const { client } = useCustomerApiClient();
    const { customer } = useCustomerAuth();
    const queryClient = useQueryClient();

    return useMutation<CustomerProfile, MerchForgeApiError, UpdateCustomerProfileInput>({
        mutationFn: (input) => updateCustomerProfile(client, input),
        onSuccess: (profile) => {
            if (customer) {
                queryClient.setQueryData(merchForgeQueryKeys.customerProfile(customer.id), profile);
            }
        },
    });
}
