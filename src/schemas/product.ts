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
    // Null when the product has no visible reviews — never 0, so "not rated yet" is
    // distinguishable from a genuinely bad score.
    averageRating: z.number().nullable(),
    reviewCount: z.number(),
    createdAt: z.iso.datetime(),
});

export const productDetailSchema = productSchema.extend({
    // Nullable, not just optional: Product.Description is a nullable column on the
    // backend (most products, including every one seeded by the demo-business
    // tooling, never set one) and the API returns a literal `null`, not an omitted
    // key. Requiring z.string() here made getProduct() throw on any such product,
    // which surfaced as the product-detail page silently showing nothing.
    description: z.string().nullable(),
});

export const productsSchema = z.array(productSchema);
