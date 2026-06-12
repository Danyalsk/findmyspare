"use client";

import React from "react";
import { clsx } from "clsx";

/* ═══════════════════════════════════════════════════════
   Skeleton — shimmer loading placeholder
   ═══════════════════════════════════════════════════════ */

export interface SkeletonProps {
  className?: string;
  shape?: "rect" | "circle" | "line";
  count?: number;
}

export function Skeleton({ className, shape = "rect", count = 1 }: SkeletonProps) {
  const items = Array.from({ length: count });
  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={clsx(
            "fms-shimmer",
            shape === "circle" && "rounded-full",
            shape === "rect" && "rounded-card",
            shape === "line" && "rounded-md h-3",
            className
          )}
        />
      ))}
    </>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-card border border-line bg-paper p-3">
      <Skeleton className="aspect-square mb-2.5" />
      <Skeleton shape="line" className="w-3/4 mb-1.5" />
      <Skeleton shape="line" className="w-1/2 mb-2" />
      <div className="flex items-center justify-between">
        <Skeleton shape="line" className="w-16 h-4" />
        <Skeleton shape="line" className="w-12" />
      </div>
    </div>
  );
}
