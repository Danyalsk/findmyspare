import { BuyerGate } from "@/components/shop/BuyerGate";

export default function WorkshopLayout({ children }: { children: React.ReactNode }) {
  return <BuyerGate>{children}</BuyerGate>;
}
