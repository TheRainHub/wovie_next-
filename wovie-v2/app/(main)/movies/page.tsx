import type { Metadata } from 'next'
import Link from 'next/link'
import { after } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { favoriteIds, listGenres, listMovies, trendingMovies } from '@/app/lib/catalog'
import { catalogueSearch, parseCatalogueQuery } from '@/app/lib/catalog-query'
import { syncCatalog } from '@/app/lib/catalog-sync'
import HeroBanner from './components/HeroBanner'
import TrendingBanner from './components/TrendingBanner'
import CatalogueFilters from './components/CatalogueFilters'
import CatalogueGrid from './components/CatalogueGrid'

export const metadata: Metadata = { title: 'Films' }

// Long enough for a catalogue refresh to finish after the response is sent.
export const maxDuration = 60

type SearchParams = Promise<Record<string, string | string[] | undefined>>

// The catalogue: rendered on the server from the database, so the first
// screen arrives as HTML. Filters live in the URL; later pages load as you
// scroll.
export default async function MoviesPage({ searchParams }: { searchParams: SearchParams }) {
  const query = parseCatalogueQuery(await searchParams)
  const isSearching = query.q.length > 0

  const [session, { movies, total, hasMore }, genres, trending] = await Promise.all([
    getServerSession(authOptions),
    listMovies({ ...query, page: 1 }),
    listGenres(),
    isSearching ? Promise.resolve([]) : trendingMovies(6),
  ])
  const favorites = await favoriteIds(session?.user?.id, movies.map(m => m.id))

  // Refresh scores from TMDB in the background when the last sync is over six
  // hours old. Visitors never wait for it.
  after(() => syncCatalog())

  const [featured, ...trendingRest] = trending
  const gridKey = catalogueSearch({ ...query, page: 1 }) || 'all'
  const hasFilters = isSearching || query.genre !== null || query.sort !== 'popular'

  return (
    <div className="min-h-screen bg-background text-white">
      {!isSearching && featured && (
        <section aria-label="Featured film">
          <HeroBanner movie={featured} />
        </section>
      )}

      <div className={`max-w-[1400px] mx-auto ${isSearching || !featured ? 'pt-12' : ''}`}>
        {!isSearching && trendingRest.length > 0 && (
          <section aria-labelledby="trending-heading" className="mb-10">
            <h2 id="trending-heading" className="text-xl font-semibold text-white mb-4">
              Trending today
            </h2>
            <TrendingBanner movies={trendingRest} />
          </section>
        )}

        <section aria-labelledby="catalogue-heading">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="catalogue-heading" className="text-xl font-semibold text-white">
                {isSearching ? <>Results for &ldquo;{query.q}&rdquo;</> : 'All films'}
                <span className="ml-2 text-sm font-normal text-white/40">{total.toLocaleString('en-US')}</span>
              </h2>
              {hasFilters && (
                <Link href="/movies" className="text-sm text-white/50 hover:text-white underline underline-offset-4">
                  Clear filters
                </Link>
              )}
            </div>
            <CatalogueFilters genres={genres} query={query} />
          </div>

          {movies.length > 0 ? (
            <CatalogueGrid
              key={gridKey}
              initialMovies={movies.map(m => ({ ...m, isFavorite: favorites.has(m.id) }))}
              query={query}
              initialHasMore={hasMore}
            />
          ) : hasFilters ? (
            <div className="text-center py-20">
              <p className="text-white/60 text-lg mb-2">No films match these filters</p>
              <p className="text-white/30 text-sm mb-6">Try another title or genre.</p>
              <Link href="/movies" className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-sm transition-colors">
                Browse all films
              </Link>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-white/60 text-lg mb-2">The catalogue is still being filled from TMDB</p>
              <p className="text-white/30 text-sm">Reload the page in a minute.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
