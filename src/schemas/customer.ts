import { z } from "zod";

export const customerSchema = z.object({
    id: z.string().uuid(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
});

export const customerProfileSchema = customerSchema.extend({
    phone: z.string().nullable(),
    addressLine1: z.string().nullable(),
    addressLine2: z.string().nullable(),
    city: z.string().nullable(),
    state: z.string().nullable(),
    postalCode: z.string().nullable(),
    country: z.string().nullable(),
});

/** Mirrors the backend's CustomerSessionResponse — login/signup/refresh/silent/exchange all return this shape. */
export const customerSessionResponseSchema = z.object({
    authResponse: z.object({
        accessToken: z.string(),
        accessTokenExpiresAt: z.iso.datetime(),
    }),
    customerId: z.string().uuid(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    exchangeCode: z.string().nullable(),
});
