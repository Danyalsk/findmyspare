import { BuyerGate } from "@/components/shop/BuyerGate";

export default function FixLayout({ children }: { children: React.ReactNode }) {
  return <BuyerGate>{children}</BuyerGate>;
}
