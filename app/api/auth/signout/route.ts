import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin-auth";

// Clears the HttpOnly admin cookie. The browser also drops the stored user, so
// both halves of the session end together.
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({ name: ADMIN_COOKIE, value: "", path: "/", maxAge: 0 });
  return response;
}
