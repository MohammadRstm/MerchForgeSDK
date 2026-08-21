import type { Product, ProductImage } from "../types/product";

/**
 * Derived view-model helpers for `Product`, not a per-template mapper.
 *
 * A storefront template (fashion, electronics, restaurant, ...) needs its own shape —
 * fashion wants `imgSrc`/`colors`/`sizes`, a restaurant wants `spicy`/`ingredients`.
 * That mapping is inherently template-specific and belongs in the template's own
 * codebase, not here: baking one template's field names into the SDK would make every
 * other vertical work around it. What genuinely is shared across every template is a
 * handful of small computations every one of them needs to do to `Product` before it
 * can render — "which image is the main one," "what's the discount," "is this in
 * stock" — so those live here once instead of being reimplemented, slightly
 * differently, in every template that consumes this SDK.
 */

/** The image to show when only one is needed (a card, a thumbnail). Synthesizes one from `imageUrl` if the gallery is empty. */
export function getMainImage(product: Product): ProductImage | null {
    const main = product.images.find((image) => image.isMain);
    if (main) return main;

    if (product.images.length > 0) return product.images[0]!;

    if (product.imageUrl) {
        return {
            id: product.id,
            url: product.imageUrl,
            isMain: true,
            width: null,
            height: null,
            altText: null,
            displayOrder: 0,
        };
    }

    return null;
}

/** The full gallery in display order. Falls back to a single-image gallery for a product with no `images` rows yet. */
export function getGalleryImages(product: Product): ProductImage[] {
    if (product.images.length > 0) {
        return [...product.images].sort((a, b) => a.displayOrder - b.displayOrder);
    }

    const main = getMainImage(product);
    return main ? [main] : [];
}

/**
 * Whole-number percent off, or null when there's nothing to show — no compare-at
 * price, or one that isn't actually greater than the price (the backend rejects that
 * combination on write, but a template reading older or externally-sourced data
 * shouldn't have to re-derive this guard itself).
 */
export function getDiscountPercent(product: Product): number | null {
    if (product.compareAtPrice == null || product.compareAtPrice <= product.price) {
        return null;
    }

    return Math.round((1 - product.price / product.compareAtPrice) * 100);
}

export type StockStatus = "untracked" | "in-stock" | "low-stock" | "out-of-stock";

/**
 * Collapses `stockQuantity` into the small set of states a template actually
 * branches on, so every template doesn't reimplement the same three comparisons.
 * `lowStockThreshold` is exclusive of 0 — out-of-stock is always its own state.
 */
export function getStockStatus(product: Product, lowStockThreshold = 5): StockStatus {
    if (product.stockQuantity == null) return "untracked";
    if (product.stockQuantity === 0) return "out-of-stock";
    if (product.stockQuantity <= lowStockThreshold) return "low-stock";
    return "in-stock";
}

/** Whether a time-limited sale is currently running (a `saleEndsAt` in the future). */
export function isSaleActive(product: Product): boolean {
    if (!product.saleEndsAt) return false;
    return new Date(product.saleEndsAt).getTime() > Date.now();
}

/**
 * Type-narrowing accessor for one metadata value. `metadata` is intentionally
 * untyped (its keys vary per business domain), so every read needs this same
 * `unknown`-to-`T` cast — centralized here rather than repeated inline at every call
 * site. Does not validate `T` against the actual value; a template that needs that
 * guarantee should still narrow the result itself.
 */
export function getMetadataValue<T = unknown>(product: Product, key: string): T | undefined {
    return product.metadata?.[key] as T | undefined;
}
