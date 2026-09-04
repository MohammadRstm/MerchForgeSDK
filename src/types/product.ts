import type { PagedQuery } from "./pagination";

/**
 * The category a product belongs to, embedded in product responses so a card can
 * render "Shoes" without a second request. Flat by design — no navigation back to
 * the domain or its products.
 */
export interface ProductCategory {
    id: string;
    name: string;
    slug: string;
}

/**
 * Domain-specific product attributes. The shape varies by business vertical —
 * fashion stores use colors/sizes/material, restaurants use ingredients/spicy,
 * electronics use brand/storage/ram — so the SDK deliberately does not pretend to
 * know the keys.
 *
 * Values are `unknown` rather than `any`: the backend does not validate this against
 * a schema yet, so a storefront must narrow before use. Once per-domain attribute
 * definitions exist, a typed accessor can be layered on without changing this.
 */
export type ProductMetadata = Record<string, unknown>;

/** One image in a product's gallery. Exactly one entry per product has `isMain: true`. */
export interface ProductImage {
    id: string;
    url: string;
    isMain: boolean;
    width: number | null;
    height: number | null;
    altText: string | null;
    /** Display order, lowest first. Not guaranteed contiguous. */
    displayOrder: number;
}

/**
 * A product as it appears in a catalog listing.
 *
 * Carries `metadata` but not `description`: grids routinely need metadata to render
 * (colour swatches, size badges) while description is the large field, returned only
 * by `useProduct`.
 */
export interface Product {
    id: string;
    title: string;
    price: number;
    /** Pre-discount price for a struck-through sale display. Null when not on sale. */
    compareAtPrice: number | null;
    /** The main image's URL — kept in sync with `images`, for a consumer that only needs one image. */
    imageUrl: string | null;
    /** The full gallery, already sorted for display. Empty for a product with no images. */
    images: ProductImage[];
    sku: string | null;
    /** Null means inventory isn't tracked for this product; 0 means tracked and out of stock. */
    stockQuantity: number | null;
    /** Freeform merchandising badges, e.g. "New", "Bestseller". Never null; empty when none. */
    tags: string[];
    /** When a time-limited sale on this product ends, for a countdown display. Null if none. */
    saleEndsAt: string | null;
    category: ProductCategory;
    metadata: ProductMetadata | null;
    /**
     * Mean of this product's visible reviews, rounded to two places. Null when it has
     * none — a real average is never 0, so null is what tells "not rated yet" apart
     * from a genuinely low score.
     */
    averageRating: number | null;
    /** How many visible reviews the average is drawn from. Hidden ones don't count. */
    reviewCount: number;
    createdAt: string;
}

/** A single product, including its full description. Null when the merchant hasn't written one. */
export interface ProductDetail extends Product {
    description: string | null;
}

export type ProductSortField = "CreatedAt" | "Title" | "Price";

export interface ProductsQuery extends PagedQuery {
    /** Matched against the product title. */
    search?: string;
    /**
     * Filter by category id, not name. Names are display values and are not unique
     * across domains ("Accessories" exists under both Fashion and Electronics), so
     * they are not a safe filter key.
     */
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: ProductSortField;
    sortDescending?: boolean;
}
