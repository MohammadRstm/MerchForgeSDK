import { QueryClient } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { MerchForgeProvider } from "../context/MerchForgeProvider";
import { merchForgeQueryKeys } from "./queryKeys";
import { useProducts } from "./useProducts";

vi.mock("../api/products", () => ({
    getProducts: vi.fn((_client: unknown, businessId: string) =>
        Promise.resolve(
            businessId === "biz-a"
                ? { items: [{ id: "a1", title: "A-Product" }], page: 1, pageSize: 20, totalCount: 1, totalPages: 1 }
                : { items: [{ id: "b1", title: "B-Product" }], page: 1, pageSize: 20, totalCount: 1, totalPages: 1 }
        )
    ),
}));

function Inner() {
    const { data } = useProducts();
    return <div data-testid="products">{data?.items.map((p: { title: string }) => p.title).join(",")}</div>;
}

function TestApp({ queryClient }: { queryClient: QueryClient }) {
    const [businessId, setBusinessId] = useState("biz-a");

    return (
        <MerchForgeProvider apiUrl="https://api.example.com" businessId={businessId} queryClient={queryClient}>
            <Inner />
            <button onClick={() => setBusinessId("biz-b")}>switch business</button>
        </MerchForgeProvider>
    );
}

describe("business isolation", () => {
    it("never returns one business's cached data for another, even when businessId changes without unmounting", async () => {
        const queryClient = new QueryClient();
        render(<TestApp queryClient={queryClient} />);

        await waitFor(() => expect(screen.getByTestId("products").textContent).toBe("A-Product"));

        fireEvent.click(screen.getByText("switch business"));

        await waitFor(() => expect(screen.getByTestId("products").textContent).toBe("B-Product"));

        // Both businesses' data must coexist in the cache under distinct keys — proof
        // that switching businessId didn't overwrite or evict the other business's
        // entry, and that a future switch back to biz-a couldn't be served biz-b's data.
        expect(queryClient.getQueryData(merchForgeQueryKeys.products("biz-a"))).toMatchObject({
            items: [{ title: "A-Product" }],
        });
        expect(queryClient.getQueryData(merchForgeQueryKeys.products("biz-b"))).toMatchObject({
            items: [{ title: "B-Product" }],
        });
    });
});
