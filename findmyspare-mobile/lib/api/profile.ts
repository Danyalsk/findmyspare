import { fetchApi } from "./index";

export interface ProfileUpdate {
  name?: string;
  phone?: string;
  image?: string;
  businessName?: string;
  businessType?: string;
  specialization?: string;
}

export interface ProfileEntity {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  image: string | null;
  businessName: string | null;
  businessType: string | null;
  specialization: string | null;
}

export const profileApi = {
  get: (): Promise<{ profile: ProfileEntity }> => fetchApi("/profile"),
  update: (input: ProfileUpdate): Promise<{ profile: ProfileEntity }> =>
    fetchApi("/profile", { method: "PATCH", body: JSON.stringify(input) }),
};
