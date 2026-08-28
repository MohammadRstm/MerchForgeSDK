import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { exchangeCustomerCode } from "../api/customerAuth";
import { toMerchForgeApiError } from "../errors/MerchForgeApiError";
import type { Customer, CustomerSession } from "../types/customer";
import { CustomerAuthContext, type CustomerAuthContextValue } from "./CustomerAuthContext";

const SILENT_MESSAGE_SOURCE = "merchforge-customer-silent";

/** How long before the access token's real expiry to renew it proactively. */
const PROACTIVE_RENEWAL_LEAD_MS = 60_000;

/** How long to wait for the hidden iframe/popup to respond before treating it as failed. */
const SILENT_MESSAGE_TIMEOUT_MS = 6_000;

interface SilentMessage {
    source: typeof SILENT_MESSAGE_SOURCE;
    status: "ok" | "unauthenticated";
    accessToken?: string;
    accessTokenExpiresAt?: string;
    customer?: Customer;
}

function isSilentMessage(data: unknown): data is SilentMessage {
    return (
        !!data &&
        typeof data === "object" &&
        (data as Record<string, unknown>).source === SILENT_MESSAGE_SOURCE
    );
}

function isCompleteOkMessage(
    message: SilentMessage | null
): message is SilentMessage & { status: "ok"; accessToken: string; accessTokenExpiresAt: string; customer: Customer } {
    return (
        !!message &&
        message.status === "ok" &&
        !!message.accessToken &&
        !!message.accessTokenExpiresAt &&
        !!message.customer
    );
}

/**
 * Every template that uses customer accounts adds exactly one route at this fixed
 * path whose whole job is reading ?exchangeCode= and calling completeExchange() — see
 * the SDK README. Using one fixed convention (rather than an arbitrary returnUrl) is
 * what lets the same URL be used both when minting the exchange code (login/signup)
 * and when redeeming it (completeExchange), with nothing to keep in sync by hand.
 */
function buildCallbackUrl(): string {
    return `${window.location.origin}/auth/callback`;
}

function waitForSilentMessage(source: Window, timeoutMs: number): Promise<SilentMessage | null> {
    return new Promise((resolve) => {
        let settled = false;

        const settle = (value: SilentMessage | null) => {
            if (settled) return;
            settled = true;
            window.removeEventListener("message", onMessage);
            clearTimeout(timer);
            resolve(value);
        };

        const onMessage = (event: MessageEvent) => {
            if (event.source !== source) return;
            if (!isSilentMessage(event.data)) return;
            settle(event.data);
        };

        const timer = setTimeout(() => settle(null), timeoutMs);

        window.addEventListener("message", onMessage);
    });
}

/**
 * Loads the platform's hidden /customer/silent page in an invisible iframe. If the
 * platform origin's cookie is readable (same-partition, or a prior Storage Access
 * grant already covers it), this resolves silently — the common case once a
 * storefront has been granted access once. Never throws: a denied/blocked/timed-out
 * attempt just resolves null so the caller can fall back to the popup path.
 */
async function tryIframeRenewal(platformUrl: string): Promise<SilentMessage | null> {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = `${platformUrl}/customer/silent?origin=${encodeURIComponent(window.location.origin)}`;

    document.body.appendChild(iframe);

    try {
        const contentWindow = iframe.contentWindow;

        if (!contentWindow) {
            return null;
        }

        return await waitForSilentMessage(contentWindow, SILENT_MESSAGE_TIMEOUT_MS);
    } finally {
        iframe.remove();
    }
}

/**
 * Fallback for when the iframe path is denied/unavailable. A window.open() popup is a
 * genuine top-level, first-party context from its own point of view, so it reads the
 * platform's cookie with zero third-party restriction regardless of any browser's
 * policy — at the cost of a brief visible flash, and the risk of being blocked by the
 * browser's popup blocker if not triggered by a user gesture (in which case
 * window.open returns null and this resolves null immediately, no hang).
 */
