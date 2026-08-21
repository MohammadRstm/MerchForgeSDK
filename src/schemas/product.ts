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

export const productImageSchema = z.object({
    id: z.string().uuid(),
    url: z.string(),
    isMain: z.boolean(),
    width: z.number().nullable(),
    height: z.number().nullable(),
    altText: z.string().nullable(),
    displayOrder: z.number(),
});

export const productSchema = z.object({
    id: z.string().uuid(),
    title: z.string(),
    price: z.number(),
    compareAtPrice: z.number().nullable(),
    imageUrl: z.string().nullable(),
    images: z.array(productImageSchema),
    sku: z.string().nullable(),
    stockQuantity: z.number().nullable(),
    tags: z.array(z.string()),
    saleEndsAt: z.iso.datetime().nullable(),
    category: productCategorySchema,
    metadata: productMetadataSchema.nullable(),
    createdAt: z.iso.datetime(),
});

export const productDetailSchema = productSchema.extend({
    description: z.string(),
});

export const productsSchema = z.array(productSchema);
