import { fetchApi } from "./index";
import type { User, SupplierDashboard } from "../types";

export interface OnboardingInput {
  businessName: string;
  gstNumber: string;
  panNumber: string;
  phone?: string;
  gstCertificateUrl?: string;
  businessAddress: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    pincode: string;
  };
}

export const supplierApi = {
  /** GET /supplier/dashboard — operational counts only (no escrow in v1). */
  dashboard: (): Promise<SupplierDashboard> => fetchApi("/supplier/dashboard"),

  /** GET /supplier/onboarding — current onboarding state. */
  getOnboarding: (): Promise<{ user: User }> => fetchApi("/supplier/onboarding"),

  /** POST /supplier/onboarding — first submission. */
  submitOnboarding: (input: OnboardingInput): Promise<{ user: User }> =>
    fetchApi("/supplier/onboarding", { method: "POST", body: JSON.stringify(input) }),

  /** PATCH /supplier/onboarding — resubmit after rejection. */
  resubmitOnboarding: (input: OnboardingInput): Promise<{ user: User }> =>
    fetchApi("/supplier/onboarding", { method: "PATCH", body: JSON.stringify(input) }),
};
