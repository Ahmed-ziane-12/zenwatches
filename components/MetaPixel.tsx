"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  CONSENT_EVENT,
  getMetaConsent,
  metaConsentRequired,
} from "@/lib/meta-consent";
import { flushMetaQueue } from "@/lib/meta";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function MetaPixel() {
  const pathname = usePathname();
  const firstPageView = useRef(true);
  const [enabled, setEnabled] = useState(false);

  // When a consent gate is configured, the base code only mounts after acceptance.
  useEffect(() => {
    if (!PIXEL_ID) return;
    const sync = () =>
      setEnabled(!metaConsentRequired() || getMetaConsent() === "granted");
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  // The base code sends the first PageView; later client-side navigations send their own.
  useEffect(() => {
    if (!enabled) return;
    if (firstPageView.current) {
      firstPageView.current = false;
      return;
    }
    (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq?.(
      "track",
      "PageView",
    );
  }, [pathname, enabled]);

  if (!PIXEL_ID || !enabled) return null;

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      onReady={flushMetaQueue}
    >
      {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${PIXEL_ID}');
        fbq('track', 'PageView');
      `}
    </Script>
  );
}
