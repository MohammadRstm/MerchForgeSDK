import type { Domain } from "./domain";

/**
 * Public store information — everything a storefront needs to boot.
 *
 * Intentionally narrower than the backend's Business entity: owner, members, roles,
 * subscriptions and internal audit fields are not part of the public contract and
 * are never returned.
 */
export interface Business {
    id: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
    /** ISO 4217 code. Prices cannot be formatted correctly without it. */
    currency: string;
    /** BCP 47 tag, for price/date formatting. */
    locale: string;
    contactEmail: string | null;
    contactPhone: string | null;
    /**
     * Null when the business has not selected a domain yet. Such a store has no
     * categories and therefore no products.
     */
    domain: Domain | null;
}
