import { describe, expect, it } from "vitest";
import {
    getDiscountPercent,
    getGalleryImages,
    getMainImage,
    getMetadataValue,
    getStockStatus,
    isSaleActive,
    resolveImageUrl,
} from "./productView";
import type { Product, ProductImage } from "../types/product";

const image = (overrides: Partial<ProductImage>): ProductImage => ({
    id: "img-1",
    url: "/a.jpg",
    isMain: false,
    width: null,
    height: null,
    altText: null,
    displayOrder: 0,
    ...overrides,
});

const product = (overrides: Partial<Product> = {}): Product => ({
    id: "p1",
    title: "Test Product",
    price: 100,
    compareAtPrice: null,
    imageUrl: null,
    images: [],
    sku: null,
    stockQuantity: null,
    tags: [],
    saleEndsAt: null,
    category: { id: "c1", name: "Shoes", slug: "shoes" },
    averageRating: null,
    reviewCount: 0,
    metadata: null,
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
});

describe("getMainImage", () => {
    it("returns the image flagged isMain", () => {
        const main = image({ id: "main", isMain: true, url: "/main.jpg" });
        expect(getMainImage(product({ images: [image({ id: "other" }), main] }))?.id).toBe("main");
    });

    it("falls back to imageUrl when there's no gallery yet", () => {
        expect(getMainImage(product({ imageUrl: "/legacy.jpg" }))?.url).toBe("/legacy.jpg");
    });

    it("returns null for a product with neither images nor imageUrl", () => {
        expect(getMainImage(product())).toBeNull();
    });
});

describe("getGalleryImages", () => {
    it("sorts by displayOrder regardless of array order", () => {
        const images = [image({ id: "c", displayOrder: 2 }), image({ id: "a", displayOrder: 0 }), image({ id: "b", displayOrder: 1 })];
        expect(getGalleryImages(product({ images })).map((i) => i.id)).toEqual(["a", "b", "c"]);
    });
});

describe("getDiscountPercent", () => {
    it("computes a whole-number percent off", () => {
        expect(getDiscountPercent(product({ price: 80, compareAtPrice: 100 }))).toBe(20);
    });

    it("returns null when there's no compare-at price", () => {
        expect(getDiscountPercent(product({ price: 80 }))).toBeNull();
    });

    it("returns null when compareAtPrice doesn't actually represent a discount", () => {
        expect(getDiscountPercent(product({ price: 100, compareAtPrice: 100 }))).toBeNull();
    });
});

describe("getStockStatus", () => {
    it("is untracked when stockQuantity is null", () => {
        expect(getStockStatus(product())).toBe("untracked");
    });

    it("is out-of-stock at exactly 0", () => {
        expect(getStockStatus(product({ stockQuantity: 0 }))).toBe("out-of-stock");
    });

    it("is low-stock at or below the threshold", () => {
        expect(getStockStatus(product({ stockQuantity: 3 }), 5)).toBe("low-stock");
    });

    it("is in-stock above the threshold", () => {
        expect(getStockStatus(product({ stockQuantity: 50 }), 5)).toBe("in-stock");
    });
});

describe("isSaleActive", () => {
    it("is false when saleEndsAt is null", () => {
        expect(isSaleActive(product())).toBe(false);
    });

    it("is true for a future deadline", () => {
        expect(isSaleActive(product({ saleEndsAt: new Date(Date.now() + 86_400_000).toISOString() }))).toBe(true);
    });

    it("is false for a past deadline", () => {
        expect(isSaleActive(product({ saleEndsAt: new Date(Date.now() - 86_400_000).toISOString() }))).toBe(false);
    });
});

describe("getMetadataValue", () => {
    it("reads a key out of metadata", () => {
        expect(getMetadataValue<string>(product({ metadata: { material: "Suede" } }), "material")).toBe("Suede");
    });

    it("returns undefined when metadata is null", () => {
        expect(getMetadataValue(product(), "material")).toBeUndefined();
    });
});

describe("resolveImageUrl", () => {
    it("prefixes a relative path with the API origin", () => {
        expect(resolveImageUrl("/product-images/biz/a.jpg", "https://api.example.com")).toBe(
            "https://api.example.com/product-images/biz/a.jpg"
        );
    });

    it("doesn't double up slashes at the join point", () => {
        expect(resolveImageUrl("/product-images/biz/a.jpg", "https://api.example.com/")).toBe(
            "https://api.example.com/product-images/biz/a.jpg"
        );
    });

    it("returns an already-absolute URL unchanged", () => {
        expect(resolveImageUrl("https://cdn.example.com/a.jpg", "https://api.example.com")).toBe(
            "https://cdn.example.com/a.jpg"
        );
    });

    it("returns null for a null or empty url", () => {
        expect(resolveImageUrl(null, "https://api.example.com")).toBeNull();
        expect(resolveImageUrl("", "https://api.example.com")).toBeNull();
    });
});
