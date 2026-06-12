"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

const fieldClass =
  "w-full h-11 px-3.5 rounded-[12px] bg-paper-2 border border-line text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all";
const labelClass = "block text-xs font-medium text-ink-3 mb-1.5 mono tracking-[0.06em] uppercase";

export default function EditProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [pincode, setPincode] = useState(user?.pincode ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (name.trim().length < 2) {
      toast.error("Enter your name");
      return;
    }
    setSaving(true);
    try {
      const res = await authApi.completeProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
        pincode: pincode.trim() || undefined,
      });
      setUser(res.user);
      toast.success("Profile updated");
      router.push("/profile");
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to update"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Edit profile" backHref="/profile" />
      <div className="px-5 pb-12 max-w-xl w-full mx-auto">
        <Card className="!p-4 space-y-4">
          <div>
            <label className={labelClass}>Name</label>
            <input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input className={fieldClass} inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>City</label>
              <input className={fieldClass} value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>PIN code</label>
              <input className={fieldClass} inputMode="numeric" value={pincode} onChange={(e) => setPincode(e.target.value)} />
            </div>
          </div>
          <Button variant="primary" block onClick={save} loading={saving}>Save changes</Button>
        </Card>
      </div>
    </div>
  );
}
