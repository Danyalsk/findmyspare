"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicNav } from "@/components/layout/PublicNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, LockIcon, ShieldIcon, BoltIcon, PackageIcon } from "@/lib/icons";
import { productsApi, bannersApi } from "@/lib/api";
import type { Banner, ProductSummary } from "@/lib/types";
import { formatPrice } from "@/lib/constants";

export default function PublicHome() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerIdx, setBannerIdx] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [prodRes, bannerRes] = await Promise.allSettled([
          productsApi.list({ limit: 12, sort: "newest" }),
          bannersApi.listActive(),
        ]);
        if (cancelled) return;
        if (prodRes.status === "fulfilled") setProducts(prodRes.value.products);
        if (bannerRes.status === "fulfilled") setBanners(bannerRes.value.banners);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setBannerIdx((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  const activeBanner = banners[bannerIdx];

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <PublicNav />

      {/* Hero / Banner */}
      <section className="border-b border-line bg-paper-3">
        <div className="max-w-7xl mx-auto px-5 py-8">
          {activeBanner ? (
            <Link
              href={activeBanner.ctaHref || "/search"}
              className="block rounded-[16px] overflow-hidden border border-line bg-paper relative group"
            >
              {activeBanner.imageUrl ? (
                <div className="aspect-[16/5] w-full overflow-hidden">
                  <img
                    src={activeBanner.imageUrl}
                    alt={activeBanner.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                  />
                </div>
              ) : (
                <div
                  className="aspect-[16/5] w-full"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--accent-wash) 0%, var(--paper-2) 100%)",
                  }}
                />
              )}
              <div className="absolute inset-0 flex items-end">
                <div className="p-5 sm:p-8 max-w-xl">
                  <div className="serif text-[28px] sm:text-[40px] leading-[1.05] text-ink">
                    {activeBanner.title}
                  </div>
                  {activeBanner.subtitle && (
                    <div className="text-sm text-ink-2 mt-2">{activeBanner.subtitle}</div>
                  )}
                  {activeBanner.ctaLabel && (
                    <div className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent-ink">
                      {activeBanner.ctaLabel} <ArrowRightIcon size={14} />
                    </div>
                  )}
                </div>
              </div>
              {banners.length > 1 && (
                <div className="absolute bottom-3 right-4 flex gap-1.5">
                  {banners.map((_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${i === bannerIdx ? "bg-ink" : "bg-line"}`}
                    />
                  ))}
                </div>
              )}
            </Link>
          ) : (
            <div className="rounded-[16px] border border-line bg-paper p-8 sm:p-14">
              <div className="mono text-[10px] text-ink-3 tracking-[0.12em] uppercase">
                Trusted auto parts marketplace
              </div>
              <h1 className="serif text-[40px] sm:text-[56px] leading-[1.05] mt-3 max-w-2xl">
                Find the{" "}
                <em className="not-italic italic text-accent-ink">exact part</em> for your car.
              </h1>
              <p className="text-ink-2 text-sm sm:text-base mt-3 max-w-lg">
                Browse from GST-verified suppliers across India. Direct WhatsApp contact, no middleman.
              </p>
              <div className="mt-6 flex gap-3 flex-wrap">
                <Link href="/search">
                  <Button variant="primary" size="lg">
                    Start browsing <ArrowRightIcon size={16} />
                  </Button>
                </Link>
                <Link href="/buyer/requests/new">
                  <Button variant="default" size="lg">
                    Post a request
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-line bg-paper">
        <div className="max-w-7xl mx-auto px-5 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-[12px]">
          <Trust icon={<ShieldIcon size={16} />} label="GST-verified suppliers" />
          <Trust icon={<BoltIcon size={16} />} label="Direct WhatsApp contact" />
          <Trust icon={<PackageIcon size={16} />} label="OEM, equivalent, used" />
          <Trust icon={<LockIcon size={16} />} label="Admin-reviewed listings" />
        </div>
      </section>

      {/* Featured */}
      <section className="flex-1">
        <div className="max-w-7xl mx-auto px-5 py-8">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="serif text-[28px]">Featured parts</h2>
            <Link href="/search" className="text-[13px] text-accent-ink hover:underline flex items-center gap-1">
              View all <ArrowRightIcon size={12} />
            </Link>
          </div>

          {products.length === 0 ? (
            <Card className="text-center !p-10">
              <div className="text-[14px] font-medium mb-1">No products yet</div>
              <div className="text-[12px] text-ink-3 mb-4">
                Be the first supplier to list parts.
              </div>
              <Link href="/register">
                <Button variant="primary">Become a supplier</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((p) => (
                <Link key={p.id} href={`/product/${p.id}`}>
                  <Card className="!p-3 cursor-pointer hover:border-accent/40 transition-colors group">
                    <div
                      className="aspect-square rounded-[10px] mb-2.5 overflow-hidden relative"
                      style={{
                        background:
                          "repeating-linear-gradient(135deg, var(--paper-2) 0 6px, var(--paper-3) 6px 12px)",
                      }}
                    >
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <span className="absolute left-2 bottom-2 mono text-[9px] text-ink-3 uppercase tracking-[0.08em] bg-paper px-1.5 py-0.5 rounded border border-line">
                          {(p.category || "PART").slice(0, 8)}
                        </span>
                      )}
                    </div>
                    <div className="text-[13px] font-medium leading-[1.25] line-clamp-2">{p.name}</div>
                    <div className="text-[11px] text-ink-3 mt-0.5">{p.supplierName || "Supplier"}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="mono text-[14px] font-semibold">
                        {formatPrice(parseFloat(p.price))}
                      </span>
                      <span className="text-[10px] text-ink-3">
                        {p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : "Out of stock"}
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Supplier CTA */}
      <section className="border-t border-line bg-ink text-paper">
        <div className="max-w-7xl mx-auto px-5 py-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.12em] opacity-70">
              For suppliers
            </div>
            <h3 className="serif text-[32px] sm:text-[40px] leading-[1.05] mt-2">
              Sell parts to{" "}
              <em className="not-italic italic text-accent">verified buyers</em> nationwide.
            </h3>
            <p className="opacity-80 mt-3 text-sm">
              GST verification, product CRUD, real-time enquiries, direct WhatsApp leads. No
              listing fees while we&apos;re in beta.
            </p>
          </div>
          <div className="flex gap-3 md:justify-end flex-wrap">
            <Link href="/register">
              <Button variant="accent" size="lg">
                Become a supplier <ArrowRightIcon size={16} />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="default"
                size="lg"
                className="!bg-transparent !border-paper/40 !text-paper hover:!bg-white/10"
              >
                Supplier login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line bg-paper-2">
        <div className="max-w-7xl mx-auto px-5 py-6 text-[11px] text-ink-3 flex flex-wrap items-center justify-between gap-3">
          <span className="mono tracking-[0.06em]">© FindMySpare · India</span>
          <span className="mono tracking-[0.06em]">SSL · TRUSTED MARKETPLACE</span>
        </div>
      </footer>
    </div>
  );
}

function Trust({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-accent-ink">{icon}</span>
      <span className="text-ink-2">{label}</span>
    </div>
  );
}
