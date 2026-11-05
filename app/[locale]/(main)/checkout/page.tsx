import { loadDelivery } from "@/lib/delivery-data";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const delivery = await loadDelivery();
  return <CheckoutClient delivery={delivery} />;
}
