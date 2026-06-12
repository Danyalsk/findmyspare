import { fetchApi } from "./index";
import type { Banner } from "../types";

export const bannersApi = {
  listActive: (): Promise<{ banners: Banner[] }> => fetchApi("/banners"),
};
