import { createContext } from "react";

/**
 * SDK-wide configuration established once at the application boundary by
 * <MerchForgeProvider>. Every hook reads this instead of taking apiUrl/businessId
 * as arguments.
 */
export interface MerchForgeConfig {
    /** Base URL of the MerchForge API, e.g. "https://localhost:7021/api". */
    apiUrl: string;
    /**
     * The business this storefront belongs to. Passed explicitly for now; a future
     * version may resolve this from the storefront's hostname instead, which is why
     * it's plumbed through context rather than a module-level constant.
     */
    businessId: string;
}

export const MerchForgeContext = createContext<MerchForgeConfig | null>(null);
