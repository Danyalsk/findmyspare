import { ComingSoon } from "@/components/layout/ComingSoon";

export default function CheckoutHidden() {
  return <ComingSoon redirectTo="/buyer" message="Checkout is unavailable" />;
}
