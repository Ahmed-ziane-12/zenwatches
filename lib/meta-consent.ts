// Consent state for Meta Pixel / Conversions API.
// The banner is only shown when NEXT_PUBLIC_META_CONSENT_REQUIRED === "true".
// The cookie mirrors localStorage so server code (the order API) can respect the choice.

export type MetaConsent = "granted" | "denied" | null;

const STORAGE_KEY = "meta_consent";
export const CONSENT_EVENT = "meta-consent-changed";

export function metaConsentRequired(): boolean {
  return process.env.NEXT_PUBLIC_META_CONSENT_REQUIRED === "true";
}

export function getMetaConsent(): MetaConsent {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function setMetaConsent(value: Exclude<MetaConsent, null>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // localStorage can be blocked; the cookie below still carries the choice.
  }
  document.cookie = `${STORAGE_KEY}=${value}; path=/; max-age=31536000; SameSite=Lax`;
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

/** True when tracking is allowed (no consent gate configured, or the visitor accepted). */
export function hasMetaConsent(): boolean {
  if (!metaConsentRequired()) return true;
  return getMetaConsent() === "granted";
}
