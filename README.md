# Hourwright

Watch store hero built with Next.js (App Router), TypeScript, CSS modules and Supabase.

```bash
npm install
cp .env.local.example .env.local   # then paste your anon key (it is in js/database.js of your current site)
npm run dev                        # http://localhost:3000
npm run build
```

## Supabase and the API

- `lib/supabase.ts`: server-only client. The keys have no `NEXT_PUBLIC_` prefix, so they never reach the browser.
- `lib/watches.ts`: reads the `products` table. Everything that depends on your table layout is in the block at the top of the file.
- `app/api/watches/random/route.ts`: `GET /api/watches/random?count=15` returns `{ count, watches }` in random order (1 to 30 watches, 500 with a generic message if the database fails).
- `app/page.tsx`: picks 15 watches and deals them into the three columns on every visit. It calls `getRandomWatches` directly instead of fetching its own API route.

How `products` rows become hero watches:

| Column | Used for |
| --- | --- |
| `active` | Only `active = true` rows are fetched |
| `stock`, `availability` | Same rule as your storefront: stock wins (0 or less sold out, 1 to 5 limited, above 5 available). Sold-out rows are skipped |
| `name`, `price`, `currency` | Tile and bag text, shown as `42,000 DA` (currency defaults to `DA`) |
| `image`, `images` | `image`, or the first of `images`. `placeholder.*` files count as no photo |
| `specs` | The short line under the name: the first two values |
| `colors` | Named in the bag only when the watch has exactly one color |

A watch with no photo gets one of the SVG watch drawings.

Images: full URLs load straight from their host. Paths such as `images/rolex.jpg` are served from this app's `public/` folder, so copy your `images` folder into `public/images`. To load them from your existing site instead, set `PRODUCT_IMAGE_BASE_URL` in `.env.local`.

The storefront already reads this table with the anon key, so your Row Level Security policy for `products` is already in place.

The random pick is made from the first 1000 active rows. For a larger catalogue, move it into a Postgres function (`order by random() limit 15`) and call it with `supabase.rpc()`.

In development, if the database returns nothing, the hero shows made-up sample watches. In production it shows no columns instead.

## Bag and checkout

The bag stores a copy of each product in the browser, so prices there are for display only. Your `orders` table expects a color per item and a WhatsApp checkout, which are not built yet. Look prices up again on the server when you build checkout.

## Other files

- `app/globals.css`: light and dark color tokens (light is the default)
- `app/layout.tsx`: fonts, theme script, cart provider, navbar, cart drawer
- `lib/products.ts`: shared types, price formatting, column motion settings, SVG artwork choices
- `components/WatchColumns.tsx`: the animated columns (down, up, down)
- `components/ProductImage.tsx`: shows the photo, or the SVG drawing when there is none
- `components/CartProvider.tsx` and `CartDrawer.tsx`: bag state (saved in localStorage) and the slide-out drawer
- `components/ThemeToggle.tsx`: light/dark switch (saved in localStorage)
