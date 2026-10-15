/* Plain HTML/CSS horizontal bars for the admin network console.
   One series → one colour, values labelled directly, recessive track. */

export type BarRow = { key: string; label: React.ReactNode; value: number; display?: string; hint?: string };

export function NetBars({ rows, empty = "No data yet", unit }: { rows: BarRow[]; empty?: string; unit?: string }) {
  if (!rows.length) return <div className="py-6 text-center text-[13px] text-ink-3">{empty}</div>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.key} title={r.hint ?? `${typeof r.label === "string" ? r.label : r.key}: ${r.display ?? r.value}${unit ? ` ${unit}` : ""}`} className="group">
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="font-semibold text-ink-2 min-w-0 truncate">{r.label}</span>
            <span className="font-extrabold text-ink tabular-nums">{r.display ?? r.value.toLocaleString("en-IN")}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-paper-2 overflow-hidden" aria-hidden>
            <div
              className="h-full rounded-full bg-[color:var(--accent)] opacity-85 group-hover:opacity-100 transition-opacity"
              style={{ width: `${Math.max((r.value / max) * 100, r.value > 0 ? 2 : 0)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Kpi({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="card p-4 min-w-0">
      <div className="text-[12px] font-bold text-ink-3">{label}</div>
      <div className="text-[22px] font-extrabold tracking-tight mt-0.5 tabular-nums truncate">{value}</div>
      {sub && <div className="text-[11.5px] text-ink-3 font-semibold truncate">{sub}</div>}
    </div>
  );
}

/** Admin page header in the FindMySpare console style. */
export function AdminHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 flex-wrap mb-5">
      <div className="min-w-0">
        <h1 className="text-[26px] md:text-[28px] font-extrabold tracking-tight leading-tight">{title}</h1>
        {sub && <p className="text-[13.5px] text-ink-3 mt-1 max-w-[640px]">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
