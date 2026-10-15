import { BuyerGate } from "@/components/shop/BuyerGate";

export default function VehiclesLayout({ children }: { children: React.ReactNode }) {
  return <BuyerGate>{children}</BuyerGate>;
}
