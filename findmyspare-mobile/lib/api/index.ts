import Constants from "expo-constants";
import { getAccessToken, setAccessTokenRaw, clearAuthRaw } from "../store";

export const API_URL: string =
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ||
  "http://localhost:8000";

function buildHeaders(options: RequestInit, token: string | null) {
  const headers: Record<string, string> = {};
  // Don't force JSON content-type for multipart (FormData) bodies.
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (options.headers) Object.assign(headers, options.headers as Record<string, string>);
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

// BetterAuth rotates the session token via the `set-auth-token` response header.
// Persist it whenever present so the stored bearer stays fresh.
async function captureRotatedToken(response: Response) {
  const rotated = response.headers.get("set-auth-token");
  if (rotated) await setAccessTokenRaw(rotated);
}

async function parse<T>(response: Response): Promise<T> {
  const text = await response.text();
  return (text ? JSON.parse(text) : {}) as T;
}

/**
 * Core fetch wrapper. Sends the bearer token, captures rotated tokens, and on a
 * 401 (BetterAuth has no refresh token — a 401 means the session is dead) it
 * clears auth so the app routes back to login.
 */
export const fetchApi = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: buildHeaders(options, getAccessToken()),
  });

  await captureRotatedToken(response);

  if (response.status === 401) {
    await clearAuthRaw();
    throw new Error("Your session expired. Please sign in again.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
  }

  return parse<T>(response);
};

/**
 * Like fetchApi but also returns the `set-auth-token` header value, used by the
 * OTP verify call which receives the brand-new bearer token in that header.
 */
export const fetchApiWithToken = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T; token: string | null }> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: buildHeaders(options, getAccessToken()),
  });

  const token = response.headers.get("set-auth-token");

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
  }

  const data = await parse<T>(response);
  return { data, token };
};

export * from "./auth";
export * from "./products";
export * from "./inventory";
export * from "./orders";
export * from "./disputes";
export * from "./messages";
export * from "./inquiries";
export * from "./banners";
export * from "./bids";
export * from "./upload";
export * from "./addresses";
export * from "./notifications";
export * from "./admin";
export * from "./profile";
export * from "./supplier";
