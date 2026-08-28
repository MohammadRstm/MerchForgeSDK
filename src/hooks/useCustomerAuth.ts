import { useContext } from "react";
import { CustomerAuthContext } from "../context/CustomerAuthContext";
import type { Customer } from "../types/customer";

export interface UseCustomerAuthResult {
    customer: Customer | null;
    isAuthenticated: boolean;
    /** True only during the initial silent-auth attempt on mount. */
    isLoading: boolean;
    /** Navigates to the platform's login page. Defaults returnUrl to this template's /auth/callback route. */
    login: (returnUrl?: string) => void;
    /** Navigates to the platform's signup page. Defaults returnUrl to this template's /auth/callback route. */
    signup: (returnUrl?: string) => void;
    /** Clears the in-memory session. Local-only — see the provider's own doc comment. */
    logout: () => void;
    /**
     * Call from this template's /auth/callback route with the `exchangeCode` query
     * param it was loaded with. The only piece of the login/signup handoff templates
     * still need to wire up themselves — everything else (renewal, retry, logout) is
     * fully SDK-internal.
     */
    completeExchange: (code: string) => Promise<void>;
}

/**
 * The one hook templates need for customer identity — no template ever touches a
 * token directly. Must be used within a <MerchForgeProvider>; pass `platformUrl` on
 * that provider for login()/signup()/silent renewal to work.
 */
export function useCustomerAuth(): UseCustomerAuthResult {
    const context = useContext(CustomerAuthContext);

    if (!context) {
        throw new Error("useCustomerAuth must be used within a <MerchForgeProvider>.");
    }

    const { customer, isAuthenticated, isLoading, login, signup, logout, completeExchange } = context;

    return { customer, isAuthenticated, isLoading, login, signup, logout, completeExchange };
}
