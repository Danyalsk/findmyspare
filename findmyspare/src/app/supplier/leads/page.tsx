"use client";

import { useEffect, useMemo, useState } from "react";
import { SearchIcon } from "@/lib/icons";
import { InquiryListItem } from "@/components/features/InquiryListItem";
import { inquiriesApi } from "@/lib/api";
import type { Inquiry } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";
import { getSocket } from "@/lib/socket";
import { toast } from "@/lib/toast";

export default function SupplierLeadsPage() {
  const [search, setSearch] = useState("");
  const [leads, setLeads] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await inquiriesApi.listActive({ limit: 100 });
        if (!cancelled) setLeads(res.inquiries);
      } catch (err: unknown) {
        if (!cancelled) setError(getErrorMessage(err, "Failed to load inquiries"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();

    function onInquiryCreated(inq: Inquiry) {
      setLeads((prev) => (prev.some((l) => l.id === inq.id) ? prev : [inq, ...prev]));
      toast.success(`New inquiry: ${inq.partName}`);
    }

    socket.on("inquiry:created", onInquiryCreated);
    return () => {
      socket.off("inquiry:created", onInquiryCreated);
    };
  }, []);

  const filtered = useMemo(
    () =>
      leads.filter(
        (lead) =>
          lead.partName.toLowerCase().includes(search.toLowerCase()) ||
          lead.make.toLowerCase().includes(search.toLowerCase()) ||
          lead.model.toLowerCase().includes(search.toLowerCase())
      ),
    [leads, search]
  );

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-hidden">
      <div className="px-5 pt-5">
        <div className="serif text-[28px] leading-[1.05]">Leads</div>
        <div className="text-[11px] text-ink-3 mt-1">{filtered.length} open requests</div>
      </div>

      <div className="px-5 pt-4">
        <div className="flex items-center gap-2.5 bg-paper-2 border border-line rounded-[12px] px-3.5 h-11">
          <SearchIcon size={16} className="text-ink-3 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search part, make or model..."
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-ink-3"
          />
        </div>
      </div>

      <div className="px-5 pt-4 pb-5 flex flex-col gap-2.5">
        {loading ? (
          <div className="py-12 text-center text-[13px] text-ink-3">Loading leads...</div>
        ) : error ? (
          <div className="py-12 text-center text-[13px] text-danger">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-ink-3">No matching leads.</div>
        ) : (
          filtered.map((lead) => <InquiryListItem key={lead.id} inquiry={lead} />)
        )}
      </div>
    </div>
  );
}
