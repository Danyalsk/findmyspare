"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { taxonomyApi, type Industry } from "@/lib/api/v3";
import { IconTile } from "@/components/net/NetIcon";
import { Skel } from "@/components/shop/ui";

/** Loads the live taxonomy once (cached by taxonomyApi). */
export function useIndustries() {
  const [list, setList] = useState<Industry[] | null>(null);
  useEffect(() => {
    let live = true;
    taxonomyApi.get().then((t) => live && setList(t.industries)).catch(() => live && setList([]));
    return () => { live = false; };
  }, []);
  return list;
}

/** IconTile grid of industries. Multi-select by default; `single` for a one-pick. */
export function IndustryPicker({ industries, value, onChange, single, label = "Industries" }: {
  industries: Industry[] | null; value: string[]; onChange: (v: string[]) => void; single?: boolean; label?: string;
}) {
  if (!industries) return <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">{Array.from({ length: 5 }, (_, i) => <Skel key={i} className="h-[92px]" />)}</div>;
  const toggle = (slug: string) => {
    if (single) return onChange([slug]);
    onChange(value.includes(slug) ? value.filter((s) => s !== slug) : [...value, slug]);
  };
  return (
    <div role={single ? "radiogroup" : "group"} aria-label={label} className="grid grid-cols-3 sm:grid-cols-5 gap-2">
      {industries.map((i) => {
        const on = value.includes(i.slug);
        return (
          <button
            key={i.slug}
            type="button"
            role={single ? "radio" : "checkbox"}
            aria-checked={on}
            onClick={() => toggle(i.slug)}
            className={clsx(
              "relative rounded-[16px] border p-2.5 pt-3 flex flex-col items-center gap-1.5 text-center fms-press transition-colors",
              on ? "border-[color:var(--accent)] bg-[color:var(--accent-wash)]" : "border-line bg-paper hover:bg-paper-2",
            )}
          >
            <IconTile name={i.icon} tint={i.tint} ink={i.ink} size={44} />
            <span className="text-[12px] font-extrabold leading-tight text-ink line-clamp-2">{i.name}</span>
            {on && (
              <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[color:var(--accent)] text-white flex items-center justify-center" aria-hidden>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4"><path d="m5 12 5 5L20 7" /></svg>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
