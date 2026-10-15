"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMyGarage } from "@/components/shop/AppShell";
import { Skel } from "@/components/shop/ui";
import { GarageForm, type ServiceGarage } from "@/components/service/GarageForm";
import { toast } from "@/lib/toast";

export default function WorkshopSettingsPage() {
  const { garage, refresh } = useMyGarage();
  const router = useRouter();
  return (
    <div className="max-w-[760px] mx-auto px-4 md:px-6 py-6 md:py-10">
      <Link href="/workshop" className="text-[13px] font-bold text-ink-3">← Workshop</Link>
      <h1 className="text-[28px] font-extrabold tracking-tight mt-2">Workshop profile</h1>
      <p className="text-[14.5px] text-ink-2 mt-1">What you repair decides which nearby jobs you see and the inspection checklist on each job card.</p>
      <div className="mt-5">
        {garage === undefined ? <Skel className="h-[520px]" /> : (
          <GarageForm
            key={garage?.id ?? "new"}
            initial={garage as ServiceGarage | null}
            submitLabel={garage ? "Save changes" : "Create my workshop"}
            onDone={(g) => { refresh(g); toast.success("Workshop profile saved"); router.push("/workshop"); }}
          />
        )}
      </div>
    </div>
  );
}
