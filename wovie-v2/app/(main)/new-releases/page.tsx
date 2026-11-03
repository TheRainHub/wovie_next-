import type { Metadata } from 'next'
import { CalendarDays } from 'lucide-react'
import PosterCard from '@/app/components/PosterCard'
import { listMovies } from '@/app/lib/catalog'

export const metadata: Metadata = { title: 'New releases' }

export const revalidate = 3600 // the same for everyone: render once an hour

export default async function NewReleasesPage() {
  // Released films only, newest first; announcements wait until they are out.
  const { movies } = await listMovies({ sort: 'new', genre: null, q: '', page: 1 }, 100)

  return (
    <div className="min-h-screen bg-background text-white pb-20 pt-10 px-4 sm:px-8">
      <div className="max-w-[1400px] mx-auto">
        <header className="flex flex-col items-center justify-center mb-12 text-center">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-6">
            <CalendarDays className="w-10 h-10 text-accent" aria-hidden />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">New releases</h1>
          <p className="text-white/50 text-lg max-w-2xl">
            Films from the catalogue by release date, newest first. &ldquo;New&rdquo; marks the ones out in the last 90 days.
          </p>
        </header>

        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie, index) => (
            <li key={movie.id}>
              <PosterCard movie={movie} showFavorite={false} priority={index < 5} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
