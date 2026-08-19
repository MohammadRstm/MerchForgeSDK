import axios, { type AxiosInstance } from "axios";
import { useContext } from "react";
import { MerchForgeContext } from "../context/MerchForgeContext";
import { toMerchForgeApiError } from "../errors/MerchForgeApiError";

/**
 * The one place an Axios instance gets created. Every API module receives a client
 * instance rather than importing a module-level singleton, so the SDK carries no
 * hidden global state — each <MerchForgeProvider> tree gets its own, created once in
 * MerchForgeProvider and shared via context (see useApiClient below).
 */
export function createApiClient(apiUrl: string): AxiosInstance {
    const client = axios.create({
        baseURL: apiUrl,
        headers: {
            Accept: "application/json",
        },
    });

    // Every hook already receives a MerchForgeApiError, never a raw Axios error.
    client.interceptors.response.use(
        (response) => response,
        (error) => Promise.reject(toMerchForgeApiError(error))
    );

    return client;
}

/**
 * Internal hook used by the SDK's own data hooks to get the shared client plus the
 * current business context. Not part of the public API — storefronts consume
 * useBusiness/useProducts/useProduct/useCategories instead.
 */
export function useApiClient(): { client: AxiosInstance; businessId: string } {
    const context = useContext(MerchForgeContext);

    if (!context) {
        throw new Error(
            "MerchForge SDK hooks must be used within a <MerchForgeProvider>."
        );
    }

    return { client: context.client, businessId: context.businessId };
}
