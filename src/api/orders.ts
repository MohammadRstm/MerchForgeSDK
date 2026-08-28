import type { AxiosInstance } from "axios";
import { parseOrThrow } from "../errors/MerchForgeApiError";
import { orderSchema } from "../schemas/order";
import type { CreateOrderInput, Order } from "../types/order";

/**
 * POST /storefront/orders?businessId=...
 *
 * Places an order from the storefront's cart. Throws MerchForgeApiError with
 * code "INSUFFICIENT_STOCK_FOR_ORDER" if a tracked item no longer has enough stock,
 * or "PRODUCT_NOT_FOUND" if an item's productId doesn't belong to this business —
 * both are real possibilities between a customer loading the cart and checking out,
 * and should be shown to the customer rather than treated as unexpected.
 */
export async function createOrder(
    client: AxiosInstance,
    businessId: string,
    input: CreateOrderInput
): Promise<Order> {
    const { data } = await client.post("/storefront/orders", input, {
        params: { businessId },
    });

    return parseOrThrow(orderSchema, data);
}

/**
 * GET /storefront/orders/{orderId}?businessId=...
 *
 * For an order-confirmation or order-tracking page. The order id itself is the only
 * credential — see Order's own doc comment.
 */
export async function getOrder(
    client: AxiosInstance,
    businessId: string,
    orderId: string
): Promise<Order> {
    const { data } = await client.get(`/storefront/orders/${orderId}`, {
        params: { businessId },
    });

    return parseOrThrow(orderSchema, data);
}
