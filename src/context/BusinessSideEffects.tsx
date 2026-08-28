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

    useEffect(() => {
        if (!business?.primaryColor) {
            return;
        }

        document.documentElement.style.setProperty("--primary", business.primaryColor);
    }, [business?.primaryColor]);

    useEffect(() => {
        const faviconUrl = resolveImageUrl(business?.faviconUrl, apiUrl);

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
    }, [business?.faviconUrl, apiUrl]);

    return null;
}
