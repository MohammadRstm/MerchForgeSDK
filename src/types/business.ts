/**
 * Public storefront business information. Deliberately minimal: this mirrors only
 * what the MerchForge Business model currently exposes that's safe and useful for
 * an anonymous storefront visitor (see the Storefront API contract note in the
 * package README for the full field discussion).
 */
export interface Business {
    id: string;
    name: string;
}
