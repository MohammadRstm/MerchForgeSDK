import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MerchForgeProvider } from "@merchforge/storefront-sdk";
import App from "./App";

// businessId is a real business seeded in the MerchForge dev database ("Test2"),
// used here purely to exercise the SDK end to end. A real storefront would get its
// own business's id, not this one.
createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <MerchForgeProvider
            apiUrl="https://localhost:7021/api"
            businessId="b810942d-b92c-4390-aa21-18aa82c84b87"
        >
            <App />
        </MerchForgeProvider>
    </StrictMode>
);
