// Server-side Meta Conversions API. Never import this from a client component:
// META_CAPI_TOKEN must stay on the server.
import "server-only";
import crypto from "crypto";

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v26.0";

function sha256(value?: string): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/** 0550123456 -> 213550123456, as Meta expects for Algerian numbers. */
export function normalizeDzPhone(raw?: string): string | undefined {
  if (!raw) return undefined;
  let digits = raw.replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `213${digits.slice(1)}`;
  return digits;
}

export interface CapiEvent {
  name: string;
  eventId: string;
  url: string;
  email?: string;
  phone?: string;
  fbp?: string;
  fbc?: string;
  ip?: string;
  ua?: string;
  value?: number;
  currency?: string;
  contentIds?: string[];
  contents?: { id: string; quantity: number }[];
  contentName?: string;
}

export interface CapiResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

/**
 * Send one event to Meta. This function never throws: a tracking failure must not
 * break checkout. It returns `skipped` when the Pixel id or token is not configured.
 */
export async function sendCapiEvent(event: CapiEvent): Promise<CapiResult> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_TOKEN;

  if (!pixelId || !accessToken) {
    return { ok: false, skipped: true, error: "Meta CAPI is not configured." };
  }

  const userData: Record<string, unknown> = {
    em: event.email ? [sha256(event.email)] : undefined,
    ph: event.phone ? [sha256(normalizeDzPhone(event.phone))] : undefined,
    fbp: event.fbp,
    fbc: event.fbc,
    client_ip_address: event.ip,
    client_user_agent: event.ua,
  };

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: event.name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        event_source_url: event.url,
        action_source: "website",
        user_data: userData,
        custom_data: {
          value: event.value,
          currency: event.currency || "DZD",
          content_type: "product",
          content_ids: event.contentIds,
          contents: event.contents,
          content_name: event.contentName,
        },
      },
    ],
  };

  // Test events only: remove META_TEST_EVENT_CODE in production or nothing counts.
  if (process.env.META_TEST_EVENT_CODE) {
    body.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("[meta/capi]", response.status, text);
      return { ok: false, error: `${response.status} ${text}`.slice(0, 500) };
    }

    return { ok: true };
  } catch (error) {
    console.error("[meta/capi] request failed", error);
    return { ok: false, error: "Request failed" };
  }
}
