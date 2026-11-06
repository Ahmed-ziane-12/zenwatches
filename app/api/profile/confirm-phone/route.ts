import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { isValidPhone, linkCustomerToUser } from "@/lib/customer-link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FAILURE_STATUS: Record<string, { status: number; error: string; code: string }> = {
  "invalid-user": { status: 400, error: "Invalid user", code: "INVALID_USER" },
  "user-not-found": { status: 404, error: "User not found", code: "USER_NOT_FOUND" },
  "not-a-client": { status: 403, error: "Not a client account", code: "NOT_A_CLIENT" },
  "customer-not-found": {
    status: 404,
    error: "No customer account matches this phone number",
    code: "CUSTOMER_NOT_FOUND",
  },
  "linked-to-other": {
    status: 409,
    error: "This account is already linked to another customer",
    code: "LINKED_TO_OTHER",
  },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, phone } = body;

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: "Enter a valid phone number", code: "INVALID_PHONE" },
        { status: 400 },
      );
    }

    const result = await linkCustomerToUser({ userId, phone });

    if (!result.ok) {
      const failure = FAILURE_STATUS[result.reason];
      return NextResponse.json(
        { error: failure.error, code: failure.code },
        { status: failure.status },
      );
    }

    const { data: user, error } = await getSupabase()
      .from("users")
      .select("id, email, username, role, created_at, customer_id")
      .eq("id", Number(userId))
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        status: result.status,
        user,
        customer: result.customer,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[api/profile/confirm-phone] error:", error);
    return NextResponse.json(
      { error: "Could not confirm this phone number" },
      { status: 500 },
    );
  }
}
