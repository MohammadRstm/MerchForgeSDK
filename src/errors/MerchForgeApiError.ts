import axios from "axios";

/**
 * Mirrors MerchForge's backend ErrorType enum. "Network" is an SDK-only addition for
 * requests that never reached the backend (offline, CORS, DNS, timeout, etc.).
 */
export type MerchForgeErrorType =
    | "Validation"
    | "Authentication"
    | "Authorization"
    | "NotFound"
    | "Conflict"
    | "Unexpected"
    | "Network";

export interface MerchForgeApiErrorDetails {
    type: MerchForgeErrorType;
    code: string;
    message: string;
    status?: number;
    traceId?: string;
    errors?: Record<string, string[]>;
}

/**
 * The one error shape every SDK hook surfaces. Storefronts never see raw Axios
 * errors or the backend's wire format directly.
 */
export class MerchForgeApiError extends Error {
    readonly type: MerchForgeErrorType;
    readonly code: string;
    readonly status?: number;
    readonly traceId?: string;
    readonly errors?: Record<string, string[]>;

    constructor(details: MerchForgeApiErrorDetails) {
        super(details.message);

        this.name = "MerchForgeApiError";
        this.type = details.type;
        this.code = details.code;
        this.status = details.status;
        this.traceId = details.traceId;
        this.errors = details.errors;
    }
}

interface BackendApiErrorResponse {
    type: MerchForgeErrorType;
    code: string;
    message: string;
    traceId: string;
    errors?: Record<string, string[]>;
}

function isBackendApiErrorResponse(data: unknown): data is BackendApiErrorResponse {
    if (!data || typeof data !== "object") {
        return false;
    }

    const value = data as Record<string, unknown>;

    return (
        typeof value.type === "string" &&
        typeof value.code === "string" &&
        typeof value.message === "string"
    );
}

/**
 * Normalizes any error raised by the API client into a MerchForgeApiError. Installed
 * once as a response interceptor in api/client.ts, so every hook already receives
 * this shape without needing to know about Axios or the backend's error format.
 */
export function toMerchForgeApiError(error: unknown): MerchForgeApiError {
    if (axios.isAxiosError(error)) {
        const response = error.response;

        if (response?.data && isBackendApiErrorResponse(response.data)) {
            return new MerchForgeApiError({
                type: response.data.type,
                code: response.data.code,
                message: response.data.message,
                traceId: response.data.traceId,
                errors: response.data.errors,
                status: response.status,
            });
        }

        return new MerchForgeApiError({
            type: "Network",
            code: "NETWORK_ERROR",
            message: "Unable to connect to the MerchForge API.",
            status: response?.status,
        });
    }

    return new MerchForgeApiError({
        type: "Unexpected",
        code: "UNKNOWN_ERROR",
        message: "An unexpected error occurred.",
    });
}
