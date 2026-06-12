"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PublicNav } from "@/components/layout/PublicNav";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import {
  CheckIcon,
  ShieldIcon,
  StarIcon,
  ChatIcon,
  PackageIcon,
  TruckIcon,
  BoltIcon,
  ArrowRightIcon,
} from "@/lib/icons";
import { toast } from "@/lib/toast";
import { productsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useCartStore } from "@/lib/cart-store";
import { buildWhatsAppLink, waTemplates } from "@/lib/whatsapp";
import type { ProductDetail } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";

export default function PublicProductDetail() {
  const { id } = useParams<{ id: string }>();
  const buyer = useAuthStore((s) => s.user);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await productsApi.get(id);
        if (!cancelled) setProduct(res.product);
      } catch (e: unknown) {
        if (!cancelled) setError(getErrorMessage(e, "Failed to load product"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const specs = useMemo(() => Object.entries(product?.specifications || {}), [product]);
  const price = parseFloat(product?.price || "0");

  function addToCart(goToCart = false) {
    if (!product) return;
    if (!buyer) {
      router.push("/login");
      return;
    }
    if (buyer.role !== "buyer") {
      toast.error("Switch to a buyer account to purchase");
      return;
    }
    // Backend allows one supplier per order (Phase 1) — enforce on the client too.
    const existingSupplier = cartItems[0]?.supplierId;
    if (existingSupplier && existingSupplier !== product.supplierId) {
      toast.error("Your cart has items from another supplier. Clear it first.");
      return;
    }
    const firstVeh = product.compatibleVehicles?.[0];
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      vehicle: firstVeh ? `${firstVeh.make} ${firstVeh.model}${firstVeh.year ? " " + firstVeh.year : ""}` : "",
      condition: "oem",
      quantity: 1,
      unitPrice: price,
      supplierId: product.supplierId,
      supplierName: product.supplierBusinessName || product.supplierName || "Supplier",
    });
    if (goToCart) router.push("/buyer/cart");
    else toast.success("Added to cart");
  }

  function handleContact() {
    if (!product) return;
    if (!product.supplierPhone) {
      toast.error("Supplier phone unavailable");
      return;
    }
    const firstVeh = product.compatibleVehicles?.[0];
    const vehicle = firstVeh
      ? `${firstVeh.make} ${firstVeh.model}${firstVeh.year ? " " + firstVeh.year : ""}`
      : null;
    const msg = waTemplates.productEnquiry({
      buyerName: buyer?.name || "a customer",
      productName: product.name,
      partNumber: product.partNumber,
      vehicle,
    });
    const url = buildWhatsAppLink(product.supplierPhone, msg);
    if (!url) {
      toast.error("Supplier phone is invalid — try messaging instead");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper-3 flex flex-col">
        <PublicNav />
        <div className="max-w-7xl mx-auto w-full px-5 py-8 grid md:grid-cols-2 gap-8">
          <div className="aspect-square rounded-[20px] fms-shimmer" />
          <div className="space-y-3">
            <div className="h-6 w-32 rounded fms-shimmer" />
            <div className="h-10 w-3/4 rounded fms-shimmer" />
            <div className="h-24 rounded-[14px] fms-shimmer" />
            <div className="h-12 rounded-full fms-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-paper-3 flex flex-col">
        <PublicNav />
        <div className="px-5 pt-16 text-center">
          <div className="text-[13px] font-medium text-[color:var(--danger)] mb-4">
            {error || "Product not found"}
          </div>
          <Link href="/search">
            <Button variant="primary" size="md">Back to browse</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [];
  const inStock = product.stockQuantity > 0;

  return (
    <div className="min-h-screen bg-paper-3 flex flex-col pb-28 md:pb-0">
      <PublicNav />

      <div className="max-w-7xl mx-auto w-full px-5 py-6 grid md:grid-cols-2 gap-8">
        {/* ── Gallery ─────────────────────────────────── */}
        <div>
          <div className="rounded-[20px] overflow-hidden aspect-square relative bg-paper shadow-[var(--shadow-card)]">
            {images[activeImg] ? (
              <Image
                src={images[activeImg]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                className="object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background:
                    "repeating-linear-gradient(135deg, var(--paper-2) 0 6px, var(--paper-3) 6px 12px)",
                }}
              >
                <PackageIcon size={48} className="text-ink-3 opacity-40" />
              </div>
            )}
            {/* Rating + stock overlays */}
            <div className="absolute top-3 left-3 flex gap-2">
              <Chip variant="rating" size="md">
                <StarIcon size={11} className="fill-current" /> 4.5 (12)
              </Chip>
            </div>
            <div className="absolute top-3 right-3">
              <Chip variant={inStock ? "ok" : "danger"} size="md" dot>
                {inStock ? "In stock" : "Out of stock"}
              </Chip>
            </div>
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2 mt-3">
              {images.slice(0, 5).map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  className={`relative aspect-square rounded-[10px] overflow-hidden transition-all ${
                    i === activeImg
                      ? "ring-2 ring-[color:var(--accent)]"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Details ─────────────────────────────────── */}
        <div>
          <div className="text-[11px] font-bold text-[color:var(--accent-ink)] tracking-wider uppercase">
            {product.category || "PART"} {product.partNumber && `· ${product.partNumber}`}
          </div>
          <h1 className="display text-[32px] sm:text-[40px] leading-[1.05] mt-2 text-ink">
            {product.name}
          </h1>

          {/* Trust chips row */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Chip variant="ok" size="md" dot>
              <CheckIcon size={11} /> Genuine
            </Chip>
            {inStock && (
              <Chip variant="default" size="md">
                {product.stockQuantity} in stock
              </Chip>
            )}
            {product.warrantyInfo && (
              <Chip variant="accent" size="md">
                <ShieldIcon size={11} /> {product.warrantyInfo.split(" ").slice(0, 2).join(" ")}
              </Chip>
            )}
          </div>

          {/* Price */}
          <div className="mt-6 flex items-baseline gap-2">
            <span className="display text-[42px] text-ink leading-none">
              ₹{price.toLocaleString("en-IN")}
            </span>
            <span className="text-[12px] font-bold text-ink-3">incl. GST</span>
          </div>

          {/* Delivery / verification highlight */}
          <Card variant="accent" className="!p-4 mt-5 !rounded-[16px]">
            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-full bg-paper flex items-center justify-center text-[color:var(--accent-ink)] flex-shrink-0">
                <ShieldIcon size={18} />
              </div>
              <div className="text-[13px] min-w-0">
                <div className="font-bold text-ink">GST-verified supplier</div>
                <div className="text-ink-2 leading-snug mt-0.5">
                  Reviewed by FindMySpare admin · Direct WhatsApp contact · 7-day return
                </div>
              </div>
            </div>
          </Card>

          {/* Supplier row */}
          <div className="mt-4 p-4 rounded-[16px] bg-paper shadow-[var(--shadow-card)] flex items-center gap-3">
            <Avatar
              initials={(product.supplierBusinessName || product.supplierName || "SP")
                .slice(0, 2)
                .toUpperCase()}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <div className="display text-[15px] text-ink truncate">
                {product.supplierBusinessName || product.supplierName || "Supplier"}
              </div>
              <div className="text-[11px] text-ink-3 mt-0.5 flex items-center gap-1.5">
                <Chip variant="rating" size="sm">
                  <StarIcon size={9} className="fill-current" /> 4.7
                </Chip>
                <span>Verified supplier · 2yr on platform</span>
              </div>
            </div>
            {buyer?.role === "buyer" && (
              <button
                onClick={() => router.push(`/messages/${product.supplierId}`)}
                className="w-10 h-10 rounded-full bg-accent-wash text-[color:var(--accent-ink)] flex items-center justify-center fms-press"
                aria-label="Message supplier"
              >
                <ChatIcon size={18} />
              </button>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-6">
              <div className="text-[11px] font-bold text-[color:var(--accent-ink)] tracking-wider uppercase">
                About this part
              </div>
              <p className="text-[14px] mt-2 leading-relaxed text-ink-2 whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          {/* Compatible vehicles */}
          {product.compatibleVehicles && product.compatibleVehicles.length > 0 && (
            <div className="mt-6">
              <div className="text-[11px] font-bold text-[color:var(--accent-ink)] tracking-wider uppercase">
                Compatible vehicles
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {product.compatibleVehicles.map((v, i) => (
                  <Chip key={i} variant="default" size="md">
                    {v.make} {v.model}
                    {v.year ? ` · ${v.year}` : ""}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* Specifications */}
          {specs.length > 0 && (
            <div className="mt-6">
              <div className="text-[11px] font-bold text-[color:var(--accent-ink)] tracking-wider uppercase">
                Specifications
              </div>
              <div className="mt-3 rounded-[16px] bg-paper shadow-[var(--shadow-card)] overflow-hidden">
                {specs.map(([k, v], i) => (
                  <div
                    key={k}
                    className={`flex justify-between items-center py-3 px-4 text-[13px] ${
                      i < specs.length - 1 ? "border-b border-line" : ""
                    }`}
                  >
                    <span className="text-ink-3 font-semibold">{k}</span>
                    <span className="font-bold text-ink">{v as React.ReactNode}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust strip */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            <MiniTrust icon={<ShieldIcon size={16} />} label="Verified" />
            <MiniTrust icon={<TruckIcon size={16} />} label="Pan-India" />
            <MiniTrust icon={<BoltIcon size={16} />} label="Fast support" />
          </div>

          {!buyer && (
            <div className="mt-5 text-[12px] text-ink-3 text-center">
              Want to track requests and quotes?{" "}
              <Link href="/login" className="text-[color:var(--accent-ink)] font-bold hover:underline">
                Sign in
              </Link>
            </div>
          )}

          {/* Inline (desktop) primary CTAs — sticky version below for mobile */}
          <div className="mt-6 hidden md:flex flex-col gap-2.5">
            {buyer?.role === "buyer" && inStock && (
              <div className="flex gap-2.5">
                <Button variant="accent" block size="lg" onClick={() => addToCart(true)} rightIcon={<ArrowRightIcon size={16} />}>
                  Buy now
                </Button>
                <Button variant="ghost" size="lg" onClick={() => addToCart(false)}>
                  Add to cart
                </Button>
              </div>
            )}
            <div className="flex gap-2.5">
              <Button
                variant="primary"
                block
                size="lg"
                onClick={handleContact}
                disabled={!product.supplierPhone}
                rightIcon={<ArrowRightIcon size={16} />}
              >
                Contact supplier on WhatsApp
              </Button>
              {buyer?.role === "buyer" && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => router.push(`/messages/${product.supplierId}`)}
                >
                  Message
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky bottom CTA (mobile) — marketplace hallmark ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper/95 backdrop-blur-xl shadow-[var(--shadow-sticky)] pb-[max(env(safe-area-inset-bottom),12px)] pt-3 px-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="text-[10px] font-bold text-ink-3 uppercase tracking-wider">Price</div>
            <div className="display text-[22px] text-ink leading-none">
              ₹{price.toLocaleString("en-IN")}
            </div>
          </div>
          {buyer?.role === "buyer" && inStock ? (
            <Button
              variant="accent"
              size="lg"
              className="flex-1"
              onClick={() => addToCart(true)}
              rightIcon={<ArrowRightIcon size={16} />}
            >
              Buy now
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleContact}
              disabled={!product.supplierPhone}
              rightIcon={<ArrowRightIcon size={16} />}
            >
              Contact on WhatsApp
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniTrust({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-2.5 rounded-[12px] bg-paper shadow-[var(--shadow-sm)]">
      <span className="text-[color:var(--accent-ink)]">{icon}</span>
      <span className="text-[11px] font-bold text-ink">{label}</span>
    </div>
  );
}
