import type { AxiosInstance } from "axios";
import { parseOrThrow } from "../errors/MerchForgeApiError";
import { customerProfileSchema, customerSessionResponseSchema } from "../schemas/customer";
import type { CustomerProfile, CustomerSession, UpdateCustomerProfileInput } from "../types/customer";

function toCustomerSession(data: unknown): CustomerSession {
    const parsed = parseOrThrow(customerSessionResponseSchema, data);

    return {
        accessToken: parsed.authResponse.accessToken,
        accessTokenExpiresAt: parsed.authResponse.accessTokenExpiresAt,
        customer: {
            id: parsed.customerId,
            email: parsed.email,
            firstName: parsed.firstName,
            lastName: parsed.lastName,
        },
    };
}

/**
 * POST /CustomerAuth/exchange
 *
 * Redeems the one-time code the platform's login/signup page handed back after a real
 * first-party login, over the anonymous, credential-free "Storefront" CORS policy —
 * this call never touches the central customerRefreshToken cookie, only the response
 * body, which carries a short-lived access token. No businessId: a Customer is not
 * business-scoped. returnUrl must exactly match what the code was minted for (see
 * CustomerAuthProvider's fixed /auth/callback convention), or the backend rejects it.
 */
export async function exchangeCustomerCode(
    client: AxiosInstance,
    code: string,
    returnUrl: string
): Promise<CustomerSession> {
    const { data } = await client.post("/CustomerAuth/exchange", { code, returnUrl });

    return toCustomerSession(data);
}

/**
 * GET /customer/profile — Bearer-token authenticated, not cookie-based, so this rides
 * the same anonymous-origin "Storefront" CORS policy every other storefront call does.
 */
export async function getCustomerProfile(client: AxiosInstance): Promise<CustomerProfile> {
    const { data } = await client.get("/customer/profile");

    return parseOrThrow(customerProfileSchema, data);
}

/** PUT /customer/profile */
export async function updateCustomerProfile(
    client: AxiosInstance,
    input: UpdateCustomerProfileInput
): Promise<CustomerProfile> {
    const { data } = await client.put("/customer/profile", input);

    return parseOrThrow(customerProfileSchema, data);
}
