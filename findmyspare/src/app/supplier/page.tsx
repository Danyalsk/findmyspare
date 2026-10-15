"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/* The supplier dashboard moved to the Business OS. */
export default function SupplierHome() {
  const router = useRouter();
  useEffect(() => { router.replace("/biz"); }, [router]);
  return null;
}
