import { z } from "zod";
import { domainSchema } from "./domain";

const businessHoursDaySchema = z
    .object({
        closed: z.boolean(),
        open: z.string().nullable(),
        close: z.string().nullable(),
    })
    .nullable();

const businessHoursSchema = z.object({
    monday: businessHoursDaySchema,
    tuesday: businessHoursDaySchema,
    wednesday: businessHoursDaySchema,
    thursday: businessHoursDaySchema,
    friday: businessHoursDaySchema,
    saturday: businessHoursDaySchema,
    sunday: businessHoursDaySchema,
});

const socialLinksSchema = z.object({
    facebook: z.string().nullable(),
    instagram: z.string().nullable(),
    twitter: z.string().nullable(),
    tikTok: z.string().nullable(),
    youTube: z.string().nullable(),
    linkedIn: z.string().nullable(),
});

export const businessSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string().nullable(),
    tagline: z.string().nullable(),
    logoUrl: z.string().nullable(),
    faviconUrl: z.string().nullable(),
    currency: z.string(),
    locale: z.string(),
    contactEmail: z.string().nullable(),
    contactPhone: z.string().nullable(),
    whatsAppNumber: z.string().nullable(),
    addressLine1: z.string().nullable(),
    addressLine2: z.string().nullable(),
    city: z.string().nullable(),
    state: z.string().nullable(),
    postalCode: z.string().nullable(),
    country: z.string().nullable(),
    socialLinks: socialLinksSchema,
    businessHours: businessHoursSchema,
    primaryColor: z.string().nullable(),
    // Opaque per-template values — validated as a shape by the backend's own
    // WebsiteCustomizationValuesBuilder, not re-validated here.
    templateFields: z.record(z.string(), z.unknown()),
    // Null for a business that has not selected a domain yet.
    domain: domainSchema.nullable(),
});
