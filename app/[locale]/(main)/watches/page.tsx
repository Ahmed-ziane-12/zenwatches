
import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllWatches } from "@/lib/watches"; 
import { WatchesCatalog } from "@/components/watches/WatchesCatalog";

export const metadata: Metadata = { title: "Watches" };

// The page doesn't read searchParams on the server, so it stays static.
// Data is re-fetched at most once per hour.
export const revalidate = 3600;

export default async function WatchesPage() {
  const products = await getAllWatches();

  return (
    // useSearchParams() in the client component requires a Suspense boundary
    <Suspense fallback={null}>
      <WatchesCatalog products={products} />
    </Suspense>
  );
}