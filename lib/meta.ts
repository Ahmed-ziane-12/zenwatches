// Browser-side Meta Pixel helpers. Every event goes through `track` so consent and
// the `fbq` availability check live in one place.
import { hasMetaConsent } from "./meta-consent";

type EventParams = Record<string, unknown>;
type Fbq = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: Fbq;
    /** Events fired before the Pixel base code finished loading. */
    __metaPending?: unknown[][];
  }
}

export function newEventId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
}

/** Fire a standard Meta event. No-ops on the server, without consent, or before fbq loads. */
export function track(name: string, data: EventParams = {}, eventId?: string): void {
  if (typeof window === "undefined" || !hasMetaConsent()) return;
  const args = ["track", name, data, eventId ? { eventID: eventId } : undefined];
  if (typeof window.fbq === "function") {
    window.fbq(...args);
    return;
  }
  // The Pixel script is loaded with `afterInteractive`, so an event fired on mount can
  // arrive first. Queue it and let MetaPixel flush the queue once `fbq` exists.
  (window.__metaPending ||= []).push(args);
}

/** Called by MetaPixel when the base code is ready. */
export function flushMetaQueue(): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  const pending = window.__metaPending;
  if (!pending?.length) return;
  window.__metaPending = [];
  for (const args of pending) {
    window.fbq(...args);
  }
}

/**
 * Fire an event only once per browser session for a given key. Used for Purchase so a
 * reload of the confirmation screen cannot count a second sale.
 */
export function trackOnce(
  name: string,
  data: EventParams,
  eventId: string,
  key: string,
): void {
  if (typeof window === "undefined") return;
  try {
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
  } catch {
    // Storage may be unavailable; firing once is still better than never.
  }
  track(name, data, eventId);
}

interface PurchaseInput {
  eventId: string;
  value: number;
  currency?: string;
  contentIds: string[];
  contents: { id: string; quantity: number }[];
}

/** Browser half of the redundant Purchase setup; the server sends the same event id. */
export function trackPurchase({
  eventId,
  value,
  currency = "DZD",
  contentIds,
  contents,
}: PurchaseInput): void {
  trackOnce(
    "Purchase",
    {
      content_ids: contentIds,
      contents,
      content_type: "product",
      value,
      currency,
    },
    eventId,
    `meta_purchase_${eventId}`,
  );
}

export function trackViewContent(product: {
  id: string;
  name: string;
  price: number;
  currency?: string;
}): void {
  track("ViewContent", {
    content_ids: [String(product.id)],
    content_type: "product",
    content_name: product.name,
    value: product.price,
    currency: product.currency === "DA" ? "DZD" : product.currency || "DZD",
  });
}

export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  currency?: string;
}): void {
  track("AddToCart", {
    content_ids: [String(product.id)],
    content_type: "product",
    content_name: product.name,
    value: product.price,
    currency: product.currency === "DA" ? "DZD" : product.currency || "DZD",
  });
}

export function trackInitiateCheckout(
  items: { id: string; quantity: number }[],
  value: number,
): void {
  track("InitiateCheckout", {
    content_ids: items.map((item) => String(item.id)),
    contents: items.map((item) => ({ id: String(item.id), quantity: item.quantity })),
    content_type: "product",
    num_items: items.reduce((sum, item) => sum + item.quantity, 0),
    value,
    currency: "DZD",
  });
}
