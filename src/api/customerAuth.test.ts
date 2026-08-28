import type { AxiosInstance } from "axios";
import { describe, expect, it, vi } from "vitest";
import { exchangeCustomerCode, getCustomerProfile, updateCustomerProfile } from "./customerAuth";

function fakeClient(data: unknown): AxiosInstance {
    return {
        get: vi.fn().mockResolvedValue({ data }),
        post: vi.fn().mockResolvedValue({ data }),
        put: vi.fn().mockResolvedValue({ data }),
    } as unknown as AxiosInstance;
}

const validSession = {
    authResponse: {
        accessToken: "token123",
        accessTokenExpiresAt: "2026-01-01T00:00:00.000Z",
    },
    customerId: "c1000000-0000-4000-8000-000000000001",
    email: "jamie@example.com",
    firstName: "Jamie",
    lastName: "Chen",
    exchangeCode: null,
};

const validProfile = {
    id: "c1000000-0000-4000-8000-000000000001",
    email: "jamie@example.com",
    firstName: "Jamie",
    lastName: "Chen",
    phone: null,
    addressLine1: null,
    addressLine2: null,
    city: null,
    state: null,
    postalCode: null,
    country: null,
};

describe("exchangeCustomerCode", () => {
    it("posts the code and returnUrl with no businessId — a Customer is not business-scoped", async () => {
        const client = fakeClient(validSession);

        await exchangeCustomerCode(client, "abc123", "https://storefront.example/auth/callback");

        expect(client.post).toHaveBeenCalledWith("/CustomerAuth/exchange", {
            code: "abc123",
            returnUrl: "https://storefront.example/auth/callback",
        });
    });

    it("flattens the session response into a CustomerSession", async () => {
        const client = fakeClient(validSession);

        const result = await exchangeCustomerCode(client, "abc123", "https://storefront.example/auth/callback");

        expect(result).toEqual({
            accessToken: "token123",
            accessTokenExpiresAt: "2026-01-01T00:00:00.000Z",
            customer: {
                id: "c1000000-0000-4000-8000-000000000001",
                email: "jamie@example.com",
                firstName: "Jamie",
                lastName: "Chen",
            },
        });
    });

    it("rejects a response missing the access token", async () => {
        const client = fakeClient({ ...validSession, authResponse: { accessTokenExpiresAt: "2026-01-01T00:00:00.000Z" } });

        await expect(exchangeCustomerCode(client, "abc123", "https://storefront.example/auth/callback")).rejects.toMatchObject({
            code: "INVALID_RESPONSE_SHAPE",
        });
    });
});

describe("getCustomerProfile", () => {
    it("calls the profile endpoint with no params — identity comes from the Bearer token", async () => {
        const client = fakeClient(validProfile);

        await getCustomerProfile(client);

        expect(client.get).toHaveBeenCalledWith("/customer/profile");
    });

    it("returns the parsed profile", async () => {
        const client = fakeClient(validProfile);

        await expect(getCustomerProfile(client)).resolves.toEqual(validProfile);
    });
});

describe("updateCustomerProfile", () => {
    it("puts the input to the profile endpoint", async () => {
        const client = fakeClient(validProfile);
        const input = { firstName: "Jamie", lastName: "Chen", city: "Portland" };

        await updateCustomerProfile(client, input);

        expect(client.put).toHaveBeenCalledWith("/customer/profile", input);
    });
});
