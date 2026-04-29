import { fetchApi, API_URL } from "./index";
import { getAccessToken } from "@/lib/store";
import type { User, BusinessAddress } from "@/lib/types";

export interface OnboardingPayload {
  businessName: string;
  gstNumber: string;
  panNumber: string;
  phone: string;
  gstCertificateUrl: string;
  businessAddress: BusinessAddress;
}

export const supplierOnboardingApi = {
  get: (): Promise<{ user: User }> => fetchApi("/supplier/onboarding"),

  submit: (p: OnboardingPayload): Promise<{ user: User }> =>
    fetchApi("/supplier/onboarding", { method: "POST", body: JSON.stringify(p) }),

  resubmit: (p: OnboardingPayload): Promise<{ user: User }> =>
    fetchApi("/supplier/onboarding", { method: "PATCH", body: JSON.stringify(p) }),
};

export type UploadKind = "gst_cert" | "product_image";

export async function uploadFile(file: File, kind: UploadKind): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("kind", kind);
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}
