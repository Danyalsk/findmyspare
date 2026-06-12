"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { Card } from "@/components/ui/Card";
import { getErrorMessage } from "@/lib/errors";

type Row = Awaited<ReturnType<typeof adminApi.auditLog>>["items"][number];

export default function AuditLogPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [action, setAction] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.auditLog({ action: action || undefined, limit: 100 });
      setRows(res.items);
    } catch (e) {
      setError(getErrorMessage(e, "Could not load audit log"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action]);

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Audit log</h1>
          <p className="text-[13px] text-ink-3 mt-0.5">
            Every admin and super-admin mutation. Append-only.
          </p>
        </div>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="h-10 px-3 rounded-[10px] border border-line bg-paper text-[13px]"
        >
          <option value="">All actions</option>
          <option value="supplier_approve">supplier_approve</option>
          <option value="supplier_reject">supplier_reject</option>
          <option value="supplier_request_info">supplier_request_info</option>
          <option value="user_ban">user_ban</option>
          <option value="user_unban">user_unban</option>
          <option value="user_delete">user_delete</option>
          <option value="user_impersonate">user_impersonate</option>
          <option value="flag_action">flag_action</option>
          <option value="config_update">config_update</option>
        </select>
      </div>

      {error && (
        <Card variant="accent" className="!p-3 mb-4 !bg-danger-wash !border-transparent">
          <span className="text-sm text-[oklch(0.45_0.15_25)]">{error}</span>
        </Card>
      )}

      {loading ? (
        <div className="text-[13px] text-ink-3">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-[13px] text-ink-3">No audit entries match.</div>
      ) : (
        <div className="bg-paper rounded-[14px] border border-line overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-paper-2 text-left">
              <tr className="text-ink-3 text-[11px] mono tracking-wider uppercase">
                <th className="px-4 py-2.5">When</th>
                <th className="px-4 py-2.5">Actor</th>
                <th className="px-4 py-2.5">Action</th>
                <th className="px-4 py-2.5">Target</th>
                <th className="px-4 py-2.5">IP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <>
                  <tr
                    key={r.id}
                    onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                    className="border-t border-line hover:bg-paper-2 cursor-pointer"
                  >
                    <td className="px-4 py-2.5 mono text-[11px] text-ink-3">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-ink">{r.actorName || "—"}</div>
                      <div className="text-[11px] text-ink-3">{r.actorEmail}</div>
                    </td>
                    <td className="px-4 py-2.5 mono">{r.action}</td>
                    <td className="px-4 py-2.5 mono text-[11px]">
                      {r.targetType}/{r.targetId?.slice(0, 8) ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-ink-3 text-[11px]">{r.ipAddress || "—"}</td>
                  </tr>
                  {expanded === r.id && (
                    <tr key={`${r.id}-meta`} className="bg-paper-2">
                      <td colSpan={5} className="px-4 py-3">
                        <pre className="text-[11px] mono text-ink-2 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(
                            { metadata: r.metadata, userAgent: r.userAgent },
                            null,
                            2
                          )}
                        </pre>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
