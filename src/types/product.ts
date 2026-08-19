import type { PagedQuery } from "./pagination";

/**
 * Public storefront product. Maps to MerchForge's Product model, minus fields with
 * no customer-facing purpose (BusinessId is redundant — the SDK already scopes every
 * request to one business — and UpdatedAt is an internal/administrative concern).
 */
export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string | null;
    createdAt: string;
}

export type ProductSortField = "CreatedAt" | "Title" | "Price";

export interface ProductsQuery extends PagedQuery {
    search?: string;
    category?: string;
    sortBy?: ProductSortField;
    sortDescending?: boolean;
}
