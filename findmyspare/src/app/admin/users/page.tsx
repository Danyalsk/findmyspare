"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ArrowRightIcon, SearchIcon } from "@/lib/icons";
import { adminApi } from "@/lib/api/admin";
import type { AdminUserRow, Role } from "@/lib/types";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

const ROLE_FILTERS: Array<{ label: string; value: Role | "all" }> = [
  { label: "All", value: "all" },
  { label: "Buyers", value: "buyer" },
  { label: "Suppliers", value: "supplier" },
  { label: "Admins", value: "admin" },
];

function UsersContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const initialRole = (sp.get("role") as Role | null) || "all";
  const initialSearch = sp.get("q") || "";

  const [role, setRole] = useState<Role | "all">(initialRole as Role | "all");
  const [query, setQuery] = useState(initialSearch);
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.listUsers({
        role: role === "all" ? undefined : role,
        search: query.trim() || undefined,
      });
      setRows(res.users);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to load"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    const params = new URLSearchParams();
    if (role !== "all") params.set("role", role);
    if (q) params.set("q", q);
    router.replace(`/admin/users${params.toString() ? `?${params.toString()}` : ""}`);
    load();
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="All users" backHref="/admin" />
      <div className="px-5 pb-12 max-w-5xl w-full mx-auto space-y-4">
        <form onSubmit={onSearch}>
          <div className="h-11 rounded-[12px] bg-paper-2 border border-line flex items-center px-3 gap-2.5 focus-within:border-accent">
            <SearchIcon size={18} className="text-ink-3" />
            <input
              className="flex-1 bg-transparent outline-none text-sm"
              placeholder="Search by name, email, business…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </form>

        <div className="flex gap-2 flex-wrap">
          {ROLE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setRole(f.value)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                role === f.value
                  ? "bg-ink text-paper border-ink"
                  : "bg-paper-2 text-ink-2 border-line hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-[13px] text-ink-3 text-center py-12">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-[13px] text-ink-3 text-center py-12">No users in this view.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map((u) => (
              <Link key={u.id} href={`/admin/users/${u.id}`}>
                <Card className="!p-4 flex items-center gap-3 cursor-pointer hover:border-accent/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate">
                        {u.businessName || u.name}
                      </span>
                      {u.isBlocked && <Chip variant="danger">Blocked</Chip>}
                    </div>
                    <div className="text-[11px] text-ink-3 mt-0.5 truncate">
                      {u.email} {u.phone ? `· +91 ${u.phone}` : ""}
                    </div>
                  </div>
                  <Chip variant={u.role === "admin" ? "ok" : u.role === "supplier" ? "warn" : "default"}>
                    {u.role}
                  </Chip>
                  {u.role === "supplier" && u.verificationStatus && (
                    <Chip
                      variant={
                        u.verificationStatus === "approved" ? "ok" :
                        u.verificationStatus === "pending" ? "warn" :
                        u.verificationStatus === "rejected" ? "danger" : "default"
                      }
                    >
                      {u.verificationStatus}
                    </Chip>
                  )}
                  <ArrowRightIcon size={16} className="text-ink-3" />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="px-5 pt-16 text-center text-[13px] text-ink-3">Loading…</div>}>
      <UsersContent />
    </Suspense>
  );
}
