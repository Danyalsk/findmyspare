import { fetchApi } from "./index";
import type { Address } from "../types";

export interface AddressInput {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
}

export const addressesApi = {
  list: (): Promise<{ addresses: Address[] }> => fetchApi("/addresses"),

  create: (input: AddressInput): Promise<{ address: Address }> =>
    fetchApi("/addresses", { method: "POST", body: JSON.stringify(input) }),

  update: (id: string, input: Partial<AddressInput>): Promise<{ address: Address }> =>
    fetchApi(`/addresses/${id}`, { method: "PATCH", body: JSON.stringify(input) }),

  remove: (id: string): Promise<{ message: string }> =>
    fetchApi(`/addresses/${id}`, { method: "DELETE" }),
};
