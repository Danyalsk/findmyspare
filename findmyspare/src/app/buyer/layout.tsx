import { BuyerGate } from "@/components/shop/BuyerGate";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return <BuyerGate>{children}</BuyerGate>;
}
