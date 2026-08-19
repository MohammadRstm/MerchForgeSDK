import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Minimal dev server config for the SDK example/integration test app. Nothing here
// is meant to be a template for a real storefront's build setup.
export default defineConfig({
    plugins: [react()],
});
