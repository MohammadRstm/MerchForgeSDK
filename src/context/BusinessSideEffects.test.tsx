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

function renderWithContext() {
    const queryClient = new QueryClient();
    const contextValue: MerchForgeContextValue = {
        apiUrl: "https://api.example.com",
        businessId: "b1",
        previewToken: null,
        client: {} as MerchForgeContextValue["client"],
    };

    return render(
        <MerchForgeContext.Provider value={contextValue}>
            <QueryClientProvider client={queryClient}>
                <BusinessSideEffects apiUrl="https://api.example.com" />
            </QueryClientProvider>
        </MerchForgeContext.Provider>
    );
}

describe("BusinessSideEffects", () => {
    it("sets the --primary CSS variable from the business's primaryColor", async () => {
        renderWithContext();

        await waitFor(() =>
            expect(document.documentElement.style.getPropertyValue("--primary")).toBe("#ff0000")
        );
    });

    it("sets the favicon link href, resolved against apiUrl", async () => {
        renderWithContext();

        await waitFor(() => {
            const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
            expect(link?.getAttribute("href")).toBe("https://api.example.com/uploads/favicon.ico");
        });
    });
});
