import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useBusiness } from "../hooks/useBusiness";
import { MerchForgeProvider } from "./MerchForgeProvider";

function Consumer() {
    useBusiness();
    return <div>ok</div>;
}

describe("MerchForgeProvider", () => {
    it("throws a clear error when apiUrl is missing", () => {
        expect(() =>
            render(
                // @ts-expect-error deliberately omitting a required prop
                <MerchForgeProvider businessId="biz-a">
                    <div />
                </MerchForgeProvider>
            )
        ).toThrow(/apiUrl/);
    });

    it("throws a clear error when apiUrl is an empty string", () => {
        expect(() =>
            render(
                <MerchForgeProvider apiUrl="" businessId="biz-a">
                    <div />
                </MerchForgeProvider>
            )
        ).toThrow(/apiUrl/);
    });

    it("throws a clear error when businessId is missing", () => {
        expect(() =>
            render(
                // @ts-expect-error deliberately omitting a required prop
                <MerchForgeProvider apiUrl="https://api.example.com">
                    <div />
                </MerchForgeProvider>
            )
        ).toThrow(/businessId/);
    });

    it("renders children when config is valid", () => {
        render(
            <MerchForgeProvider apiUrl="https://api.example.com" businessId="biz-a">
                <div>storefront</div>
            </MerchForgeProvider>
        );

        expect(screen.getByText("storefront")).toBeTruthy();
    });

    it("makes hooks throw a clear error when used outside a provider", () => {
        expect(() => render(<Consumer />)).toThrow(/must be used within a <MerchForgeProvider>/);
    });
});
