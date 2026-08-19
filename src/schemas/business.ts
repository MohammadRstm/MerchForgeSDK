import { z } from "zod";
import { domainSchema } from "./domain";

export const businessSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string().nullable(),
    logoUrl: z.string().nullable(),
    currency: z.string(),
    locale: z.string(),
    contactEmail: z.string().nullable(),
    contactPhone: z.string().nullable(),
    // Null for a business that has not selected a domain yet.
    domain: domainSchema.nullable(),
});
