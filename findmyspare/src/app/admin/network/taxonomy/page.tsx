"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { clsx } from "clsx";
import { adminNetworkApi, taxonomyApi, type Industry } from "@/lib/api/v3";
import { Field, Sheet, Skel, inputCls } from "@/components/shop/ui";
import { IconTile, NetIcon } from "@/components/net/NetIcon";
import { AdminHead } from "@/components/admin/NetBars";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

const INDUSTRY_ICONS = ["car", "pump", "motor", "appliance", "power", "tractor", "gear", "excavator", "phone", "boat"];
const CATEGORY_ICONS = ["ac", "battery", "bearing", "belt", "blade", "body", "brake", "cable", "chip", "electrical", "engine", "fan", "filter", "gauge", "gear", "headlight", "heat", "interior", "motor", "oil", "panel", "plug", "pump", "seal", "solar", "suspension", "tool", "transmission", "tyre", "valve", "wiper"];

type Confirm = { kind: "type" | "category"; id: string; name: string; industry: string } | null;

function IconSelect({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 h-12 rounded-[12px] bg-paper-2 flex items-center justify-center text-ink-2 flex-shrink-0" aria-hidden><NetIcon name={value} size={22} /></span>
      <select aria-label={label} className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Toggle({ on, onChange, label, disabled }: { on: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={() => onChange(!on)}
      className={clsx("relative w-11 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-50", on ? "bg-[color:var(--accent)]" : "bg-line-2")}
    >
      <span className={clsx("absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform", on && "translate-x-5")} />
    </button>
  );
}

function IndustryCard({ i, open, onToggleOpen, onChanged, onAskDelete }: { i: Industry; open: boolean; onToggleOpen: () => void; onChanged: () => Promise<void>; onAskDelete: (c: NonNullable<Confirm>) => void }) {
  const [mt, setMt] = useState({ name: "", brands: "" });
  const [cat, setCat] = useState({ name: "", icon: "engine" });
  const [busy, setBusy] = useState("");

  const act = async (key: string, fn: () => Promise<unknown>, ok: string, after?: () => void) => {
    setBusy(key);
    try { await fn(); toast.success(ok); after?.(); await onChanged(); }
    catch (e) { toast.error(getErrorMessage(e, "Couldn't save")); }
    finally { setBusy(""); }
  };

  return (
    <li className={clsx("card overflow-hidden", !i.active && "opacity-75")}>
      <div className="p-4 flex items-center gap-3">
        <IconTile name={i.icon} tint={i.tint} ink={i.ink} size={48} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15.5px] font-extrabold tracking-tight">{i.name}</span>
            <span className="mono text-[11px] text-ink-3">{i.slug}</span>
            {!i.active && <span className="h-5 px-2 rounded-full bg-paper-2 text-ink-3 text-[11px] font-bold inline-flex items-center">Hidden</span>}
          </div>
          <div className="text-[12.5px] text-ink-3 font-semibold truncate">{i.tagline || "No tagline"}</div>
          <div className="text-[12px] text-ink-3 mt-0.5">{i.machineTypes.length} machine types · {i.categories.length} categories · {i.parts} parts · {i.sellers} sellers</div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Toggle on={i.active} disabled={busy === "active"} label={`${i.name} visible to buyers`} onChange={(v) => act("active", () => adminNetworkApi.updateIndustry(i.id, { active: v }), v ? `${i.name} is live` : `${i.name} hidden from buyers`)} />
          <button onClick={onToggleOpen} aria-expanded={open} className="text-[12.5px] font-extrabold text-[color:var(--accent)]">{open ? "Close" : "Edit"}</button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line grid md:grid-cols-2">
          {/* Machine types */}
          <div className="p-4 md:border-r border-line">
            <div className="text-[12px] font-extrabold uppercase tracking-wider text-ink-3 mb-2">Machine types</div>
            <ul className="space-y-2">
              {i.machineTypes.map((t) => (
                <li key={t.id} className="rounded-[12px] bg-paper-2 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13.5px] font-extrabold">{t.name}</span>
                    <button onClick={() => onAskDelete({ kind: "type", id: t.id, name: t.name, industry: i.name })} className="text-[12px] font-bold text-ink-3 hover:text-[color:var(--danger)]">Delete</button>
                  </div>
                  {t.brands.length > 0 && <div className="mt-1.5 flex flex-wrap gap-1">{t.brands.map((b) => <span key={b} className="h-6 px-2 rounded-full bg-paper border border-line text-[11.5px] font-bold inline-flex items-center">{b}</span>)}</div>}
                </li>
              ))}
              {!i.machineTypes.length && <li className="text-[13px] text-ink-3">None yet.</li>}
            </ul>
            <div className="mt-3 space-y-2">
              <Field label="New machine type"><input className={inputCls} value={mt.name} onChange={(e) => setMt({ ...mt, name: e.target.value })} placeholder="e.g. Submersible pump" /></Field>
              <Field label="Brands" hint="Comma-separated"><input className={inputCls} value={mt.brands} onChange={(e) => setMt({ ...mt, brands: e.target.value })} placeholder="Kirloskar, Crompton, CRI" /></Field>
              <button disabled={mt.name.trim().length < 2 || busy === "mt"} className="w-full h-11 rounded-[12px] bg-ink text-paper text-[13.5px] font-extrabold disabled:opacity-40 fms-press"
                onClick={() => act("mt", () => adminNetworkApi.addMachineType(i.id, { name: mt.name.trim(), brands: mt.brands.split(",").map((b) => b.trim()).filter(Boolean) }), `${mt.name.trim()} added to ${i.name}`, () => setMt({ name: "", brands: "" }))}>
                Add machine type
              </button>
            </div>
          </div>
          {/* Categories */}
          <div className="p-4 border-t md:border-t-0 border-line">
            <div className="text-[12px] font-extrabold uppercase tracking-wider text-ink-3 mb-2">Part categories</div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {i.categories.map((c) => (
                <li key={c.id} className="rounded-[12px] bg-paper-2 px-3 py-2 flex items-center gap-2">
                  <span className="text-ink-2"><NetIcon name={c.icon} size={18} /></span>
                  <span className="flex-1 min-w-0 text-[13px] font-bold truncate">{c.name}</span>
                  <button onClick={() => onAskDelete({ kind: "category", id: c.id, name: c.name, industry: i.name })} aria-label={`Delete ${c.name}`} className="text-[12px] font-bold text-ink-3 hover:text-[color:var(--danger)]">Delete</button>
                </li>
              ))}
              {!i.categories.length && <li className="text-[13px] text-ink-3">None yet.</li>}
            </ul>
            <div className="mt-3 space-y-2">
              <Field label="New category"><input className={inputCls} value={cat.name} onChange={(e) => setCat({ ...cat, name: e.target.value })} placeholder="e.g. Impellers" /></Field>
              <Field label="Icon" group><IconSelect label="Category icon" value={cat.icon} onChange={(icon) => setCat({ ...cat, icon })} options={CATEGORY_ICONS} /></Field>
              <button disabled={cat.name.trim().length < 2 || busy === "cat"} className="w-full h-11 rounded-[12px] bg-ink text-paper text-[13.5px] font-extrabold disabled:opacity-40 fms-press"
                onClick={() => act("cat", () => adminNetworkApi.addCategory(i.id, { name: cat.name.trim(), icon: cat.icon }), `${cat.name.trim()} added to ${i.name}`, () => setCat({ name: "", icon: "engine" }))}>
                Add category
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

export default function TaxonomyStudioPage() {
  const [list, setList] = useState<Industry[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [nf, setNf] = useState({ name: "", tagline: "", icon: "gear" });
  const [adding, setAdding] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [deleting, setDeleting] = useState(false);

  // Admin tree includes inactive industries; counts come from the public tree.
  const reload = useCallback(async () => {
    const [all, pub] = await Promise.all([adminNetworkApi.taxonomy(), taxonomyApi.refresh()]);
    const counts = new Map(pub.industries.map((i) => [i.id, i]));
    setList(all.industries.map((i) => ({ ...i, parts: counts.get(i.id)?.parts ?? 0, sellers: counts.get(i.id)?.sellers ?? 0 })));
  }, []);
  useEffect(() => { reload().catch((e) => { toast.error(getErrorMessage(e, "Couldn't load taxonomy")); setList([]); }); }, [reload]);

  async function addIndustry() {
    setAdding(true);
    try {
      const { industry } = await adminNetworkApi.addIndustry({ name: nf.name.trim(), tagline: nf.tagline.trim() || undefined, icon: nf.icon });
      toast.success(`${industry.name} is live. Add its machine types and categories.`);
      setNf({ name: "", tagline: "", icon: "gear" });
      await reload();
      setOpen(industry.id);
    } catch (e) { toast.error(getErrorMessage(e, "Couldn't add industry")); }
    finally { setAdding(false); }
  }

  async function doDelete() {
    if (!confirm) return;
    setDeleting(true);
    try {
      await (confirm.kind === "type" ? adminNetworkApi.removeMachineType(confirm.id) : adminNetworkApi.removeCategory(confirm.id));
      toast.success(`${confirm.name} deleted`);
      setConfirm(null);
      await reload();
    } catch (e) { toast.error(getErrorMessage(e, "Couldn't delete")); }
    finally { setDeleting(false); }
  }

  return (
    <div className="max-w-5xl w-full mx-auto pb-12">
      <Link href="/admin/network" className="text-[13px] font-bold text-ink-3">← Network</Link>
      <div className="mt-2"><AdminHead title="Taxonomy studio" sub="Industries, machine types and part categories that shape search, seller listings and Fix bookings." /></div>

      <div className="rounded-[16px] bg-[color:var(--info-wash)] text-[color:var(--info)] p-4 text-[13.5px] font-bold">
        Adding an industry is data, not a deploy. It shows up in search, seller onboarding and repair bookings straight away.
      </div>

      <section className="card p-5 mt-4" aria-labelledby="add-ind-h">
        <h2 id="add-ind-h" className="text-[16px] font-extrabold tracking-tight mb-3">Add an industry</h2>
        <div className="grid sm:grid-cols-[1fr_1.4fr_1fr] gap-3 items-end">
          <Field label="Name"><input className={inputCls} value={nf.name} onChange={(e) => setNf({ ...nf, name: e.target.value })} placeholder="e.g. Medical equipment" /></Field>
          <Field label="Tagline (optional)"><input className={inputCls} value={nf.tagline} onChange={(e) => setNf({ ...nf, tagline: e.target.value })} placeholder="Short line buyers see" /></Field>
          <Field label="Icon" group><IconSelect label="Industry icon" value={nf.icon} onChange={(icon) => setNf({ ...nf, icon })} options={INDUSTRY_ICONS} /></Field>
        </div>
        <button disabled={nf.name.trim().length < 2 || adding} onClick={addIndustry} className="mt-3 h-11 px-5 rounded-[12px] bg-[color:var(--accent)] text-white text-[13.5px] font-extrabold disabled:opacity-40 fms-press">{adding ? "Adding…" : "Add industry"}</button>
      </section>

      <h2 className="text-[16px] font-extrabold tracking-tight mt-6 mb-3">Industries {list && <span className="text-ink-3 font-bold text-[13px]">· {list.length}</span>}</h2>
      {!list ? <div className="space-y-3"><Skel className="h-20" /><Skel className="h-20" /><Skel className="h-20" /></div> : (
        <ul className="space-y-3">
          {list.map((i) => (
            <IndustryCard key={i.id} i={i} open={open === i.id} onToggleOpen={() => setOpen(open === i.id ? null : i.id)} onChanged={reload} onAskDelete={setConfirm} />
          ))}
        </ul>
      )}

      <Sheet open={!!confirm} onClose={() => setConfirm(null)} title={confirm?.kind === "type" ? "Delete machine type?" : "Delete category?"}>
        <p className="text-[14px] text-ink-2">
          <b>{confirm?.name}</b> will be removed from <b>{confirm?.industry}</b>. Existing listings keep their text, but buyers can no longer filter by it.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button onClick={() => setConfirm(null)} className="h-11 rounded-[12px] border border-line-2 text-[13.5px] font-extrabold">Cancel</button>
          <button disabled={deleting} onClick={doDelete} className="h-11 rounded-[12px] bg-[color:var(--danger)] text-white text-[13.5px] font-extrabold disabled:opacity-50">{deleting ? "Deleting…" : "Delete"}</button>
        </div>
      </Sheet>
    </div>
  );
}
