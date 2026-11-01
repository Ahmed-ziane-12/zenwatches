import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, password } = body;

    if (!email || !username || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Check if user already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .or(`email.eq.${email},username.eq.${username}`)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert({
        email,
        username,
        password: hashedPassword,
        role: "client",
      })
      .select("id, email, username, role")
      .single();

    if (error) {
      console.error("[api/auth/signup]", error);
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data }, { status: 201 });
  } catch (error: any) {
    console.error("[api/auth/signup]", error);
    return NextResponse.json({ error: "Could not sign up" }, { status: 500 });
  }
}
