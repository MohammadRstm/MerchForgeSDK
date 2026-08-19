import type { AxiosInstance } from "axios";
import { describe, expect, it, vi } from "vitest";
import { MerchForgeApiError } from "../errors/MerchForgeApiError";
import { getProduct, getProducts } from "./products";

function fakeClient(data: unknown): AxiosInstance {
    return { get: vi.fn().mockResolvedValue({ data }) } as unknown as AxiosInstance;
}

const validProduct = {
    id: "b3f1b1b0-0000-4000-8000-000000000001",
    title: "T-Shirt",
    description: "A shirt.",
    price: 19.99,
    category: "Clothing",
    imageUrl: null,
    createdAt: "2026-01-01T00:00:00Z",
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

        expect(client.get).toHaveBeenCalledWith("/Storefront/products", {
            params: { businessId: "biz-a" },
        });
    });

    it("forwards every supported filter/sort/pagination param to the backend", async () => {
        const client = fakeClient(validPage);

        await getProducts(client, "biz-a", {
            page: 2,
            pageSize: 10,
            search: "shirt",
            category: "Clothing",
            sortBy: "Price",
            sortDescending: true,
        });

        expect(client.get).toHaveBeenCalledWith("/Storefront/products", {
            params: {
                businessId: "biz-a",
                page: 2,
                pageSize: 10,
                search: "shirt",
                category: "Clothing",
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

    it("raises a MerchForgeApiError, not a raw ZodError, when the response doesn't match the expected shape", async () => {
        const client = fakeClient({ items: "not-an-array" });

        await expect(getProducts(client, "biz-a")).rejects.toBeInstanceOf(MerchForgeApiError);
        await expect(getProducts(client, "biz-a")).rejects.toMatchObject({
            code: "INVALID_RESPONSE_SHAPE",
        });
    });
});

describe("getProduct", () => {
    it("scopes the request to both the product id and businessId", async () => {
        const client = fakeClient(validProduct);

        await getProduct(client, "biz-a", "p1");

        expect(client.get).toHaveBeenCalledWith("/Storefront/products/p1", {
            params: { businessId: "biz-a" },
        });
    });

    it("returns the parsed product on a well-formed response", async () => {
        const client = fakeClient(validProduct);

        const result = await getProduct(client, "biz-a", validProduct.id);

        expect(result).toEqual(validProduct);
    });
});
