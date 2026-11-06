import "server-only";
import { getSupabase } from "./supabase";

export type CustomerRecord = {
  id: number;
  phone: string;
  name: string | null;
  purchases: number;
  gifts_given: number;
  created_at: string;
};

const CUSTOMER_COLUMNS = "id, phone, name, purchases, gifts_given, created_at";

export type LinkFailure =
  | "invalid-user"
  | "user-not-found"
  | "not-a-client"
  | "customer-not-found"
  | "linked-to-other";

export type LinkResult =
  | { ok: true; status: "linked" | "already"; customer: CustomerRecord }
  | { ok: false; reason: LinkFailure };

/**
 * Customers may store numbers with spaces, +213, 00213, or a leading zero.
 * Reduce both sides to the same local-digit form before comparing.
 */
export function normalizePhone(value: unknown): string {
  if (typeof value !== "string") return "";

  let digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("213") && digits.length >= 12) digits = `0${digits.slice(3)}`;
  if (digits.length === 9) digits = `0${digits}`;

  return digits;
}

export function isValidPhone(value: unknown): boolean {
  return normalizePhone(value).length >= 6;
}

export async function findCustomerByPhone(phone: unknown): Promise<CustomerRecord | null> {
  const target = normalizePhone(phone);
  if (!target) return null;

  const { data, error } = await getSupabase().from("customers").select(CUSTOMER_COLUMNS);

  if (error) throw error;

  const customers = (data ?? []) as CustomerRecord[];
  return customers.find((customer) => normalizePhone(customer.phone) === target) ?? null;
}

export async function getCustomerById(id: unknown): Promise<CustomerRecord | null> {
  const customerId = Number(id);
  if (!Number.isInteger(customerId) || customerId <= 0) return null;

  const { data, error } = await getSupabase()
    .from("customers")
    .select(CUSTOMER_COLUMNS)
    .eq("id", customerId)
    .maybeSingle();

  if (error) throw error;
  return (data as CustomerRecord | null) ?? null;
}

/**
 * Attach a customers row to a client user. Existing links are never overwritten:
 * the phone must match the customer already attached to the account.
 */
export async function linkCustomerToUser(input: {
  userId: unknown;
  phone: unknown;
}): Promise<LinkResult> {
  const userId = Number(input.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    return { ok: false, reason: "invalid-user" };
  }

  const supabase = getSupabase();
  const { data: user, error } = await supabase
    .from("users")
    .select("id, role, customer_id")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!user) return { ok: false, reason: "user-not-found" };
  if (user.role !== "client") return { ok: false, reason: "not-a-client" };

  const customer = await findCustomerByPhone(input.phone);
  if (!customer) return { ok: false, reason: "customer-not-found" };

  if (user.customer_id !== null && user.customer_id !== undefined) {
    if (Number(user.customer_id) === Number(customer.id)) {
      return { ok: true, status: "already", customer };
    }
    return { ok: false, reason: "linked-to-other" };
  }

  const { error: updateError } = await supabase
    .from("users")
    .update({ customer_id: customer.id })
    .eq("id", userId);

  if (updateError) throw updateError;

  return { ok: true, status: "linked", customer };
}
