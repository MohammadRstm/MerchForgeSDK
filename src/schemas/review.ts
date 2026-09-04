import { z } from "zod";

export const productReviewSchema = z.object({
    id: z.string().uuid(),
    rating: z.number(),
    // Nullable, not optional: a rating-only review returns a literal `null` comment
    // rather than omitting the key, same as Product.description.
    comment: z.string().nullable(),
    authorDisplayName: z.string(),
    createdAt: z.iso.datetime(),
});

export const productReviewSummarySchema = z.object({
    averageRating: z.number().nullable(),
    reviewCount: z.number(),
    // The API serializes the Dictionary<int, int> with its keys as strings, so this is
    // keyed by string here and always carries all five entries.
    ratingBreakdown: z.record(z.string(), z.number()),
});

export const myProductReviewSchema = z.object({
    id: z.string().uuid(),
    rating: z.number(),
    comment: z.string().nullable(),
    isHidden: z.boolean(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});

export const productReviewEligibilitySchema = z.object({
    canReview: z.boolean(),
    myReview: myProductReviewSchema.nullable(),
});
