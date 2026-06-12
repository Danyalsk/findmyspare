"use client";

import { useEffect } from "react";
import { useAuthStore, getAccessToken } from "@/lib/store";
import { authApi } from "@/lib/api";

// On every app load, validate the cached session against the server:
//  • token valid   → refresh the stored user (fresh role / verification / profile)
//  • token invalid → fetchApi's 401 path clears auth → consistent logged-out UI
// Without this the app trusts a stale localStorage user even after the token
// dies, showing a "ghost" logged-in state that collapses on the first API call.
export function SessionSync() {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (!getAccessToken()) return; // logged out — nothing to validate
    authApi
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => {
        // 401 already cleared auth inside fetchApi; ignore other transient errors.
      });
  }, [setUser]);

  return null;
}
