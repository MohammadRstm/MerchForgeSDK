import { createContext } from "react";
import type { AxiosInstance } from "axios";

export interface MerchForgeConfig {
    apiUrl: string;
    businessId: string;
    /**
     * Base URL of the MerchForge platform (the "central" MerchForgeClient app) —
     * required only if this storefront uses customer accounts (useCustomerAuth()).
     * Without it, login()/signup() throw a clear error and silent renewal is simply a
     * no-op, but everything else in the SDK works normally.
     */
    platformUrl?: string;
}

/**
 * Internal context value — same as the public MerchForgeConfig, plus the shared
 * Axios client. Not exported: consumers only ever see MerchForgeConfig, since the
 * client is an implementation detail of api/client.ts, not part of the SDK's public
 * surface.
 */
export interface MerchForgeContextValue extends MerchForgeConfig {
    client: AxiosInstance;
}

export const MerchForgeContext = createContext<MerchForgeContextValue | null>(null);
