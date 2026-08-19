import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { MerchForgeApiError, parseOrThrow, toMerchForgeApiError } from "./MerchForgeApiError";

function fakeAxiosResponse(status: number, data: unknown) {
    return { status, data, statusText: "", headers: {}, config: {} as never };
}

describe("toMerchForgeApiError", () => {
    it("uses the backend's structured ApiErrorResponse body when present", () => {
        const axiosError = new AxiosError(
            "Request failed",
            "ERR_BAD_REQUEST",
            undefined,
            undefined,
            fakeAxiosResponse(400, {
                type: "Validation",
                code: "INVALID_PRICE",
                message: "Price must be positive.",
                traceId: "trace-123",
                errors: { price: ["must be positive"] },
            })
        );

        const result = toMerchForgeApiError(axiosError);

        expect(result).toBeInstanceOf(MerchForgeApiError);
        expect(result.type).toBe("Validation");
        expect(result.code).toBe("INVALID_PRICE");
        expect(result.message).toBe("Price must be positive.");
        expect(result.traceId).toBe("trace-123");
        expect(result.errors).toEqual({ price: ["must be positive"] });
        expect(result.status).toBe(400);
    });

    it("maps a real but unstructured HTTP response by status code (e.g. a route that doesn't exist yet)", () => {
        const axiosError = new AxiosError(
            "Request failed",
            "ERR_BAD_REQUEST",
            undefined,
            undefined,
            fakeAxiosResponse(404, "<html>Not Found</html>")
        );

        const result = toMerchForgeApiError(axiosError);

        expect(result.type).toBe("NotFound");
        expect(result.code).toBe("UNEXPECTED_RESPONSE");
        expect(result.status).toBe(404);
    });

    it("maps an unstructured 401/403/409 response to Authentication/Authorization/Conflict", () => {
        expect(
            toMerchForgeApiError(
                new AxiosError("x", "x", undefined, undefined, fakeAxiosResponse(401, null))
            ).type
        ).toBe("Authentication");

        expect(
            toMerchForgeApiError(
                new AxiosError("x", "x", undefined, undefined, fakeAxiosResponse(403, null))
            ).type
        ).toBe("Authorization");

        expect(
            toMerchForgeApiError(
                new AxiosError("x", "x", undefined, undefined, fakeAxiosResponse(409, null))
            ).type
        ).toBe("Conflict");
    });

    it("falls back to Unexpected for an unstructured, unrecognized status", () => {
        const result = toMerchForgeApiError(
            new AxiosError("x", "x", undefined, undefined, fakeAxiosResponse(502, "Bad Gateway"))
        );

        expect(result.type).toBe("Unexpected");
    });

    it("classifies a request that never reached the server as a Network error", () => {
        const axiosError = new AxiosError("Network Error", "ERR_NETWORK");
        // No `response` set — mirrors what Axios produces for CORS/DNS/offline/timeout failures.

        const result = toMerchForgeApiError(axiosError);

        expect(result.type).toBe("Network");
        expect(result.code).toBe("NETWORK_ERROR");
        expect(result.status).toBeUndefined();
    });

    it("classifies a non-Axios error as Unexpected/UNKNOWN_ERROR instead of throwing or passing it through raw", () => {
        const result = toMerchForgeApiError(new Error("something else went wrong"));

        expect(result).toBeInstanceOf(MerchForgeApiError);
        expect(result.type).toBe("Unexpected");
        expect(result.code).toBe("UNKNOWN_ERROR");
    });
});

describe("parseOrThrow", () => {
    const schema = z.object({ id: z.string(), name: z.string() });

    it("returns the parsed data when it matches the schema", () => {
        const data = { id: "1", name: "Widget" };

        expect(parseOrThrow(schema, data)).toEqual(data);
    });

    it("throws a MerchForgeApiError (not a raw ZodError) when the response doesn't match the schema", () => {
        let caught: unknown;

        try {
            parseOrThrow(schema, { id: "1" /* missing name */ });
        } catch (error) {
            caught = error;
        }

        expect(caught).toBeInstanceOf(MerchForgeApiError);
        expect((caught as MerchForgeApiError).type).toBe("Unexpected");
        expect((caught as MerchForgeApiError).code).toBe("INVALID_RESPONSE_SHAPE");
    });
});
