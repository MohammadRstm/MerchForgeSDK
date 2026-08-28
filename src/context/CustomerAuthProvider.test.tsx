import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { UseCustomerAuthResult } from "../hooks/useCustomerAuth";
import { useCustomerAuth } from "../hooks/useCustomerAuth";
import { MerchForgeProvider } from "./MerchForgeProvider";

// This project's vitest config doesn't enable `globals`, so RTL's own automatic
// afterEach(cleanup) registration (which depends on a global afterEach) never fires —
// unlike sibling test files here, this one renders real DOM content in more than one
// test, so leftover nodes from a prior test would make getByTestId ambiguous.
afterEach(cleanup);

function Consumer({ onReady }: { onReady?: (result: UseCustomerAuthResult) => void }) {
    const result = useCustomerAuth();
    const { customer, isAuthenticated, isLoading } = result;

    onReady?.(result);

    return (
        <div>
            <span data-testid="loading">{String(isLoading)}</span>
            <span data-testid="authenticated">{String(isAuthenticated)}</span>
            <span data-testid="customer">{customer ? customer.email : "none"}</span>
        </div>
    );
}

describe("CustomerAuthProvider (mounted inside MerchForgeProvider)", () => {
    it("makes useCustomerAuth throw a clear error outside a provider", () => {
        function Bare() {
            useCustomerAuth();
            return null;
        }

        expect(() => render(<Bare />)).toThrow(/must be used within a <MerchForgeProvider>/);
    });

    it("starts unauthenticated and stops loading when platformUrl is not configured", async () => {
        render(
            <MerchForgeProvider apiUrl="https://api.example.com" businessId="biz-a">
                <Consumer />
            </MerchForgeProvider>
        );

        // No platformUrl means silent renewal is a deliberate no-op — it must resolve
        // to logged-out/loading-false rather than hang.
        await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

        expect(screen.getByTestId("authenticated").textContent).toBe("false");
        expect(screen.getByTestId("customer").textContent).toBe("none");
    });

    it("login()/signup() throw a clear error when platformUrl is not configured", async () => {
        let latest: UseCustomerAuthResult | undefined;

        render(
            <MerchForgeProvider apiUrl="https://api.example.com" businessId="biz-a">
                <Consumer onReady={(result) => (latest = result)} />
            </MerchForgeProvider>
        );

        await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

        expect(() => latest!.login()).toThrow(/platformUrl/);
        expect(() => latest!.signup()).toThrow(/platformUrl/);
    });
});
