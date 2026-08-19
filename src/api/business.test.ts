import type { AxiosInstance } from "axios";
import { describe, expect, it, vi } from "vitest";
import { getBusiness } from "./business";
import { getCategories } from "./categories";

function fakeClient(data: unknown): AxiosInstance {
    return { get: vi.fn().mockResolvedValue({ data }) } as unknown as AxiosInstance;
}

const validBusiness = {
    id: "b810942d-b92c-4390-aa21-18aa82c84b87",
    name: "Test2",
    description: "Independent fashion storefront demo",
    logoUrl: null,
    currency: "USD",
    locale: "en-US",
    contactEmail: "hello@test2.example",
    contactPhone: null,
    domain: {
        id: "d1000000-0000-4000-8000-000000000001",
        name: "Fashion",
        slug: "fashion",
    },
};

describe("getBusiness", () => {
    it("scopes the request to businessId", async () => {
        const client = fakeClient(validBusiness);

        await getBusiness(client, "biz-a");

        expect(client.get).toHaveBeenCalledWith("/storefront/business", {
            params: { businessId: "biz-a" },
        });
    });

    it("returns store configuration and the domain relationship", async () => {
        const client = fakeClient(validBusiness);

        const result = await getBusiness(client, "biz-a");

        expect(result.currency).toBe("USD");
        expect(result.locale).toBe("en-US");
        expect(result.domain).toEqual({
            id: "d1000000-0000-4000-8000-000000000001",
            name: "Fashion",
            slug: "fashion",
        });
    });

    it("accepts a business that has not selected a domain yet", async () => {
        const client = fakeClient({ ...validBusiness, domain: null });

        const result = await getBusiness(client, "biz-a");

        expect(result.domain).toBeNull();
    });

    it("rejects a response missing the currency a storefront needs to render prices", async () => {
        const { currency: _currency, ...withoutCurrency } = validBusiness;
        const client = fakeClient(withoutCurrency);

        await expect(getBusiness(client, "biz-a")).rejects.toMatchObject({
            code: "INVALID_RESPONSE_SHAPE",
        });
    });
});

describe("getCategories", () => {
    const validCategory = {
        id: "c1000000-0000-4000-8000-000000000001",
        name: "Shoes",
        slug: "shoes",
        displayOrder: 1,
        productCount: 2,
    };

    it("scopes the request to businessId", async () => {
        const client = fakeClient([validCategory]);

        await getCategories(client, "biz-a");

        expect(client.get).toHaveBeenCalledWith("/storefront/categories", {
            params: { businessId: "biz-a" },
        });
    });

    it("returns categories as entities with per-business product counts", async () => {
        const client = fakeClient([validCategory]);

        const result = await getCategories(client, "biz-a");

        expect(result[0]).toEqual(validCategory);
        expect(result[0]!.productCount).toBe(2);
    });

    it("treats an empty list as valid — a business with no domain has no categories", async () => {
        const client = fakeClient([]);

        await expect(getCategories(client, "biz-a")).resolves.toEqual([]);
    });

    it("rejects the old bare-string category shape", async () => {
        const client = fakeClient(["Shoes", "Shirts"]);

        await expect(getCategories(client, "biz-a")).rejects.toMatchObject({
            code: "INVALID_RESPONSE_SHAPE",
        });
    });
});
