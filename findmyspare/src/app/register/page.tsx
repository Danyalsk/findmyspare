"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Signup + signin are unified into one OTP flow at /login.
export default function RegisterRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login");
  }, [router]);
  return null;
}
