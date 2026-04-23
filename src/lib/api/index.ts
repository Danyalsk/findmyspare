import {
  getAccessToken,
  getRefreshToken,
  setAccessTokenRaw,
  setRefreshTokenRaw,
  clearAuthRaw,
} from "@/lib/store";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        clearAuthRaw();
        return null;
      }

      const data = await res.json();
      setAccessTokenRaw(data.accessToken);
      setRefreshTokenRaw(data.refreshToken);
      return data.accessToken as string;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function buildHeaders(options: RequestInit, token: string | null) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.headers) Object.assign(headers, options.headers as Record<string, string>);
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function rawFetch(endpoint: string, options: RequestInit, token: string | null) {
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: buildHeaders(options, token),
  });
}

export const fetchApi = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const isAuthRefresh = endpoint === "/auth/refresh" || endpoint === "/auth/logout";

  let response = await rawFetch(endpoint, options, getAccessToken());

  if (response.status === 401 && !isAuthRefresh && getRefreshToken()) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await rawFetch(endpoint, options, newToken);
    } else {
      clearAuthRaw();
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : {}) as T;
};

export * from "./auth";
export * from "./products";
export * from "./inquiries";
export * from "./bids";
export * from "./orders";
export * from "./addresses";
export * from "./supplier";
