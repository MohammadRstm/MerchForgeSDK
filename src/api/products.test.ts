import type { AxiosInstance } from "axios";
import { describe, expect, it, vi } from "vitest";
import { MerchForgeApiError } from "../errors/MerchForgeApiError";
import { getProduct, getProducts, getRelatedProducts } from "./products";

function fakeClient(data: unknown): AxiosInstance {
    return { get: vi.fn().mockResolvedValue({ data }) } as unknown as AxiosInstance;
}

const validCategory = {
    id: "c1000000-0000-4000-8000-000000000001",
    name: "Shoes",
    slug: "shoes",
};

const validImage = {
    id: "d4f1b1b0-0000-4000-8000-000000000001",
    url: "/images/sneakers-main.jpg",
    isMain: true,
    width: 800,
    height: 600,
    altText: null,
    displayOrder: 0,
};

const validProduct = {
    id: "b3f1b1b0-0000-4000-8000-000000000001",
    title: "Urban Sneakers",
    price: 120,
    compareAtPrice: null,
    imageUrl: "/images/sneakers-main.jpg",
    images: [validImage],
    sku: null,
    stockQuantity: null,
    tags: [],
    saleEndsAt: null,
    category: validCategory,
    metadata: { colors: ["Black", "White"], sizes: ["40", "41"], waterproof: true },
    createdAt: "2026-02-01T10:00:00Z",
};

const validPage = {
    items: [validProduct],
    page: 1,
    pageSize: 20,
    totalCount: 1,
    totalPages: 1,
};

describe("getProducts", () => {
    it("always sends businessId, even with no query params", async () => {
        const client = fakeClient(validPage);

        await getProducts(client, "biz-a");

        expect(client.get).toHaveBeenCalledWith("/storefront/products", {
            params: { businessId: "biz-a" },
        });
    });

    it("forwards every supported filter/sort/pagination param to the backend", async () => {
        const client = fakeClient(validPage);

        await getProducts(client, "biz-a", {
            page: 2,
            pageSize: 10,
            search: "sneaker",
            categoryId: validCategory.id,
            minPrice: 50,
            maxPrice: 150,
            sortBy: "Price",
            sortDescending: true,
        });

        expect(client.get).toHaveBeenCalledWith("/storefront/products", {
            params: {
                businessId: "biz-a",
                page: 2,
                pageSize: 10,
                search: "sneaker",
                categoryId: validCategory.id,
                minPrice: 50,
                maxPrice: 150,
                sortBy: "Price",
                sortDescending: true,
            },
        });
    });

    it("returns the parsed, schema-validated page on a well-formed response", async () => {
        const client = fakeClient(validPage);

        const result = await getProducts(client, "biz-a");

        expect(result).toEqual(validPage);
    });

    it("preserves metadata value types rather than flattening them to strings", async () => {
        const client = fakeClient(validPage);

        const result = await getProducts(client, "biz-a");
        const metadata = result.items[0]!.metadata!;

        expect(metadata.colors).toEqual(["Black", "White"]);
        expect(metadata.waterproof).toBe(true);
    });

    it("accepts metadata keys the SDK has never seen, since it is schemaless by design", async () => {
        const client = fakeClient({
            ...validPage,
            items: [{ ...validProduct, metadata: { ingredients: ["Cheese"], spicy: false, calories: 900 } }],
        });

        const result = await getProducts(client, "biz-a");

        expect(result.items[0]!.metadata).toEqual({
            ingredients: ["Cheese"],
            spicy: false,
            calories: 900,
        });
    });

    it("accepts a product with null metadata", async () => {
        const client = fakeClient({ ...validPage, items: [{ ...validProduct, metadata: null }] });

        const result = await getProducts(client, "biz-a");

        expect(result.items[0]!.metadata).toBeNull();
    });

    it("raises a MerchForgeApiError, not a raw ZodError, when the response doesn't match the expected shape", async () => {
        const client = fakeClient({ items: "not-an-array" });

        await expect(getProducts(client, "biz-a")).rejects.toBeInstanceOf(MerchForgeApiError);
        await expect(getProducts(client, "biz-a")).rejects.toMatchObject({
            code: "INVALID_RESPONSE_SHAPE",
        });
    });

    it("rejects a product whose category was flattened back to a bare string", async () => {
        const client = fakeClient({
            ...validPage,
            items: [{ ...validProduct, category: "Shoes" }],
        });

        await expect(getProducts(client, "biz-a")).rejects.toMatchObject({
            code: "INVALID_RESPONSE_SHAPE",
        });
    });
});

describe("getProduct", () => {
    it("scopes the request to both the product id and businessId", async () => {
        const client = fakeClient({ ...validProduct, description: "Everyday sneakers." });

        await getProduct(client, "biz-a", "p1");

        expect(client.get).toHaveBeenCalledWith("/storefront/products/p1", {
            params: { businessId: "biz-a" },
        });
    });

    it("returns the detail shape, which adds description to the list shape", async () => {
        const detail = { ...validProduct, description: "Everyday sneakers." };
        const client = fakeClient(detail);

        const result = await getProduct(client, "biz-a", validProduct.id);

        expect(result).toEqual(detail);
        expect(result.description).toBe("Everyday sneakers.");
    });

    it("rejects a detail response missing description", async () => {
        const client = fakeClient(validProduct);

        await expect(getProduct(client, "biz-a", "p1")).rejects.toMatchObject({
            code: "INVALID_RESPONSE_SHAPE",
        });
    });
});

describe("getRelatedProducts", () => {
    it("requests the related route scoped to the business", async () => {
        const client = fakeClient([validProduct]);

        await getRelatedProducts(client, "biz-a", "p1", 4);

        expect(client.get).toHaveBeenCalledWith("/storefront/products/p1/related", {
            params: { businessId: "biz-a", limit: 4 },
        });
    });

    it("omits limit when not supplied, letting the backend default apply", async () => {
        const client = fakeClient([validProduct]);

        await getRelatedProducts(client, "biz-a", "p1");

        expect(client.get).toHaveBeenCalledWith("/storefront/products/p1/related", {
            params: { businessId: "biz-a", limit: undefined },
        });
    });

    it("treats an empty list as a valid result, not an error", async () => {
        const client = fakeClient([]);

        await expect(getRelatedProducts(client, "biz-a", "p1")).resolves.toEqual([]);
    });
});
