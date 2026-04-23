"use client";

import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function MessagesPage() {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden scroll-hidden">
      <TopBar title="Messages" subtitle="Not available in this phase" />
      <div className="px-5 pt-10">
        <Card className="!p-4">
          <div className="text-[14px] font-medium">Messaging is currently disabled.</div>
          <div className="text-[12px] text-ink-3 mt-1.5">
            Continue using order updates and inquiry/bid flows for communication in this release.
          </div>
          <Link href="/buyer/orders" className="block mt-4">
            <Button variant="primary" block>
              Go to orders
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
