import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder } from "../api/orders";
import { useApiClient } from "../api/client";
import type { MerchForgeApiError } from "../errors/MerchForgeApiError";
import type { CreateOrderInput, Order } from "../types/order";
import { merchForgeQueryKeys } from "./queryKeys";
import { useCustomerApiClient } from "./useCustomerApiClient";

/**
 * Places an order for the business configured on <MerchForgeProvider>. The storefront
 * owns its own cart state (this SDK does not — see the package README) and should
 * clear it itself in the mutation's onSuccess.
 *
 * Uses the customer-authenticated client, not the plain anonymous one: when a
 * customer is signed in this attaches their Bearer token so the order links back to
 * them (server-side, optionally — see StorefrontController.CreateOrder), and when
 * they aren't, the same client simply sends no Authorization header, identical to a
 * guest order today. Order creation itself stays fully anonymous-capable either way.
 *
 * Unlike useProducts/useProduct/etc. this is a mutation, not a query: call `mutate`/
 * `mutateAsync` from a submit handler rather than expecting it to run on render.
 */
export function useCreateOrder() {
    const { businessId } = useApiClient();
    const { client } = useCustomerApiClient();
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
