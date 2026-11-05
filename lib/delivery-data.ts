import "server-only";
import { getSupabase } from "./supabase";
import type { DeliveryConfig } from "./delivery-types";

type DeliveryRecord = {
  wilaya: string;
  home_price: number | string;
  desk_price: number | string;
  desks: string[] | null;
};

/** Reads the delivery table once per caller and shapes it like the old static config. */
export async function loadDelivery(): Promise<DeliveryConfig> {
  const { data, error } = await getSupabase()
    .from("delivery")
    .select("wilaya,home_price,desk_price,desks")
    .order("id", { ascending: true });

  if (error) throw error;

  const shippingPrices: DeliveryConfig["shippingPrices"] = {};
  const officeLocations: DeliveryConfig["officeLocations"] = {};

  for (const row of (data ?? []) as DeliveryRecord[]) {
    shippingPrices[row.wilaya] = {
      home: Number(row.home_price),
      desk: Number(row.desk_price),
    };
    officeLocations[row.wilaya] = Array.isArray(row.desks) ? row.desks : [];
  }

  return { shippingPrices, officeLocations };
}
