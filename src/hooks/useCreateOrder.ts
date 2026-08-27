import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder } from "../api/orders";
import { useApiClient } from "../api/client";
import type { MerchForgeApiError } from "../errors/MerchForgeApiError";
import type { CreateOrderInput, Order } from "../types/order";
import { merchForgeQueryKeys } from "./queryKeys";

/**
 * Places an order for the business configured on <MerchForgeProvider>. The storefront
 * owns its own cart state (this SDK does not — see the package README) and should
 * clear it itself in the mutation's onSuccess.
 *
 * Unlike useProducts/useProduct/etc. this is a mutation, not a query: call `mutate`/
 * `mutateAsync` from a submit handler rather than expecting it to run on render.
 */
export function useCreateOrder() {
    const { client, businessId } = useApiClient();
    const queryClient = useQueryClient();

    return useMutation<Order, MerchForgeApiError, CreateOrderInput>({
        mutationFn: (input) => createOrder(client, businessId, input),
        onSuccess: (order) => {
            // Pre-seed the order-confirmation page's useOrder(order.id) cache with
            // what createOrder already returned, so landing on it doesn't need a
            // second round trip.
            queryClient.setQueryData(merchForgeQueryKeys.order(businessId, order.id), order);
        },
    });
}
