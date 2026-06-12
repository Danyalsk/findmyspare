import { fetchApi } from "./index";
import type { Banner } from "@/lib/types";

export const bannersApi = {
  listActive: (): Promise<{ banners: Banner[] }> => fetchApi(`/banners`),
};
