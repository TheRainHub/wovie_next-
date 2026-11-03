import { Suspense } from "react";
import { trendingMovies } from "@/app/lib/catalog";
import Landing from "@/app/components/Landing";

// Rendered once an hour: the backdrop and posters are today's trending films.
export const revalidate = 3600;

export default async function HomePage() {
  const trending = await trendingMovies(7);
  const backdrop = trending[0]?.backdropUrl ?? null;
  const posters = trending
    .filter(m => m.posterUrl)
    .slice(0, 6)
    .map(m => ({ id: m.id, title: m.title, posterUrl: m.posterUrl! }));

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08070f]" />}>
      <Landing backdrop={backdrop} posters={posters} />
    </Suspense>
  );
}