async function tryPopupRenewal(platformUrl: string): Promise<SilentMessage | null> {
    const popup = window.open(
        `${platformUrl}/customer/silent?origin=${encodeURIComponent(window.location.origin)}`,
        "merchforge-customer-silent",
        "width=1,height=1"
    );

    if (!popup) {
        return null;
    }

    try {
        return await waitForSilentMessage(popup, SILENT_MESSAGE_TIMEOUT_MS);
    } finally {
        if (!popup.closed) {
            popup.close();
        }
    }
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

export interface CustomerAuthProviderProps {
    apiUrl: string;
    platformUrl?: string;
    /** The SDK's existing anonymous storefront client — reused for /CustomerAuth/exchange. */
    anonymousClient: AxiosInstance;
    children: ReactNode;
}

/**
 * Owns the entire customer-auth lifecycle: in-memory-only access token (never
 * localStorage/sessionStorage — a page reload starts logged out and silently
 * re-authenticates via /customer/silent if the central session is still valid, rather
 * than persisting the token itself), proactive renewal ~60s before expiry, and a
 * reactive 401-retry-once on the dedicated customerApiClient. Mounted unconditionally
 * inside MerchForgeProvider; harmless no-op for storefronts that never call
 * useCustomerAuth() and safe (customer accounts just stay unavailable) for ones that
 * omit platformUrl.
 */
export function CustomerAuthProvider({ apiUrl, platformUrl, anonymousClient, children }: CustomerAuthProviderProps) {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const tokenRef = useRef<string | null>(null);
    const renewalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inFlightSilentRefreshRef = useRef<Promise<boolean> | null>(null);
    // Forward reference so scheduleRenewal (defined before silentRefresh) and the
    // customerApiClient's response interceptor (which must be stable across renders)
    // can both always call the *current* silentRefresh without creating a circular
    // useCallback dependency or going stale.
    const silentRefreshRef = useRef<() => Promise<boolean>>(async () => false);

    const clearRenewalTimer = useCallback(() => {
        if (renewalTimerRef.current !== null) {
            clearTimeout(renewalTimerRef.current);
            renewalTimerRef.current = null;
        }
    }, []);

    const scheduleRenewal = useCallback(
        (expiresAtMs: number) => {
            clearRenewalTimer();

            const delay = Math.max(0, expiresAtMs - Date.now() - PROACTIVE_RENEWAL_LEAD_MS);

            renewalTimerRef.current = setTimeout(() => {
                void silentRefreshRef.current();
            }, delay);
        },
        [clearRenewalTimer]
    );

    const applySession = useCallback(
        (session: CustomerSession) => {
            tokenRef.current = session.accessToken;
            setCustomer(session.customer);
            scheduleRenewal(new Date(session.accessTokenExpiresAt).getTime());
        },
        [scheduleRenewal]
    );

    const clearSession = useCallback(() => {
        tokenRef.current = null;
        setCustomer(null);
        clearRenewalTimer();
    }, [clearRenewalTimer]);

    const silentRefresh = useCallback((): Promise<boolean> => {
        if (!platformUrl) {
            clearSession();
            return Promise.resolve(false);
        }

        if (inFlightSilentRefreshRef.current) {
            return inFlightSilentRefreshRef.current;
        }

        const run = async (): Promise<boolean> => {
            const iframeResult = await tryIframeRenewal(platformUrl);

            if (isCompleteOkMessage(iframeResult)) {
                applySession({
                    accessToken: iframeResult.accessToken,
                    accessTokenExpiresAt: iframeResult.accessTokenExpiresAt,
                    customer: iframeResult.customer,
                });
                return true;
            }

            const popupResult = await tryPopupRenewal(platformUrl);

            if (isCompleteOkMessage(popupResult)) {
                applySession({
                    accessToken: popupResult.accessToken,
                    accessTokenExpiresAt: popupResult.accessTokenExpiresAt,
                    customer: popupResult.customer,
                });
                return true;
            }

            // Both paths failed — denied, blocked, timed out, or the central session
            // has genuinely expired. Clean transition to logged-out/guest, never a
            // thrown error surfaced to the storefront, never an infinite retry.
            clearSession();
            return false;
        };

        const promise = run().finally(() => {
            inFlightSilentRefreshRef.current = null;
        });

        inFlightSilentRefreshRef.current = promise;

        return promise;
    }, [platformUrl, applySession, clearSession]);

    silentRefreshRef.current = silentRefresh;

    const login = useCallback(
        (returnUrl?: string) => {
            if (!platformUrl) {
                throw new Error("useCustomerAuth().login() requires <MerchForgeProvider platformUrl=... />.");
            }

            window.location.href = `${platformUrl}/customer/login?returnUrl=${encodeURIComponent(
                returnUrl ?? buildCallbackUrl()
            )}`;
        },
        [platformUrl]
    );

    const signup = useCallback(
        (returnUrl?: string) => {
            if (!platformUrl) {
                throw new Error("useCustomerAuth().signup() requires <MerchForgeProvider platformUrl=... />.");
            }

            window.location.href = `${platformUrl}/customer/signup?returnUrl=${encodeURIComponent(
                returnUrl ?? buildCallbackUrl()
            )}`;
        },
        [platformUrl]
    );

    const completeExchange = useCallback(
        async (code: string) => {
            const session = await exchangeCustomerCode(anonymousClient, code, buildCallbackUrl());
            applySession(session);
        },
        [anonymousClient, applySession]
    );

    const logout = useCallback(() => {
        // Local-only, same tradeoff MerchForgeClient's own dashboard AuthProvider
        // makes for its automatic-expiry path: the storefront never had direct access
        // to the central customerRefreshToken cookie to revoke it, so there is no
        // cross-origin call to make here. The central session simply expires on its
        // own after ~30 days regardless.
        clearSession();
    }, [clearSession]);

    // One dedicated Axios instance for Bearer-token-authenticated customer calls
    // (GET/PUT /customer/profile today), kept separate from the SDK's existing
    // anonymous storefront client so a customer-auth failure can never affect
    // anonymous catalog browsing.
    const customerApiClient = useMemo(() => {
        const instance = axios.create({
            baseURL: apiUrl,
            headers: { Accept: "application/json" },
        });

        instance.interceptors.request.use((config) => {
            if (tokenRef.current) {
                config.headers.Authorization = `Bearer ${tokenRef.current}`;
            }

            return config;
        });

        instance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = axios.isAxiosError(error)
                    ? (error.config as RetryableRequestConfig | undefined)
                    : undefined;

                if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
                    originalRequest._retry = true;

                    const renewed = await silentRefreshRef.current();

                    if (renewed && tokenRef.current) {
                        originalRequest.headers.Authorization = `Bearer ${tokenRef.current}`;
                        return instance(originalRequest);
                    }
                }

                return Promise.reject(toMerchForgeApiError(error));
            }
        );

        return instance;
        // eslint-disable-next-line react-hooks/exhaustive-deps -- silentRefreshRef is a ref, deliberately not a dependency
    }, [apiUrl]);

    // Runs once per mount: attempts a silent re-authentication against the central
    // session before rendering anything as "logged out". This is what makes a page
    // reload silently re-authenticate instead of showing a false guest state while the
    // central session is still valid.
    useEffect(() => {
        let cancelled = false;

        silentRefreshRef.current().finally(() => {
            if (!cancelled) {
                setIsLoading(false);
            }
        });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberately mount-only
    }, []);

    useEffect(() => clearRenewalTimer, [clearRenewalTimer]);

    const contextValue = useMemo<CustomerAuthContextValue>(
        () => ({
            customer,
            isAuthenticated: !!customer,
            isLoading,
            login,
            signup,
            logout,
            completeExchange,
            customerApiClient,
        }),
        [customer, isLoading, login, signup, logout, completeExchange, customerApiClient]
    );

    return <CustomerAuthContext.Provider value={contextValue}>{children}</CustomerAuthContext.Provider>;
}
