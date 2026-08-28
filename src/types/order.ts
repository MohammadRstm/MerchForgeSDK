/**
 * Fulfillment lifecycle. Pending -> Confirmed | Cancelled; Confirmed -> Shipped |
 * Cancelled; Shipped -> Delivered. Delivered/Cancelled are terminal. Mirrors the
 * backend's OrderStatus enum exactly.
 */
export type OrderStatus = "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";

/**
 * No payment gateway is wired up yet — every order is created Pending and today only
 * a merchant can flip it by hand (e.g. cash/bank transfer, reconciled outside the
 * SDK). A storefront should treat this as informational, not as proof payment
 * happened. Mirrors the backend's PaymentStatus enum exactly.
 */
export type PaymentStatus = "Pending" | "Paid" | "Refunded";

/** One line of an order, as returned by the API — a point-in-time snapshot of the product at order time, not a live reference to it. */
export interface OrderItem {
    productId: string;
    productTitle: string;
    productImageUrl: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
}

/**
 * An order as returned by createOrder/useOrder. The order's own `id` is the only
 * credential guarding a lookup — there is no customer-account system to authenticate
 * against, the same tradeoff a Stripe/Shopify checkout-session URL makes. Keep it out
 * of anything indexable (don't put raw order ids in analytics/search-engine-visible
 * URLs) for the same reason.
 */
export interface Order {
    id: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    shippingAddressLine1: string;
    shippingAddressLine2: string | null;
    shippingCity: string;
    shippingState: string | null;
    shippingPostalCode: string;
    shippingCountry: string;
    customerNotes: string | null;
    subtotal: number;
    total: number;
    currency: string;
    items: OrderItem[];
    createdAt: string;
}

export interface CreateOrderItemInput {
    productId: string;
    quantity: number;
}

/**
 * Submitted to createOrder. Deliberately carries no price for any item — the backend
 * looks up each product's real, current price itself, so nothing here can be used to
 * under-pay for an order.
 */
export interface CreateOrderInput {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    shippingAddressLine1: string;
    shippingAddressLine2?: string;
    shippingCity: string;
    shippingState?: string;
    shippingPostalCode: string;
    shippingCountry: string;
    customerNotes?: string;
    items: CreateOrderItemInput[];
}
