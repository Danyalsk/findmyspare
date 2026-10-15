"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** The vehicle the shopper is buying for. Drives fitment filters everywhere.
 *  Per-device convenience only (localStorage), never a source of truth. */
export interface SelectedVehicle {
  make: string;
  model: string;
  variant?: string | null;
  year?: number | null;
  regNoDisplay?: string | null;
  vehicleId?: string | null; // set when picked from "My vehicles"
}

interface VehicleState {
  selected: SelectedVehicle | null;
  select: (v: SelectedVehicle | null) => void;
}

export const useVehicleStore = create<VehicleState>()(
  persist((set) => ({ selected: null, select: (v) => set({ selected: v }) }), { name: "fms_vehicle", skipHydration: true })
);

export const vehicleShortLabel = (v: SelectedVehicle) =>
  [v.model, v.variant].filter(Boolean).join(" ") + (v.year ? ` ${v.year}` : "");

/** Does a listing declare (or have confirmed) fitment for this vehicle? */
export function fitsVehicle(fits: { make: string; model: string }[] | null | undefined, v: SelectedVehicle | null, confirmed = 0) {
  if (!v) return null;
  const ok = (fits ?? []).some((f) => f.make.toLowerCase() === v.make.toLowerCase() && f.model.toLowerCase() === v.model.toLowerCase());
  return ok || confirmed > 0 ? true : false;
}
