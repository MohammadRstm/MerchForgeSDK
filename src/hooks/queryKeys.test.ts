import { describe, expect, it } from "vitest";
import { merchForgeQueryKeys } from "./queryKeys";

describe("merchForgeQueryKeys", () => {
    it("scopes every key by businessId", () => {
        expect(merchForgeQueryKeys.business("biz-a")).toEqual(["merchforge", "biz-a", "business"]);
        expect(merchForgeQueryKeys.products("biz-a")).toEqual(["merchforge", "biz-a", "products", {}]);
        expect(merchForgeQueryKeys.product("biz-a", "p1")).toEqual(["merchforge", "biz-a", "products", "p1"]);
        expect(merchForgeQueryKeys.categories("biz-a")).toEqual(["merchforge", "biz-a", "categories"]);
    });

    it("produces different keys for different businesses given the same resource/params", () => {
        expect(merchForgeQueryKeys.business("biz-a")).not.toEqual(merchForgeQueryKeys.business("biz-b"));
        expect(merchForgeQueryKeys.products("biz-a", { page: 1 })).not.toEqual(
            merchForgeQueryKeys.products("biz-b", { page: 1 })
        );
        expect(merchForgeQueryKeys.product("biz-a", "p1")).not.toEqual(merchForgeQueryKeys.product("biz-b", "p1"));
        expect(merchForgeQueryKeys.categories("biz-a")).not.toEqual(merchForgeQueryKeys.categories("biz-b"));
    });

    it("produces different product-list keys for different query params within the same business", () => {
        const noFilter = merchForgeQueryKeys.products("biz-a");
        const withSearch = merchForgeQueryKeys.products("biz-a", { search: "shirt" });
        const withPage = merchForgeQueryKeys.products("biz-a", { page: 2 });

        expect(noFilter).not.toEqual(withSearch);
        expect(noFilter).not.toEqual(withPage);
        expect(withSearch).not.toEqual(withPage);
    });

    it("scopes related-product keys by business, product, and limit", () => {
        expect(merchForgeQueryKeys.relatedProducts("biz-a", "p1", 4)).toEqual([
            "merchforge", "biz-a", "products", "p1", "related", 4,
        ]);

        // Different business, same product id — must not collide.
        expect(merchForgeQueryKeys.relatedProducts("biz-a", "p1", 4)).not.toEqual(
            merchForgeQueryKeys.relatedProducts("biz-b", "p1", 4)
        );

        // A different limit is a different result set, so a different cache entry.
        expect(merchForgeQueryKeys.relatedProducts("biz-a", "p1", 4)).not.toEqual(
            merchForgeQueryKeys.relatedProducts("biz-a", "p1", 8)
        );
    });

    it("keeps a product's detail key distinct from its related-products key", () => {
        expect(merchForgeQueryKeys.product("biz-a", "p1")).not.toEqual(
            merchForgeQueryKeys.relatedProducts("biz-a", "p1")
        );
    });

    it("all resources share the merchforge namespace prefix", () => {
        expect(merchForgeQueryKeys.business("biz-a")[0]).toBe("merchforge");
        expect(merchForgeQueryKeys.products("biz-a")[0]).toBe("merchforge");
        expect(merchForgeQueryKeys.product("biz-a", "p1")[0]).toBe("merchforge");
        expect(merchForgeQueryKeys.categories("biz-a")[0]).toBe("merchforge");
    });
});
