import { clsx } from "clsx";

/* Vehicles carry a number plate; every other machine (pump, AC, genset…) is
   identified by its serial number. The backend sends regNoDisplay as either a
   formatted plate ("MH 12 AB 3456") or "S/N KG123" / "Machine". */

/** True when this identifier is a real number plate. Pass regNo when known
 *  (null/"" means plate-less); otherwise it's inferred from the display text. */
export function hasPlate(display: string | null | undefined, regNo?: string | null) {
  if (regNo !== undefined) return !!regNo;
  return !!display && !/^S\/N\s/i.test(display) && display !== "Machine";
}

/** Number plate for vehicles, neutral serial chip for any other machine. */
export function MachineId({ display, regNo, className, size = 12 }: { display: string | null | undefined; regNo?: string | null; className?: string; size?: number }) {
  if (hasPlate(display, regNo)) return <span className={clsx("reg-plate", className)} style={{ fontSize: size }}>{display}</span>;
  const serial = display && /^S\/N\s/i.test(display) ? display.replace(/^S\/N\s*/i, "") : null;
  return (
    <span
      className={clsx("inline-flex items-center gap-1.5 rounded-[8px] border border-line-2 bg-paper-2 text-ink-2 px-2 py-[3px] font-bold whitespace-nowrap", className)}
      style={{ fontSize: size }}
    >
      <span className="text-[9px] font-extrabold tracking-wider uppercase text-ink-3">{serial ? "S/N" : "Machine"}</span>
      {serial && <span className="mono">{serial}</span>}
    </span>
  );
}
