/**
 * One published review as a storefront renders it.
 *
 * There is no customer id here on purpose — the API does not return one for the
 * public list, so a storefront cannot correlate one person's reviews across a
 * catalog. `authorDisplayName` is already reduced to a first name and last initial
 * by the backend.
 */
export interface ProductReview {
    id: string;
    /** 1-5. Always present — a review without a rating is not a review. */
    rating: number;
    /** Null when the customer rated without writing anything, which is common. */
    comment: string | null;
    /** e.g. "Mia S.". Falls back to "Customer" for an account with no name. */
    authorDisplayName: string;
    createdAt: string;
}

/**
 * Aggregate rating figures for one product, over its visible reviews only — a review
 * the merchant has hidden counts for nothing here.
 */
export interface ProductReviewSummary {
    /**
     * Null when the product has no visible reviews. Null rather than 0 so a storefront
     * can tell "not rated yet" apart from a genuinely terrible score; a real average is
     * never 0.
     */
    averageRating: number | null;
    reviewCount: number;
    /**
     * How many reviews gave each star value, keyed "1".."5". Always has all five keys,
     * with zeros where nobody gave that rating, so a histogram can be rendered without
     * filling gaps.
     */
    ratingBreakdown: Record<string, number>;
}

/**
 * The signed-in customer's own review, as returned to them for editing. Separate from
 * ProductReview because it carries `isHidden` — a customer whose review the merchant
 * has hidden should be able to see that, rather than being puzzled that it is missing
 * from the public list.
 */
export interface MyProductReview {
    id: string;
    rating: number;
    comment: string | null;
    isHidden: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Everything needed to decide what to render in place of the review form, in one
 * request. Only meaningful for a signed-in customer.
 */
export interface ProductReviewEligibility {
    /**
     * True when this customer has ordered this product from this business. Reviews are
     * restricted to verified purchasers, so a false here means the form is not offered
     * at all.
     */
    canReview: boolean;
    /** Their existing review, so the form can open pre-filled. Null if they have none. */
    myReview: MyProductReview | null;
}

/** Submitting or editing a review. The rating is required; the comment is not. */
export interface CreateProductReviewInput {
    rating: number;
    comment?: string | null;
}

/** Paging for a product's review list. Reviews are always returned newest first. */
export interface ProductReviewsQuery {
    page?: number;
    pageSize?: number;
}
