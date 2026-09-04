import type { MerchForgeApiError } from "../errors/MerchForgeApiError";

/**
 * TanStack Query's default retry (3 attempts, exponential backoff) treats every
 * error the same - including a definite 404. For a lookup by id (a product, a
 * business, an order), a NotFound/Validation/Authentication/Authorization/Conflict
 * response can never succeed on retry, so retrying it only delays a storefront's
 * error state by several real seconds for no benefit. Genuinely transient failures
 * (a dropped connection, a 5xx) are still worth the default retry behavior.
 */
export function shouldRetryQuery(failureCount: number, error: MerchForgeApiError): boolean {
    const nonRetryableTypes: MerchForgeApiError["type"][] = [
        "NotFound",
        "Validation",
        "Authentication",
        "Authorization",
        "Conflict",
    ];

    if (nonRetryableTypes.includes(error.type)) {
        return false;
    }

    return failureCount < 3;
}
