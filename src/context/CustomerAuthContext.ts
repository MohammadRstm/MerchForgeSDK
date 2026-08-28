import { createContext } from "react";
import type { AxiosInstance } from "axios";
import type { Customer } from "../types/customer";

/**
 * Internal context value. Not exported from the package's public surface — storefronts
 * consume useCustomerAuth() instead (see hooks/useCustomerAuth.ts), which narrows this
 * down to the fields a template actually needs. customerApiClient is used internally
 * by useCustomerProfile/useUpdateCustomerProfile only.
 */
export interface CustomerAuthContextValue {
    customer: Customer | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (returnUrl?: string) => void;
    signup: (returnUrl?: string) => void;
    logout: () => void;
    completeExchange: (code: string) => Promise<void>;
    customerApiClient: AxiosInstance;
}

export const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);
