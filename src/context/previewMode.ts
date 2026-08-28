const STORAGE_KEY = "merchforge_preview_token";
const QUERY_PARAM = "merchforge_preview";

/**
 * Resolves preview mode once per page load, for the dashboard's "Preview" button
 * flow: it opens the storefront with `?merchforge_preview=<token>` appended. A token
 * found in the URL takes priority and is persisted to sessionStorage before being
 * stripped from the visible address bar via `history.replaceState` — a query-string
 * token leaks via the `Referer` header to anything else the page loads (templates
 * already embed Google Maps iframes and Google Fonts), so it must not sit there any
 * longer than this one read. A token already in sessionStorage (a reload during an
 * ongoing preview session) is used when the URL doesn't carry one. Returns null
 * outside a browser environment (SSR) or when no preview token exists anywhere.
 */
export function resolvePreviewToken(): string | null {
    if (typeof window === "undefined") {
        return null;
    }

    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get(QUERY_PARAM);

    if (urlToken) {
        try {
            window.sessionStorage.setItem(STORAGE_KEY, urlToken);
        } catch {
            // sessionStorage unavailable (privacy mode, disabled storage) — the token
            // still works for the rest of this page load via the returned value, it
            // just won't survive a reload.
        }

        params.delete(QUERY_PARAM);
        const query = params.toString();
        const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
        window.history.replaceState(window.history.state, "", nextUrl);

        return urlToken;
    }

    try {
        return window.sessionStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}
