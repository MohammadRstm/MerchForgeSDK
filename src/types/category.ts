/**
 * A category available to this store, with the number of products the business
 * actually has in it.
 *
 * This replaced the earlier `type Category = string`, which reflected the backend
 * storing categories as a plain column. Categories are now a real entity owned by a
 * business domain, so the SDK exposes the real shape rather than flattening it.
 */
export interface Category {
    id: string;
    name: string;
    /** Stable identifier for building category URLs that survive a rename. */
    slug: string;
    /**
     * Suggested navigation ordering. Whether to honour it is a UI decision — the SDK
     * only supplies the value.
     */
    displayOrder: number;
    /**
     * Products this business has in this category. Provided so a storefront can
     * decide for itself whether to hide empty categories.
     */
    productCount: number;
}
