import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import type { ProductAvailability } from "./product-admin";

export const STOREFRONT_LOCALES = ["ar", "en", "fr"] as const;

/** `/watches` is ISR for an hour; refresh it so badge and stock edits show right away. */
export function revalidateStorefront(): void {
  for (const locale of STOREFRONT_LOCALES) {
    revalidatePath(`/${locale}/watches`);
  }
}

export interface AvailabilityWrite {
  row: Record<string, unknown> | null;
  error: string | null;
}

/**
 * The `products` table has a trigger that derives `availability` from `stock`
 * whenever a write includes `stock` (0 => sold-out, low stock => limited).
 * The dashboard toggle must stay authoritative, so the route writes the row
 * first and then re-applies the admin's choice on its own, which the trigger
 * leaves untouched.
 */
export async function persistAvailability(
  supabase: SupabaseClient,
  id: number,
  availability: ProductAvailability,
): Promise<AvailabilityWrite> {
  const { data, error } = await supabase
    .from("products")
    .update({ availability })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) return { row: null, error: error.message };
  return { row: (data as Record<string, unknown> | null) ?? null, error: null };
}
