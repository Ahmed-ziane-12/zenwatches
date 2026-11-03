# Meta Ads integration — developer checklist

Implementation of Part 1 of `meta-integration-plan.pdf`, adapted to the current
Supabase schema (no migrations were added).

## What is implemented

| Plan step | Status | Where |
| --- | --- | --- |
| D0 decisions | Documented below | — |
| D1 data preparation | Audit query below; feed skips invalid rows | — |
| D2 catalog feed | `GET /api/meta/feed.csv?token=...` | `app/api/meta/feed.csv/route.ts` |
| D3 hand feed to client | Operational step | — |
| D4 ad-ready product pages | OG/Twitter metadata, stable URLs, sold-out state | `app/[locale]/(main)/product/[id]/page.tsx`, `components/ProductDetail/ProductDetail.tsx` |
| D5 Meta Pixel | Base code + route-change PageView | `components/MetaPixel.tsx`, `lib/meta.ts` |
| D6 Conversions API | Server-side events, hashed phone, `_fbp`/`_fbc` | `lib/capi.ts`, `app/api/orders/route.ts` |
| D7 Purchase event | Browser + server, shared `purchase_<orderId>` | `components/ProductDetail/ProductDetail.tsx`, `app/[locale]/(main)/checkout/page.tsx`, `app/api/orders/route.ts` |
| D8 DNS verification | Operational step | — |
| D9 consent & security | Optional consent banner, hashed data, server-only tokens | `components/CookieConsent`, `lib/meta-consent.ts`, `lib/capi.ts` |
| D10 QA | Checklist below | — |
| D11 handover | This document | — |

## D0. Decisions to settle with the client

- **Product id**: the feed uses the Supabase `products.id` (stable integer). The Pixel
  sends the same value as `content_ids`, so catalog ads can match events.
- **Currency**: `DZD` everywhere. The database stores `DA` for display; the feed and
  events normalise it to `DZD`.
- **Purchase definition**: currently **Purchase = order placed** (COD). If the client
  prefers confirmed sales, move the server `Purchase` call to the admin status update
  and keep the browser event as `InitiateCheckout`.
- **Variants**: each row is one product. If colour/size variants are added later, give
  each its own id and a shared `item_group_id`.
- **Checkout destination**: the ad points at the product page, which already contains
  the order form.
- **Consent**: set `NEXT_PUBLIC_META_CONSENT_REQUIRED=true` to require opt-in.

## D1. Data the feed needs (current schema)

The `products` table already has everything required:

| Column | Feed field | Notes |
| --- | --- | --- |
| `id` | `id` | Stable retailer id; also used by the Pixel |
| `name` | `title` | Plain text |
| `description` / `full_description` | `description` | HTML is stripped; truncated to 4900 chars |
| `stock` | `availability` | `> 0` → in stock, otherwise out of stock |
| `availability` | `availability` | Used when `stock` is null |
| `price` | `price` | Sent as `1234.00 DZD` |
| `image` / `images[0]` | `image_link` | Relative paths become absolute URLs |
| `brand` | `brand` | Falls back to `META_FEED_BRAND` |
| `active` | filter | Only `active = true` is exported |

No `sku`, `slug`, `image_url`, `published` or `sale_price` columns are required. The
product link is `/{META_FEED_LOCALE}/product/{id}`.

Audit query (should return zero rows):

```sql
select id, name, price, image
from products
where active = true
  and (name is null or trim(name) = ''
    or price is null or price <= 0
    or image is null or trim(image) = '');
```

The endpoint also skips rows missing a title, description, image or positive price, so
one bad row cannot break the whole catalog.

## D2. Catalog feed

### Environment

```env
META_FEED_TOKEN=long-random-string
NEXT_PUBLIC_SITE_URL=https://your-domain.com
# optional
META_FEED_LOCALE=ar
META_FEED_BRAND=Hourwright
META_FEED_CURRENCY=DZD
PRODUCT_IMAGE_BASE_URL=https://your-current-site.com
```

`META_FEED_TOKEN` is server-only. The endpoint returns `500` if it is not configured
and `403` when the token is missing or wrong.

### Test

```bash
curl -i 'https://your-domain.com/api/meta/feed.csv?token=YOUR_TOKEN' | head
curl -i 'https://your-domain.com/api/meta/feed.csv?token=wrong'
```

Expected: `200` + CSV with the header row for the first command, `403` for the second.
Open the CSV in a spreadsheet and check 5 rows: price has `DZD`, links open the right
product, images load in a private window.

### Feed caching

The route revalidates hourly (`export const revalidate = 3600`) and sends
`Cache-Control: s-maxage=3600, stale-while-revalidate=600`. Ask the client to use a
daily schedule at first; switch to hourly if stock changes quickly.

## D3. Hand the feed to the client

Send the full URL (including token) through a password manager, never public chat. The
client pastes it in Commerce Manager → Catalog → Data sources → Data feed. After the
first upload, review Catalog → Diagnostics and fix data issues at the source.

## D4. Ad-ready product pages

