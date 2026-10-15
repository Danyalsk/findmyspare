"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { bizApi, taxonomyApi, type ImportRow } from "@/lib/api/v3";
import { Field } from "@/components/shop/ui";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { useBiz } from "@/components/biz/BizShell";
import { parseCsv, toCsv } from "@/components/biz/csv";
import { BI, ErrorCard, Page, PageHead, SellerOnly, btnGhost, btnPrimary, useApi } from "@/components/biz/kit";

type Key = keyof ImportRow;
const FIELDS: { key: Key; label: string; required?: boolean; syn: string[] }[] = [
  { key: "name", label: "Item name", required: true, syn: ["name", "item", "itemname", "product", "productname", "description", "partname", "title"] },
  { key: "price", label: "Selling price", required: true, syn: ["price", "rate", "sellingprice", "saleprice", "sp", "dealerprice", "tradeprice"] },
  { key: "partNumber", label: "Part number", syn: ["partnumber", "partno", "pn", "sku", "code", "itemcode", "oem", "oemno"] },
  { key: "brand", label: "Brand", syn: ["brand", "make", "manufacturer", "company", "mfr"] },
  { key: "category", label: "Category", syn: ["category", "group", "type", "subcategory"] },
  { key: "industry", label: "Industry", syn: ["industry", "segment", "sector"] },
  { key: "machineType", label: "Machine type", syn: ["machinetype", "machine", "equipment", "application"] },
  { key: "mrp", label: "MRP", syn: ["mrp", "listprice", "maxretailprice"] },
  { key: "stock", label: "Stock qty", syn: ["stock", "qty", "quantity", "stockqty", "onhand", "available", "closingstock"] },
  { key: "moq", label: "Min order qty", syn: ["moq", "minqty", "minimumorder", "minorder", "minorderqty"] },
  { key: "fitsBrand", label: "Fits brand", syn: ["fitsbrand", "vehiclemake", "fitsmake", "compatiblebrand"] },
  { key: "fitsModel", label: "Fits model", syn: ["fitsmodel", "vehiclemodel", "model", "compatiblemodel"] },
];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const TEMPLATE = [
  FIELDS.map((f) => f.key),
  ["Brake pad set (front)", "1450", "Bosch", "0986AB1234", "Brakes", "automotive", "car", "1890", "24", "2", "Maruti Suzuki", "Swift"],
  ["Mechanical seal 25mm", "320", "Kirloskar", "KS-MS25", "Seals", "pumps", "", "420", "60", "5", "", ""],
];

function autoMap(header: string[]): Record<Key, number> {
  const m = {} as Record<Key, number>;
  const used = new Set<number>();
  for (const f of FIELDS) {
    const idx = header.findIndex((h, i) => !used.has(i) && (norm(h) === norm(f.key) || f.syn.includes(norm(h))));
    m[f.key] = idx;
    if (idx >= 0) used.add(idx);
  }
  return m;
}

