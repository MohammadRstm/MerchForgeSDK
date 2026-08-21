/**
 * The business vertical a storefront operates in (Fashion, Restaurant, ...).
 *
 * Categories belong to a domain, so this is what determines which categories a
 * store's products can use.
 */
export interface Domain {
    id: string;
    name: string;
    /**
     * Stable public identifier ("fashion"). Branch on this rather than on `name`,
     * which is a display value and may be renamed or localized.
     */
    slug: string;
}
