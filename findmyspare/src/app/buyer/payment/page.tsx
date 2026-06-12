import { ComingSoon } from "@/components/layout/ComingSoon";

export default function PaymentHidden() {
  return <ComingSoon redirectTo="/buyer" message="Payment is unavailable" />;
}
