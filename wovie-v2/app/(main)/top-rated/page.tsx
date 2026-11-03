import type { Metadata } from 'next'
import { Trophy } from 'lucide-react'
import PosterCard from '@/app/components/PosterCard'
import { listMovies } from '@/app/lib/catalog'

export const metadata: Metadata = { title: 'Top rated' }

export const revalidate = 3600 // the same for everyone: render once an hour

export default async function TopRatedPage() {
  const { movies } = await listMovies({ sort: 'top', genre: null, q: '', page: 1 }, 100)

  return (
    <div className="min-h-screen bg-background text-white pb-20 pt-10 px-4 sm:px-8">
      <div className="max-w-[1400px] mx-auto">
        <header className="flex flex-col items-center justify-center mb-12 text-center">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-6">
            <Trophy className="w-10 h-10 text-accent" aria-hidden />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Top rated</h1>
          <p className="text-white/50 text-lg max-w-2xl">
            The catalogue&apos;s best-rated films by TMDB votes, weighted so that a film with a handful of votes
            can&apos;t outrank one with thousands.
          </p>
        </header>

        <ol className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie, index) => (
            <li key={movie.id} className="relative">
              <span className="absolute -top-3 -left-2 z-20 min-w-8 h-8 px-2 rounded-full bg-black/80 border border-white/15 flex items-center justify-center text-xs font-bold">
                {index + 1}
              </span>
              <PosterCard movie={movie} showFavorite={false} priority={index < 5} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
