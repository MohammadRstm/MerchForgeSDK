/**
 * A shopper's identity — completely independent of any one business, reusable across
 * every storefront MerchForge serves. Never confuse with anything business-scoped:
 * there is deliberately no businessId anywhere on this type.
 */
export interface Customer {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}

/** Customer plus the checkout-prefill address fields, as returned by GET /customer/profile. */
export interface CustomerProfile extends Customer {
    phone: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
}

/** Submitted to PUT /customer/profile. Email is not editable here — see the backend's own note. */
export interface UpdateCustomerProfileInput {
    firstName: string;
    lastName: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}

/**
 * Returned by every endpoint that establishes or renews a customer's access token
 * (exchange/silent). accessTokenExpiresAt is an ISO datetime string, same as the
 * backend's DTO — converted to an epoch number only internally, where it's used for
 * renewal-timer math.
 */
export interface CustomerSession {
    accessToken: string;
    accessTokenExpiresAt: string;
    customer: Customer;
}
