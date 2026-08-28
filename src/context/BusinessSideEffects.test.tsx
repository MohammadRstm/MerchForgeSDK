import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MerchForgeContext, type MerchForgeContextValue } from "./MerchForgeContext";
import { BusinessSideEffects } from "./BusinessSideEffects";

vi.mock("../api/business", () => ({
    getBusiness: vi.fn(() =>
        Promise.resolve({
            id: "b1",
            name: "Test",
            description: null,
            tagline: null,
            logoUrl: null,
            faviconUrl: "/uploads/favicon.ico",
            currency: "USD",
            locale: "en-US",
            contactEmail: null,
            contactPhone: null,
            whatsAppNumber: null,
            addressLine1: null,
            addressLine2: null,
            city: null,
            state: null,
            postalCode: null,
            country: null,
            socialLinks: {
                facebook: null,
                instagram: null,
                twitter: null,
                tikTok: null,
                youTube: null,
                linkedIn: null,
            },
            businessHours: {
                monday: null,
                tuesday: null,
                wednesday: null,
                thursday: null,
                friday: null,
                saturday: null,
                sunday: null,
            },
            primaryColor: "#ff0000",
            templateFields: {},
            domain: null,
        })
    ),
}));

function renderWithContext(apiUrl: string) {
    const queryClient = new QueryClient();
    const contextValue: MerchForgeContextValue = {
        apiUrl,
        businessId: "b1",
        previewToken: null,
        client: {} as MerchForgeContextValue["client"],
    };

    return render(
        <MerchForgeContext.Provider value={contextValue}>
            <QueryClientProvider client={queryClient}>
                <BusinessSideEffects apiUrl={apiUrl} />
            </QueryClientProvider>
        </MerchForgeContext.Provider>
    );
}

describe("BusinessSideEffects", () => {
    it("sets the --primary CSS variable from the business's primaryColor", async () => {
        renderWithContext("https://api.example.com/api");

        await waitFor(() =>
            expect(document.documentElement.style.getPropertyValue("--primary")).toBe("#ff0000")
        );
    });

    it("resolves the favicon against the origin, not apiUrl — uploaded images are static files served from the origin root, not under /api", async () => {
        // Every real template's env.ts derives apiUrl as `${origin}/api` — this is the
        // shape that must resolve correctly, not an already-bare origin (regression
        // test for a real bug: BusinessSideEffects originally resolved the favicon
        // against apiUrl directly, producing a ".../api/uploads/..." URL that 404s).
        renderWithContext("https://api.example.com/api");

        await waitFor(() => {
            const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
            expect(link?.getAttribute("href")).toBe("https://api.example.com/uploads/favicon.ico");
        });
    });

    it("leaves an already-bare origin (no /api suffix) unchanged", async () => {
        renderWithContext("https://api.example.com");

        await waitFor(() => {
            const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
            expect(link?.getAttribute("href")).toBe("https://api.example.com/uploads/favicon.ico");
        });
    });
});
