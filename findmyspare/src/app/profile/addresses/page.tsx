"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { addressesApi } from "@/lib/api";
import type { Address } from "@/lib/types";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

const fieldClass =
  "w-full h-11 px-3.5 rounded-[12px] bg-paper-2 border border-line text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all";
const labelClass = "block text-xs font-medium text-ink-3 mb-1.5 mono tracking-[0.06em] uppercase";

const empty = { label: "", line1: "", line2: "", city: "", state: "", postalCode: "", phone: "" };

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const res = await addressesApi.list();
      setAddresses(res.addresses);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to load addresses"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!form.line1 || !form.city || !form.state || !form.postalCode) {
      toast.error("Fill address, city, state and PIN");
      return;
    }
    setSaving(true);
    try {
      await addressesApi.create({
        label: form.label || undefined,
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        phone: form.phone || undefined,
        isDefault: addresses.length === 0,
      });
      setForm(empty);
      setAdding(false);
      toast.success("Address saved");
      load();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to save"));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this address?")) return;
    try {
      await addressesApi.remove(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to delete"));
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Saved addresses" backHref="/profile" />
      <div className="px-5 pb-12 max-w-xl w-full mx-auto space-y-3">
        {loading ? (
          <div className="text-[13px] text-ink-3 text-center py-12">Loading…</div>
        ) : (
          <>
            {addresses.map((a) => (
              <Card key={a.id} className="!p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[13px] font-medium">{a.label || a.line1}</div>
                  <div className="text-[11px] text-ink-3 mt-0.5">
                    {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.postalCode}
                  </div>
                </div>
                <button onClick={() => remove(a.id)} className="text-[12px] font-bold text-danger shrink-0">Delete</button>
              </Card>
            ))}

            {adding ? (
              <Card className="!p-4 space-y-3">
                <div>
                  <label className={labelClass}>Label (optional)</label>
                  <input className={fieldClass} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Home, Shop…" />
                </div>
                <div>
                  <label className={labelClass}>Address line 1</label>
                  <input className={fieldClass} value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Address line 2 (optional)</label>
                  <input className={fieldClass} value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>City</label>
                    <input className={fieldClass} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>State</label>
                    <input className={fieldClass} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>PIN code</label>
                    <input className={fieldClass} value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input className={fieldClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="default" block onClick={() => setAdding(false)}>Cancel</Button>
                  <Button variant="primary" block onClick={save} loading={saving}>Save address</Button>
                </div>
              </Card>
            ) : (
              <Button variant="default" dashed block onClick={() => setAdding(true)}>+ Add new address</Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
