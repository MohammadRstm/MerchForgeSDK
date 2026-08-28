import type { AxiosInstance } from "axios";
import { describe, expect, it, vi } from "vitest";
import { getBusiness } from "./business";
import { getCategories } from "./categories";

function fakeClient(data: unknown): AxiosInstance {
    return { get: vi.fn().mockResolvedValue({ data }) } as unknown as AxiosInstance;
}

const emptySocialLinks = {
    facebook: null,
    instagram: null,
    twitter: null,
    tikTok: null,
    youTube: null,
    linkedIn: null,
};

const emptyBusinessHours = {
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
    sunday: null,
};

const validBusiness = {
    id: "b810942d-b92c-4390-aa21-18aa82c84b87",
    name: "Test2",
    description: "Independent fashion storefront demo",
    tagline: null,
    logoUrl: null,
    faviconUrl: null,
    currency: "USD",
    locale: "en-US",
    contactEmail: "hello@test2.example",
    contactPhone: null,
    whatsAppNumber: null,
    addressLine1: null,
    addressLine2: null,
    city: null,
    state: null,
    postalCode: null,
    country: null,
    socialLinks: emptySocialLinks,
    businessHours: emptyBusinessHours,
    primaryColor: null,
    templateFields: {},
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

    it("returns customization fields (social links, hours, color, template fields)", async () => {
        const client = fakeClient({
            ...validBusiness,
            tagline: "Threads that move with you",
            primaryColor: "#1A1A1A",
            socialLinks: { ...emptySocialLinks, facebook: "https://facebook.com/urbanthread" },
            businessHours: {
                ...emptyBusinessHours,
                monday: { closed: false, open: "09:00", close: "18:00" },
            },
            templateFields: { heroImage: "/uploads/hero.jpg", heroHeadline: "Fall Collection" },
        });

        const result = await getBusiness(client, "biz-a");

        expect(result.tagline).toBe("Threads that move with you");
        expect(result.primaryColor).toBe("#1A1A1A");
        expect(result.socialLinks.facebook).toBe("https://facebook.com/urbanthread");
        expect(result.businessHours.monday).toEqual({ closed: false, open: "09:00", close: "18:00" });
        expect(result.templateFields).toEqual({ heroImage: "/uploads/hero.jpg", heroHeadline: "Fall Collection" });
    });

    it("rejects a response missing the currency a storefront needs to render prices", async () => {
        const { currency: _currency, ...withoutCurrency } = validBusiness;
        const client = fakeClient(withoutCurrency);

        await expect(getBusiness(client, "biz-a")).rejects.toMatchObject({
            code: "INVALID_RESPONSE_SHAPE",
        });
    });

    it("hits /storefront/preview with the token when previewToken is set", async () => {
        const client = fakeClient(validBusiness);

        await getBusiness(client, "biz-a", "preview-token-123");

        expect(client.get).toHaveBeenCalledWith("/storefront/preview", {
            params: { businessId: "biz-a", token: "preview-token-123" },
        });
    });

    it("hits /storefront/business when previewToken is null or omitted", async () => {
        const client = fakeClient(validBusiness);

        await getBusiness(client, "biz-a", null);

        expect(client.get).toHaveBeenCalledWith("/storefront/business", {
            params: { businessId: "biz-a" },
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
