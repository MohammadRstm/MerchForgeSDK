import { z } from "zod";

export const productCategorySchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
});

/**
 * Validated as "an object with string keys", not against a fixed set of fields.
 * Metadata is intentionally schemaless — its keys differ per business vertical — so
 * asserting particular keys here would reject perfectly valid products from a
 * vertical this SDK version had not anticipated.
 */
export const productMetadataSchema = z.record(z.string(), z.unknown());

export const productSchema = z.object({
    id: z.string().uuid(),
    title: z.string(),
    price: z.number(),
    imageUrl: z.string().nullable(),
    category: productCategorySchema,
    metadata: productMetadataSchema.nullable(),
    createdAt: z.iso.datetime(),
});

export const productDetailSchema = productSchema.extend({
    description: z.string(),
});

export const productsSchema = z.array(productSchema);
