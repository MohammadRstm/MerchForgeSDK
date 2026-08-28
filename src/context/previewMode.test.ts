import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resolvePreviewToken } from "./previewMode";

const STORAGE_KEY = "merchforge_preview_token";

function setUrl(pathAndQuery: string) {
    // replaceState can only change the path/query/hash, never the origin — jsdom's
    // default test origin (not storefront.example) is what every relative URL here
    // resolves against.
    window.history.replaceState(null, "", pathAndQuery);
}

describe("resolvePreviewToken", () => {
    beforeEach(() => {
        window.sessionStorage.clear();
        setUrl("/");
    });

    afterEach(() => {
        window.sessionStorage.clear();
        setUrl("/");
    });

    it("returns null when there is no token in the URL or sessionStorage", () => {
        expect(resolvePreviewToken()).toBeNull();
    });

    it("captures a token from the URL query param", () => {
        setUrl("/?merchforge_preview=abc123");

        expect(resolvePreviewToken()).toBe("abc123");
    });

    it("persists the URL token to sessionStorage", () => {
        setUrl("/?merchforge_preview=abc123");

        resolvePreviewToken();

        expect(window.sessionStorage.getItem(STORAGE_KEY)).toBe("abc123");
    });

    it("strips the preview param from the visible URL, preserving other params", () => {
        setUrl("/products?foo=bar&merchforge_preview=abc123");

        resolvePreviewToken();

        expect(window.location.search).toBe("?foo=bar");
        expect(window.location.pathname).toBe("/products");
    });

    it("falls back to a token already in sessionStorage when the URL has none", () => {
        window.sessionStorage.setItem(STORAGE_KEY, "stored-token");

        expect(resolvePreviewToken()).toBe("stored-token");
    });

    it("prefers a URL token over one already stored", () => {
        window.sessionStorage.setItem(STORAGE_KEY, "old-token");
        setUrl("/?merchforge_preview=new-token");

        expect(resolvePreviewToken()).toBe("new-token");
        expect(window.sessionStorage.getItem(STORAGE_KEY)).toBe("new-token");
    });
});
