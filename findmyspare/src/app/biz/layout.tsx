import { BizShell } from "@/components/biz/BizShell";

export const metadata = { title: "Business OS · FindMySpare" };

export default function BizLayout({ children }: { children: React.ReactNode }) {
  return <BizShell>{children}</BizShell>;
}
