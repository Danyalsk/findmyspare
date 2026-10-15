"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** False during SSR and hydration; true on the client afterwards.
 *  Gate anything read from localStorage-backed stores on this. */
export function useMounted() {
  return useSyncExternalStore(noop, () => true, () => false);
}

/** window.location.origin on the client, "" during SSR. */
export function useOrigin() {
  return useSyncExternalStore(noop, () => window.location.origin, () => "");
}
