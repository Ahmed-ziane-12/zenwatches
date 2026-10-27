import { NextResponse } from "next/server";
import { getRandomWatches } from "@/lib/watches";

// A different random set on every call, so never cache this response.
export const dynamic = "force-dynamic";

const DEFAULT_COUNT = 15;
const MAX_COUNT = 30;

// GET /api/watches/random?count=15
export async function GET(request: Request) {
  const raw = Number(new URL(request.url).searchParams.get("count") ?? DEFAULT_COUNT);
  const count = Number.isFinite(raw) ? Math.min(Math.max(Math.trunc(raw), 1), MAX_COUNT) : DEFAULT_COUNT;

  try {
    const watches = await getRandomWatches(count);
    return NextResponse.json({ count: watches.length, watches }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    // Log the detail on the server, send the client a generic message.
    console.error("[api/watches/random]", err);
    return NextResponse.json({ error: "Could not load watches." }, { status: 500 });
  }
}
