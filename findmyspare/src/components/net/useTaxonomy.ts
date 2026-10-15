"use client";

import { useEffect, useState } from "react";
import { taxonomyApi, type Industry } from "@/lib/api/v3";

/** The marketplace's industry tree (cached for the session). null while loading. */
export function useTaxonomy(): Industry[] | null {
  const [list, setList] = useState<Industry[] | null>(null);
  useEffect(() => {
    let live = true;
    taxonomyApi.get().then((r) => { if (live) setList(r.industries); }).catch(() => { if (live) setList([]); });
    return () => { live = false; };
  }, []);
  return list;
}
