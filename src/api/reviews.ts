import type { AxiosInstance } from "axios";
import { parseOrThrow } from "../errors/MerchForgeApiError";
import { pagedResultSchema } from "../schemas/pagination";
import {
    myProductReviewSchema,
    productReviewEligibilitySchema,
    productReviewSchema,
    productReviewSummarySchema,
} from "../schemas/review";
import type { PagedResult } from "../types/pagination";
import type {
    CreateProductReviewInput,
    MyProductReview,
    ProductReview,
    ProductReviewEligibility,
    ProductReviewsQuery,
    ProductReviewSummary,
} from "../types/review";

const productReviewsPageSchema = pagedResultSchema(productReviewSchema);

/**
 * GET /storefront/products/{productId}/reviews?businessId=...&page=&pageSize=
 *
 * A product's published reviews, newest first. Anonymous — reviews are part of a
 * store's public face. Reviews the merchant has hidden never appear here.
 */
export async function getProductReviews(
    client: AxiosInstance,
    businessId: string,
    productId: string,
    query: ProductReviewsQuery = {}
): Promise<PagedResult<ProductReview>> {
    const { data } = await client.get(`/storefront/products/${productId}/reviews`, {
        params: { businessId, ...query },
    });

    return parseOrThrow(productReviewsPageSchema, data);
}

/**
 * GET /storefront/products/{productId}/reviews/summary?businessId=...
 *
 * Average, count and per-star breakdown, over visible reviews only. Separate from the
 * list so a rating can be shown without paging through reviews that won't be rendered.
 */
export async function getProductReviewSummary(
    client: AxiosInstance,
    businessId: string,
    productId: string
): Promise<ProductReviewSummary> {
    const { data } = await client.get(`/storefront/products/${productId}/reviews/summary`, {
        params: { businessId },
    });

    return parseOrThrow(productReviewSummarySchema, data);
}

/**
 * GET /storefront/products/{productId}/reviews/me?businessId=...
 *
 * Whether the signed-in customer may review this product, and their existing review
 * if they have one. Requires the customer-authenticated client — 401s without a token.
 */
export async function getMyProductReview(
    client: AxiosInstance,
    businessId: string,
    productId: string
): Promise<ProductReviewEligibility> {
    const { data } = await client.get(`/storefront/products/${productId}/reviews/me`, {
        params: { businessId },
    });

    return parseOrThrow(productReviewEligibilitySchema, data);
}

/**
 * POST /storefront/products/{productId}/reviews?businessId=...
 *
 * Submits or edits the signed-in customer's review. An upsert, not a create: a
 * customer has at most one review per product, so calling this again replaces their
 * previous rating and comment rather than adding a second review.
 *
 * Requires the customer-authenticated client, and requires that customer to have
 * actually ordered the product — otherwise the API responds 409
 * REVIEW_REQUIRES_PURCHASE.
 */
export async function submitProductReview(
    client: AxiosInstance,
    businessId: string,
    productId: string,
    input: CreateProductReviewInput
): Promise<MyProductReview> {
    const { data } = await client.post(`/storefront/products/${productId}/reviews`, input, {
        params: { businessId },
    });

    return parseOrThrow(myProductReviewSchema, data);
}
