import { useContext } from "react";
import type { AxiosInstance } from "axios";
import { CustomerAuthContext } from "../context/CustomerAuthContext";

/**
 * Internal hook used by useCustomerProfile/useUpdateCustomerProfile to get the
 * dedicated Bearer-token-authenticated client. Not part of the public API.
 */
export function useCustomerApiClient(): { client: AxiosInstance; isAuthenticated: boolean } {
    const context = useContext(CustomerAuthContext);

    if (!context) {
        throw new Error("MerchForge SDK customer hooks must be used within a <MerchForgeProvider>.");
    }

    return { client: context.customerApiClient, isAuthenticated: context.isAuthenticated };
}
