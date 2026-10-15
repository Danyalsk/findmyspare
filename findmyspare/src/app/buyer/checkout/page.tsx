import { redirect } from "next/navigation";

// v2: address + bill live on the cart page; payment is /pay/[checkoutId].
export default function CheckoutRedirect() {
  redirect("/buyer/cart");
}
