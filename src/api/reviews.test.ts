import type { AxiosInstance } from "axios";
import { describe, expect, it, vi } from "vitest";
import { MerchForgeApiError } from "../errors/MerchForgeApiError";
import {
    getMyProductReview,
    getProductReviews,
    getProductReviewSummary,
    submitProductReview,
} from "./reviews";

function fakeGetClient(data: unknown): AxiosInstance {
    return { get: vi.fn().mockResolvedValue({ data }) } as unknown as AxiosInstance;
}

function fakePostClient(data: unknown): AxiosInstance {
    return { post: vi.fn().mockResolvedValue({ data }) } as unknown as AxiosInstance;
}

const PRODUCT_ID = "181b0cf1-c295-4f58-b880-f3a11d90c1c6";

const validReview = {
    id: "a1000000-0000-4000-8000-000000000001",
    rating: 5,
    comment: "Exactly as described.",
    authorDisplayName: "Mia S.",
    createdAt: "2026-02-01T10:00:00Z",
};

const validPage = {
    items: [validReview],
    page: 1,
    pageSize: 20,
    totalCount: 1,
    totalPages: 1,
};

const validSummary = {
    averageRating: 4.5,
    reviewCount: 2,
    ratingBreakdown: { "1": 0, "2": 0, "3": 0, "4": 1, "5": 1 },
};

const validMyReview = {
    id: "a1000000-0000-4000-8000-000000000001",
    rating: 4,
    comment: null,
    isHidden: false,
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-02-02T10:00:00Z",
};

describe("getProductReviews", () => {
    it("scopes the request to the business and forwards paging", async () => {
        const client = fakeGetClient(validPage);

        await getProductReviews(client, "biz-a", PRODUCT_ID, { page: 2, pageSize: 5 });

        expect(client.get).toHaveBeenCalledWith(
            `/storefront/products/${PRODUCT_ID}/reviews`,
            { params: { businessId: "biz-a", page: 2, pageSize: 5 } }
        );
    });

    it("returns the parsed page on a well-formed response", async () => {
        const client = fakeGetClient(validPage);

        const result = await getProductReviews(client, "biz-a", PRODUCT_ID);

        expect(result.totalCount).toBe(1);
        expect(result.items[0]?.authorDisplayName).toBe("Mia S.");
    });

    it("accepts a rating-only review, where comment is null rather than absent", async () => {
        const client = fakeGetClient({
            ...validPage,
            items: [{ ...validReview, comment: null }],
        });

        const result = await getProductReviews(client, "biz-a", PRODUCT_ID);

        expect(result.items[0]?.comment).toBeNull();
    });

    it("throws a MerchForgeApiError when the response shape is wrong", async () => {
        const client = fakeGetClient({
            ...validPage,
            items: [{ ...validReview, rating: "five" }],
        });

        await expect(getProductReviews(client, "biz-a", PRODUCT_ID)).rejects.toBeInstanceOf(
            MerchForgeApiError
        );
    });
});

describe("getProductReviewSummary", () => {
    it("returns the average, count and full breakdown", async () => {
        const client = fakeGetClient(validSummary);

        const result = await getProductReviewSummary(client, "biz-a", PRODUCT_ID);

        expect(result.averageRating).toBe(4.5);
        expect(result.reviewCount).toBe(2);
        expect(Object.keys(result.ratingBreakdown)).toHaveLength(5);
    });

    it("accepts a null average for a product with no reviews", async () => {
        const client = fakeGetClient({
            averageRating: null,
            reviewCount: 0,
            ratingBreakdown: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
        });

        const result = await getProductReviewSummary(client, "biz-a", PRODUCT_ID);

        expect(result.averageRating).toBeNull();
    });
});

describe("getMyProductReview", () => {
    it("returns eligibility with no existing review", async () => {
        const client = fakeGetClient({ canReview: true, myReview: null });

        const result = await getMyProductReview(client, "biz-a", PRODUCT_ID);

        expect(result.canReview).toBe(true);
        expect(result.myReview).toBeNull();
    });

    it("returns the customer's existing review when they have one", async () => {
        const client = fakeGetClient({ canReview: true, myReview: validMyReview });

        const result = await getMyProductReview(client, "biz-a", PRODUCT_ID);

        expect(result.myReview?.rating).toBe(4);
        expect(result.myReview?.isHidden).toBe(false);
    });
});

describe("submitProductReview", () => {
    it("posts the review body with the business as a query param", async () => {
        const client = fakePostClient(validMyReview);

        await submitProductReview(client, "biz-a", PRODUCT_ID, { rating: 4 });

        expect(client.post).toHaveBeenCalledWith(
            `/storefront/products/${PRODUCT_ID}/reviews`,
            { rating: 4 },
            { params: { businessId: "biz-a" } }
        );
    });

    it("returns the customer's review as saved", async () => {
        const client = fakePostClient(validMyReview);

        const result = await submitProductReview(client, "biz-a", PRODUCT_ID, {
            rating: 4,
            comment: null,
        });

        expect(result.id).toBe(validMyReview.id);
        expect(result.comment).toBeNull();
    });
});
