import { fetchApi, fetchApiWithToken } from "./index";
import type { User } from "../types";

export interface VerifyResult {
  user: User;
  token: string;
}

/**
 * Step 1 — request a 6-digit OTP by email (BetterAuth email-OTP plugin).
 * POST /api/auth/email-otp/send-verification-otp { email, type: "sign-in" }
 */
export async function requestOtp(email: string): Promise<void> {
  await fetchApi("/api/auth/email-otp/send-verification-otp", {
    method: "POST",
    body: JSON.stringify({ email: email.trim().toLowerCase(), type: "sign-in" }),
  });
}

/**
 * Step 2 — verify the OTP. The new bearer token arrives in the `set-auth-token`
 * response header; the body carries the user.
 * POST /api/auth/sign-in/email-otp { email, otp }
 */
export async function verifyOtp(email: string, otp: string): Promise<VerifyResult> {
  const { data, token } = await fetchApiWithToken<{ user: User; token?: string }>(
    "/api/auth/sign-in/email-otp",
    {
      method: "POST",
      body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
    }
  );
  const resolved = token || data.token;
  if (!resolved) throw new Error("No session token returned. Please try again.");
  return { user: data.user, token: resolved };
}

/** Current authenticated user (BetterAuth bearer accepted on legacy route). */
export async function me(): Promise<{ user: User }> {
  return fetchApi("/auth/me");
}

/** Complete the profile gate after first sign-in. */
export async function completeProfile(payload: {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  pincode?: string;
}): Promise<{ user: User }> {
  return fetchApi("/auth/complete-profile", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Flip the current buyer account to a supplier. */
export async function becomeSupplier(): Promise<{ user: User }> {
  return fetchApi("/auth/become-supplier", { method: "POST", body: JSON.stringify({}) });
}

/** Sign out — deletes the server session, killing the token immediately. */
export async function signOut(): Promise<void> {
  await fetchApi("/api/auth/sign-out", { method: "POST", body: JSON.stringify({}) }).catch(
    () => {}
  );
}
