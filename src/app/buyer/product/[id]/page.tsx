"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function BuyerProductRedirect() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  useEffect(() => {
    router.replace(`/product/${id}`);
  }, [id, router]);
  return null;
}
