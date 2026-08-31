import { useQuery } from "@tanstack/react-query";
import { getOrder } from "../api/orders";
import { useApiClient } from "../api/client";
import type { MerchForgeApiError } from "../errors/MerchForgeApiError";
import type { Order } from "../types/order";
import { merchForgeQueryKeys } from "./queryKeys";
import { shouldRetryQuery } from "./shouldRetryQuery";

/**
 * A single order, for a confirmation or order-tracking page. Pass the id from the
 * URL (e.g. `/order-confirmation/:orderId`) or from useCreateOrder's result.
 */
export function useOrder(orderId: string | undefined) {
    const { client, businessId } = useApiClient();

    return useQuery<Order, MerchForgeApiError>({
        queryKey: merchForgeQueryKeys.order(businessId, orderId ?? ""),
        queryFn: () => getOrder(client, businessId, orderId!),
        enabled: !!orderId,
        retry: shouldRetryQuery,
    });
}
