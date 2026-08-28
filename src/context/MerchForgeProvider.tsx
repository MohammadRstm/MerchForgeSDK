import { useMemo, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createApiClient } from "../api/client";
import { CustomerAuthProvider } from "./CustomerAuthProvider";
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
 * Establishes API config, business context, and the QueryClient every hook in the
 * SDK's hooks run on. Renders no UI of its own.
 *
 * businessId can change across the provider's lifetime (e.g. a host app that
 * switches storefronts without unmounting). That's safe: every SDK query key is
 * scoped by businessId (see hooks/queryKeys.ts), so React Query treats a new
 * businessId as an entirely different set of cache entries — there is no code path
 * by which one business's cached data can be returned for another.
 */
export function MerchForgeProvider({
    apiUrl,
    businessId,
    platformUrl,
    children,
    queryClient,
}: MerchForgeProviderProps) {
    if (!apiUrl) {
        throw new Error("<MerchForgeProvider> requires a non-empty apiUrl prop.");
    }

    if (!businessId) {
        throw new Error("<MerchForgeProvider> requires a non-empty businessId prop.");
    }

    const [defaultQueryClient] = useState(() => new QueryClient());
    const client = queryClient ?? defaultQueryClient;

    // One Axios client per provider instance (recreated only if apiUrl changes),
    // shared by every hook in this subtree via context — not a module-level
    // singleton, so multiple providers never share connection state.
    const apiClient = useMemo(() => createApiClient(apiUrl), [apiUrl]);

    // Stable object reference so context consumers don't re-render just because
    // MerchForgeProvider itself re-rendered for an unrelated reason.
    const contextValue = useMemo(
        () => ({ apiUrl, businessId, platformUrl, client: apiClient }),
        [apiUrl, businessId, platformUrl, apiClient]
    );

    return (
        <MerchForgeContext.Provider value={contextValue}>
            <QueryClientProvider client={client}>
                <CustomerAuthProvider apiUrl={apiUrl} platformUrl={platformUrl} anonymousClient={apiClient}>
                    {children}
                </CustomerAuthProvider>
            </QueryClientProvider>
        </MerchForgeContext.Provider>
    );
}
