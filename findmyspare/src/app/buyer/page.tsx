import { redirect } from "next/navigation";

// v2: the storefront home is the buyer home.
export default function BuyerHome() {
  redirect("/");
}
