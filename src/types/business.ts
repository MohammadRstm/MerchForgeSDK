import type { Domain } from "./domain";

/** One weekday's open/close time, or null when the business hasn't set that day at all (distinct from `closed: true`, which is an explicit "we're closed this day"). */
export interface BusinessHoursDay {
    closed: boolean;
    open: string | null;
    close: string | null;
}

export interface BusinessHours {
    monday: BusinessHoursDay | null;
    tuesday: BusinessHoursDay | null;
    wednesday: BusinessHoursDay | null;
    thursday: BusinessHoursDay | null;
    friday: BusinessHoursDay | null;
    saturday: BusinessHoursDay | null;
    sunday: BusinessHoursDay | null;
}

/** Fixed key set — a template renders whichever of these are non-null and hides the rest, never a placeholder link. */
export interface SocialLinks {
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    tikTok: string | null;
    youTube: string | null;
    linkedIn: string | null;
}

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
    tagline: string | null;
    logoUrl: string | null;
    faviconUrl: string | null;
    /** ISO 4217 code. Prices cannot be formatted correctly without it. */
    currency: string;
    /** BCP 47 tag, for price/date formatting. */
    locale: string;
    contactEmail: string | null;
    contactPhone: string | null;
    /** Digits/E.164 only, never a full URL — build the `wa.me/<number>` link yourself. */
    whatsAppNumber: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
    socialLinks: SocialLinks;
    businessHours: BusinessHours;
    /** Hex color (e.g. "#1A1A1A"), or null if the business hasn't set one. */
    primaryColor: string | null;
    /**
     * The current template's own structural customization values (hero image,
     * headline, promo banner, ...), keyed by whatever `WebsiteTemplateCustomizableComponent.Key`
     * values that specific template registers. Deliberately opaque here — only the
     * currently-selected template's own code knows what keys to expect, so read this
     * with the exact keys documented by that template's integration, with a fallback
     * for when a key has no value yet.
     */
    templateFields: Record<string, unknown>;
    /**
     * Null when the business has not selected a domain yet. Such a store has no
     * categories and therefore no products.
     */
    domain: Domain | null;
}
