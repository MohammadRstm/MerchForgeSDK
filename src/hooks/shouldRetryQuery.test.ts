import { describe, expect, it } from "vitest";
import { shouldRetryQuery } from "./shouldRetryQuery";
import { MerchForgeApiError } from "../errors/MerchForgeApiError";

function errorOfType(type: MerchForgeApiError["type"]): MerchForgeApiError {
    return new MerchForgeApiError({ type, code: "TEST", message: "test" });
}

describe("shouldRetryQuery", () => {
    it.each(["NotFound", "Validation", "Authentication", "Authorization", "Conflict"] as const)(
        "never retries a %s error, even on the first failure",
        (type) => {
            expect(shouldRetryQuery(0, errorOfType(type))).toBe(false);
        }
    );

    it.each(["Network", "Unexpected"] as const)(
        "retries a %s error up to 3 times",
        (type) => {
            expect(shouldRetryQuery(0, errorOfType(type))).toBe(true);
            expect(shouldRetryQuery(1, errorOfType(type))).toBe(true);
            expect(shouldRetryQuery(2, errorOfType(type))).toBe(true);
            expect(shouldRetryQuery(3, errorOfType(type))).toBe(false);
        }
    );
});
