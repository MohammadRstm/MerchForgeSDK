import { describe, expect, it } from "vitest";
import { createApiClient } from "./client";

describe("createApiClient", () => {
    it("configures the client with the given apiUrl as baseURL", () => {
        const client = createApiClient("https://api.example.com/api");

        expect(client.defaults.baseURL).toBe("https://api.example.com/api");
    });

    it("requests JSON responses", () => {
        const client = createApiClient("https://api.example.com/api");

        expect(client.defaults.headers.Accept).toBe("application/json");
    });

    it("installs a response interceptor so consumers never see raw Axios errors", () => {
        const client = createApiClient("https://api.example.com/api");

        // Axios doesn't expose interceptor internals publicly beyond this handlers array,
        // but its presence/length is exactly what proves the interceptor was registered.
        const handlers = (client.interceptors.response as unknown as { handlers: unknown[] }).handlers;
        expect(handlers.filter(Boolean).length).toBeGreaterThan(0);
    });

    it("creates an independent instance per call — no shared module-level client", () => {
        const clientA = createApiClient("https://a.example.com");
        const clientB = createApiClient("https://b.example.com");

        expect(clientA).not.toBe(clientB);
        expect(clientA.defaults.baseURL).toBe("https://a.example.com");
        expect(clientB.defaults.baseURL).toBe("https://b.example.com");
    });
});
