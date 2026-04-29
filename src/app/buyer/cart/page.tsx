import { ComingSoon } from "@/components/layout/ComingSoon";

export default function CartHidden() {
  return <ComingSoon redirectTo="/buyer" message="Cart is unavailable in this release" />;
}