- Stable URL: `/[locale]/product/[id]` (no slug changes needed).
- Order form is on the product page, one step from the ad.
- `generateMetadata` adds `og:title`, `og:description`, `og:image`, `og:url`, canonical
  URL and Twitter card tags.
- UTM parameters and `fbclid` stay in the browser URL. The order API reads them from the
  `referer` header and stores them in the existing `orders.source` column (for example
  `utm_source=facebook&utm_campaign=reels&fbclid=...`), so sales can be tied back to the
  ad. The `_fbc` cookie is used as a fallback and is also sent to CAPI for matching.
- Sold-out products stay live but show an out-of-stock badge instead of the order form.

## D5. Meta Pixel

1. Set `NEXT_PUBLIC_META_PIXEL_ID`.
2. `components/MetaPixel.tsx` is rendered once in `app/[locale]/layout.tsx`.
3. It loads Meta's base code after hydration and sends `PageView` on client-side route
   changes.
4. Events are fired through `lib/meta.ts`:

| Event | Fired from |
| --- | --- |
| `PageView` | `MetaPixel` (initial + route change) |
| `ViewContent` | `ProductDetail` on mount |
| `AddToCart` | `CartProvider.add` (covers all add-to-cart buttons) |
| `InitiateCheckout` | first interaction with `OrderForm`; checkout page mount |
| `Purchase` | order success screens, using the server event id |

`content_ids` always use `String(product.id)`, matching the feed.

## D6. Conversions API

Environment:

```env
NEXT_PUBLIC_META_PIXEL_ID=1234567890
META_CAPI_TOKEN=EAAB...
# optional
META_GRAPH_VERSION=v26.0
# META_TEST_EVENT_CODE=TEST123
```

`lib/capi.ts`:

- SHA-256 hashes email/phone (lowercase + trim).
- Normalises Algerian phones: `0550123456` → `213550123456`.
- Sends `client_ip_address`, `client_user_agent`, `_fbp`, `_fbc`.
- Never throws: a CAPI failure cannot break an order.

`app/api/orders/route.ts` calls it after the order and order items are saved, then
returns `eventId: purchase_<orderId>` to the browser.

## D7. Purchase and de-duplication

- Server: `event_name = "Purchase"`, `event_id = purchase_<orderId>`.
- Browser: same name and event id, fired once per session via `trackOnce`.
- Meta discards duplicates received within 48 hours, so a thank-you page refresh does
  not count twice.
- `META_TEST_EVENT_CODE` must be removed in production.

## D8. Domain verification

1. Client sends the TXT value from Business Settings → Brand safety → Domains.
2. Add at the registrar: `TXT`, host `@`, value `facebook-domain-verification=...`.
3. Wait for propagation (`dig TXT your-domain.com +short`).
4. Client clicks **Verify domain**. Keep the record permanently.

## D9. Consent, privacy and security

- Set `NEXT_PUBLIC_META_CONSENT_REQUIRED=true` to show the banner. The Pixel only
  mounts after **Accept**, and the order API only sends CAPI when the `meta_consent`
  cookie is `granted`.
- The banner choice is stored in `localStorage` and in the `meta_consent` cookie.
- A privacy page is available at `/[locale]/privacy` and linked from the footer and
  banner. It mentions the Meta Pixel, advertising cookies and data choices.
- Keep `META_FEED_TOKEN`, `META_CAPI_TOKEN` and `SUPABASE_SECRET_KEY` server-side only.
  Rotate the CAPI token if it was ever shared in chat or email.
- Ask for advertiser/task-based Meta access, not full admin, and enable 2FA.

## D10. QA checklist

- [ ] Feed returns `200` with the token, `403` without it.
- [ ] Header row and all required columns are present.
- [ ] Commerce Manager shows the expected item count and no blocking errors.
- [ ] Sample items show the right image, price and product link.
- [ ] Domain is verified.
- [ ] Meta Pixel Helper finds the Pixel on home, product, checkout and thank-you screens.
- [ ] `ViewContent`, `AddToCart`, `InitiateCheckout` show correct `content_ids`, value,
      currency.
- [ ] `Purchase` appears with source **Browser** and **Server**, deduplicated.
- [ ] A real mobile test order is saved in Supabase and counts one Purchase.
- [ ] Reloading the confirmation screen does not add another Purchase.
- [ ] Catalog diagnostics show events matched to items.
- [ ] Ad preview link works on mobile and keeps UTM parameters.
- [ ] `META_TEST_EVENT_CODE` is removed from production.

## D11. Handover and monitoring

- Feed URL: `https://<domain>/api/meta/feed.csv?token=<token>`
- Data mapping: see D1 above.
- Watch server logs for `[meta/capi]` errors; check Commerce Manager diagnostics weekly.
- If a system-user CAPI token is used, note its expiry and rotation steps.
- Optional real-time stock sync: keep static fields in the feed and push `price`/`stock`
  with the Items Batch API from a Supabase webhook. Never send the same field from both
  the feed and batch updates.
