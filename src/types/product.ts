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
    imageUrl: string | null;
    category: ProductCategory;
    metadata: ProductMetadata | null;
    createdAt: string;
}

/** A single product, including its full description. */
export interface ProductDetail extends Product {
    description: string;
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
