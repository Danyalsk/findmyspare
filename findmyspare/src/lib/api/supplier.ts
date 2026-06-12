import { fetchApi } from "./index";
import type { SupplierDashboard } from "@/lib/types";

export const supplierApi = {
  dashboard: (): Promise<SupplierDashboard> => fetchApi("/supplier/dashboard"),
};