export default function ImportPage() {
  const { isSeller, reload: reloadBiz } = useBiz();
  const tax = useApi(isSeller ? "taxonomy" : null, () => taxonomyApi.get());
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [map, setMap] = useState<Record<Key, number> | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ created: number; updated: number; errors: string[] } | null>(null);

  const parsed = useMemo(() => (text.trim() ? parseCsv(text) : []), [text]);
  const header = parsed[0] ?? [];
  const body = parsed.slice(1);
  const mapping = map ?? autoMap(header);

  const indSlug = useMemo(() => {
    const m = new Map<string, string>();
    for (const i of tax.data?.industries ?? []) { m.set(norm(i.slug), i.slug); m.set(norm(i.name), i.slug); }
    return m;
  }, [tax.data]);

  const rows: ImportRow[] = body.map((r) => {
    const o: Record<string, string> = {};
    for (const f of FIELDS) {
      const idx = mapping[f.key];
      const v = idx >= 0 ? (r[idx] ?? "").trim() : "";
      if (!v) continue;
      if (f.key === "industry") o.industry = indSlug.get(norm(v)) ?? v;
      else if (["price", "mrp"].includes(f.key)) o[f.key] = v.replace(/[₹,\s]/g, "");
      else if (["stock", "moq"].includes(f.key)) o[f.key] = v.replace(/[,\s]/g, "");
      else o[f.key] = v;
    }
    return o as unknown as ImportRow;
  });

  const invalid = rows.filter((r) => !r.name || !(parseFloat(String(r.price)) >= 0)).length;
  const unknownInd = tax.data ? rows.filter((r) => r.industry && !tax.data!.industries.some((i) => i.slug === r.industry)).length : 0;
  const missingRequired = FIELDS.filter((f) => f.required && mapping[f.key] < 0);

  if (!isSeller) return <Page><PageHead title="Import catalog" back="/biz/more" /><SellerOnly what="Catalog import" /></Page>;

  function onFile(f: File | undefined) {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error("That file is over 5 MB. Split it into smaller files."); return; }
    f.text().then((t) => { setText(t); setFileName(f.name); setMap(null); setResult(null); }).catch(() => toast.error("Couldn't read that file"));
  }

  function downloadTemplate() {
    const blob = new Blob([toCsv(TEMPLATE)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "findmyspare-catalog-template.csv"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function submit() {
    setBusy(true);
    const total = { created: 0, updated: 0, errors: [] as string[] };
    try {
      for (let start = 0; start < rows.length; start += 500) {
        const chunk = rows.slice(start, start + 500);
        const r = await bizApi.importRows(chunk);
        total.created += r.created; total.updated += r.updated;
        // Server numbers rows within the chunk (header = row 1); shift to file rows.
        total.errors.push(...r.errors.map((e) => e.replace(/^Row (\d+)/, (_, n) => `Row ${Number(n) + start}`)));
      }
      setResult(total);
      toast.success(`${total.created} added, ${total.updated} updated`);
      reloadBiz();
    } catch (e) {
      if (total.created || total.updated) setResult(total);
      toast.error(getErrorMessage(e, "Import stopped"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <PageHead title="Import catalog" sub="Bring your whole price list in one go. Same part number updates the existing listing." back="/biz/more" />

      <section className="card p-4 md:p-5 mb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <label className={clsx(btnPrimary, "cursor-pointer")}>
            <BI.upload size={18} /> Upload CSV
            <input type="file" accept=".csv,.tsv,.txt,text/csv" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
          <button onClick={downloadTemplate} className={btnGhost}><BI.download size={18} /> Template</button>
        </div>
        <p className="text-[12.5px] text-ink-3 font-semibold mb-3">From Excel or Tally: File › Save As › CSV. Or paste rows below with a header line.</p>
        <Field label={fileName ? `Loaded ${fileName}` : "Or paste CSV"}>
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setFileName(null); setMap(null); setResult(null); }}
            rows={6}
            spellCheck={false}
            placeholder={"name,price,partNumber,brand,stock\nOil filter,180,OF-1022,Purolator,40"}
            className="w-full px-4 py-3 rounded-[12px] bg-paper-2 border border-transparent text-[13px] font-mono text-ink placeholder:text-ink-4 focus:bg-paper focus:border-[color:var(--accent)] outline-none"
          />
        </Field>
      </section>

      {parsed.length > 0 && (
        <>
          <section className="card p-4 md:p-5 mb-4">
            <h2 className="text-[15px] font-extrabold mb-1">Match your columns</h2>
            <p className="text-[12.5px] text-ink-3 font-semibold mb-3">We guessed from your header. Fix anything that looks wrong.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {FIELDS.map((f) => (
                <label key={f.key} className="block min-w-0">
                  <span className="block text-[12px] font-bold text-ink-2 mb-1">{f.label}{f.required && <span className="text-[color:var(--accent)]"> *</span>}</span>
                  <select
                    value={mapping[f.key]}
                    onChange={(e) => setMap({ ...mapping, [f.key]: Number(e.target.value) })}
                    className={clsx("w-full h-10 px-2.5 rounded-[10px] text-[13px] font-bold outline-none border", f.required && mapping[f.key] < 0 ? "border-[color:var(--danger)] bg-[color:var(--danger-wash)]" : "border-transparent bg-paper-2")}
                  >
                    <option value={-1}>Not in file</option>
                    {header.map((h, i) => <option key={i} value={i}>{h || `Column ${i + 1}`}</option>)}
                  </select>
                </label>
              ))}
            </div>
          </section>

          <section className="card p-4 md:p-5 mb-4 min-w-0">
            <div className="flex items-end justify-between mb-2 gap-2">
              <h2 className="text-[15px] font-extrabold">Preview</h2>
              <span className="text-[12.5px] text-ink-3 font-semibold">{body.length} row{body.length === 1 ? "" : "s"}{invalid ? ` · ${invalid} missing name or price` : ""}</span>
            </div>
            <div className="overflow-x-auto -mx-4 md:-mx-5 px-4 md:px-5">
              <table className="text-[12.5px] min-w-full">
                <thead>
                  <tr className="text-left text-ink-3">{FIELDS.filter((f) => mapping[f.key] >= 0).map((f) => <th key={f.key} className="py-1.5 pr-4 font-extrabold whitespace-nowrap">{f.label}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.slice(0, 6).map((r, i) => (
                    <tr key={i} className={clsx(!r.name || !(parseFloat(String(r.price)) >= 0) ? "bg-[color:var(--danger-wash)]" : "")}>
                      {FIELDS.filter((f) => mapping[f.key] >= 0).map((f) => <td key={f.key} className="py-1.5 pr-4 font-semibold whitespace-nowrap max-w-[220px] truncate">{String(r[f.key] ?? "")}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > 6 && <div className="text-[12px] text-ink-4 font-semibold mt-2">…and {rows.length - 6} more</div>}
            {unknownInd > 0 && <p className="text-[12.5px] text-[color:var(--amber)] font-bold mt-2">{unknownInd} row{unknownInd === 1 ? " has" : "s have"} an industry we don&apos;t know; they&apos;ll be filed under Automotive. Use: {tax.data?.industries.map((i) => i.slug).join(", ")}.</p>}
          </section>

          {missingRequired.length > 0 ? (
            <ErrorCard message={`Match a column for ${missingRequired.map((f) => f.label).join(" and ")} to continue.`} />
          ) : (
            <button onClick={submit} disabled={busy || !rows.length} className={clsx(btnPrimary, "w-full")}>
              {busy ? "Importing…" : `Import ${rows.length} item${rows.length === 1 ? "" : "s"}`}
            </button>
          )}
        </>
      )}

      {result && (
        <section className="card p-4 md:p-5 mt-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-[14px] bg-[color:var(--success-wash)] p-3"><div className="text-[22px] font-extrabold text-[color:var(--success)]">{result.created}</div><div className="text-[12px] font-bold text-ink-3">Added</div></div>
            <div className="rounded-[14px] bg-[color:var(--info-wash)] p-3"><div className="text-[22px] font-extrabold text-[color:var(--info)]">{result.updated}</div><div className="text-[12px] font-bold text-ink-3">Updated</div></div>
            <div className={clsx("rounded-[14px] p-3", result.errors.length ? "bg-[color:var(--danger-wash)]" : "bg-paper-2")}><div className={clsx("text-[22px] font-extrabold", result.errors.length && "text-[color:var(--danger)]")}>{result.errors.length}</div><div className="text-[12px] font-bold text-ink-3">Skipped</div></div>
          </div>
          {result.errors.length > 0 && (
            <ul className="mt-3 text-[12.5px] text-[color:var(--danger)] font-semibold space-y-0.5 max-h-48 overflow-y-auto">{result.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/supplier/inventory" className="text-[14px] font-extrabold text-[color:var(--accent)]">See my listings</Link>
          </div>
        </section>
      )}
    </Page>
  );
}
