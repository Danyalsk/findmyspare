import { fetchApi } from "./index";
import type { Address } from "@/lib/types";

export const addressesApi = {
  list: (): Promise<{ addresses: Address[] }> => fetchApi("/addresses"),

  create: (payload: {
    label?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
    phone?: string;
    isDefault?: boolean;
  }): Promise<{ address: Address }> =>
    fetchApi("/addresses", { method: "POST", body: JSON.stringify(payload) }),

  update: (
    id: string,
    payload: Partial<{
      label: string;
      line1: string;
      line2: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone: string;
      isDefault: boolean;
    }>
  ): Promise<{ address: Address }> =>
    fetchApi(`/addresses/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  remove: (id: string): Promise<{ message: string }> =>
    fetchApi(`/addresses/${id}`, { method: "DELETE" }),
};
