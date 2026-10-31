import BestSellers from "@/components/BestSellers/BestSellers";
import Categories from "@/components/Categories/Categories";
import Contact from "@/components/Contact/Contact";
import Hero from "@/components/Hero/Hero";
import LoyaltyCard from "@/components/LoyaltyCard/LoyaltyCard";
import PromoBanners from "@/components/PromoBanners/PromoBanners";
import Testimonials from "@/components/Testimonials/Testimonials";
import TopBrands from "@/components/TopBrands/TopBrands";
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
  const bestSellers = await getRandomWatches(5);
  return (
  <div className="wrapper">
    <Hero columns={buildColumns(watches)} />
    <Categories/>
    <PromoBanners/>
    <BestSellers products={bestSellers} />
    <TopBrands/>
    <Testimonials/>
    <div style={{padding: "1rem 2.5rem", textAlign: "center"}}>
      <h2>Special Treats For Our Special Customers</h2>
      <LoyaltyCard purchases={0}/>
    </div>
    <Contact/>

  </div>);
}
