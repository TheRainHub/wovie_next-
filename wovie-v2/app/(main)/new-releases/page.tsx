import type { Metadata } from 'next'
import PosterCard from '@/app/components/PosterCard'
import { listMovies, type CatalogueMovie } from '@/app/lib/catalog'

export const metadata: Metadata = {
  title: 'New releases',
  description: 'Films from the catalogue by release date, newest first, month by month.',
}

export const revalidate = 3600 // the same for everyone: render once an hour

const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const dayLabel = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', timeZone: 'UTC' })

/** Films grouped by the month they came out, keeping the newest-first order. */
function byMonth(movies: CatalogueMovie[]) {
  const groups: { key: string; label: string; movies: CatalogueMovie[] }[] = []
  for (const movie of movies) {
    if (!movie.releaseDate) continue
    const date = new Date(movie.releaseDate)
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`
    if (groups.at(-1)?.key !== key) groups.push({ key, label: monthLabel.format(date), movies: [] })
    groups.at(-1)!.movies.push(movie)
  }
  return groups
}

export default async function NewReleasesPage() {
  // Released films only, newest first; announcements wait until they are out.
  const { movies } = await listMovies({ sort: 'new', genre: null, q: '', page: 1 }, 100)
  const months = byMonth(movies)

  return (
    <div className="min-h-screen bg-background text-white pb-20 pt-8 px-4 sm:px-8">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="sr-only">New releases</h1>

        {months.length === 0 && (
          <p className="text-center text-white/50 py-24">The catalogue is still being filled from TMDB. Reload in a minute.</p>
        )}

        {months.map((month, monthIndex) => (
          <section key={month.key} aria-labelledby={`month-${month.key}`} className="mb-14">
            <h2 id={`month-${month.key}`} className="sticky top-16 z-20 -mx-4 sm:-mx-8 px-4 sm:px-8 py-3 mb-5 bg-background/90 backdrop-blur-md flex items-baseline gap-3">
              <span className="text-2xl font-semibold">{month.label}</span>
              <span className="text-sm text-white/40">
                {month.movies.length} {month.movies.length === 1 ? 'film' : 'films'}
              </span>
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {month.movies.map((movie, index) => (
                <li key={movie.id}>
                  <PosterCard
                    movie={movie}
                    showFavorite={false}
                    priority={monthIndex === 0 && index < 5}
                    dateLabel={dayLabel.format(new Date(movie.releaseDate!))}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
