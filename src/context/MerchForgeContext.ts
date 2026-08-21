import { createContext } from "react";
import type { AxiosInstance } from "axios";

export interface MerchForgeConfig {
    apiUrl: string;
    businessId: string;
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
