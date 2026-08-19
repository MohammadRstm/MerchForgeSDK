import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MerchForgeContext, type MerchForgeConfig } from "./MerchForgeContext";

export interface MerchForgeProviderProps extends MerchForgeConfig {
    children: ReactNode;
    /**
     * Advanced: share your own QueryClient with the SDK (e.g. to share a cache or
     * devtools setup with the rest of your app). Most storefronts won't need this —
     * by default the SDK creates and manages its own, so React Query configuration
     * never needs to be a concern for the consumer.
     */
    queryClient?: QueryClient;
}

/**
 * The single entry point a storefront needs: establishes which business this app
 * is for and where the MerchForge API lives, and sets up the React Query client the
 * SDK's hooks run on. Renders no UI of its own.
 */
export function MerchForgeProvider({
    apiUrl,
    businessId,
    children,
    queryClient,
}: MerchForgeProviderProps) {
    const [defaultQueryClient] = useState(() => new QueryClient());
    const client = queryClient ?? defaultQueryClient;

    return (
        <MerchForgeContext.Provider value={{ apiUrl, businessId }}>
            <QueryClientProvider client={client}>
                {children}
            </QueryClientProvider>
        </MerchForgeContext.Provider>
    );
}
