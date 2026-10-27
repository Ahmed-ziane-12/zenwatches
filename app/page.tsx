import Categories from "@/components/Categories/Categories";
import Hero from "@/components/Hero/Hero";
import PromoBanners from "@/components/PromoBanners/PromoBanners";
import { buildColumns, COLUMN_COUNT, sampleProducts, WATCHES_PER_COLUMN, type Product } from "@/lib/products";
import { getRandomWatches, shuffle } from "@/lib/watches";

// Pick a new random set on every visit. To reuse one set for a minute instead (fewer database
// calls), replace this line with: export const revalidate = 60;
export const dynamic = "force-dynamic";

async function loadHeroWatches(): Promise<Product[]> {
  let watches: Product[] = [];
  try {
    // This page is a server component, so it calls the data function directly.
    // Fetching our own /api route from here would only add an extra network hop.
    watches = await getRandomWatches(COLUMN_COUNT * WATCHES_PER_COLUMN);
  } catch (err) {
    console.error("[home] could not load watches", err);
  }

  // While developing, show made-up watches until the database is connected.
  // In production an empty result shows no columns, never fake products.
  if (watches.length === 0 && process.env.NODE_ENV === "development") {
    return shuffle(sampleProducts());
  }
  return watches;
}

export default async function Home() {
  const watches = await loadHeroWatches();
  return (
  <>
    <Hero columns={buildColumns(watches)} />
    <Categories/>
    <PromoBanners/>
  </>);
}
