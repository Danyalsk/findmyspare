"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

export interface ComingSoonProps {
  redirectTo: string;
  message?: string;
}

export function ComingSoon({ redirectTo, message = "Coming soon" }: ComingSoonProps) {
  const router = useRouter();
  useEffect(() => {
    toast.info(message);
    router.replace(redirectTo);
  }, [router, redirectTo, message]);
  return null;
}
