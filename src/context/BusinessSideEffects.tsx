import { useEffect } from "react";
import { resolveImageUrl } from "../adapters/productView";
import { useBusiness } from "../hooks/useBusiness";

/**
 * Applies the two customization effects every template gets for free, with zero
 * per-template code: the `--primary` CSS variable every template's own
 * `_variables.scss` already defines as its real brand-color lever, and the browser
 * tab's favicon. Renders no UI; mounted once inside MerchForgeProvider so it shares
 * the same cached useBusiness() query every template's own call reads from — this is
 * an additional consumer of that cache entry, not a second network request.
 */
export function BusinessSideEffects({ apiUrl }: { apiUrl: string }) {
    const { data: business } = useBusiness();

    // Uploaded images are static files served from the API's own origin, not under
    // /api (see resolveImageUrl's own doc comment and every template's env.ts,
    // which derive apiUrl as `${origin}/api` for exactly this reason) — passing
    // apiUrl itself here would produce a URL like ".../api/uploads/..." that 404s.
    const assetOrigin = apiUrl.replace(/\/api\/?$/, "");

    useEffect(() => {
        if (!business?.primaryColor) {
            return;
        }

        document.documentElement.style.setProperty("--primary", business.primaryColor);
    }, [business?.primaryColor]);

    useEffect(() => {
        const faviconUrl = resolveImageUrl(business?.faviconUrl, assetOrigin);

        if (!faviconUrl) {
            return;
        }

        let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');

        if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
        }

        link.href = faviconUrl;
    }, [business?.faviconUrl, assetOrigin]);

    return null;
}
