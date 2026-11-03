import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Info, Star } from 'lucide-react'
import PosterCard from '@/app/components/PosterCard'
import { listMovies, type CatalogueMovie } from '@/app/lib/catalog'
import { formatRuntime, formatScore, formatVotes, yearOf } from '@/app/lib/format'

export const metadata: Metadata = {
  title: 'Top rated',
  description: 'The best-rated films in the catalogue by TMDB votes, weighted by how many people voted.',
}

export const revalidate = 3600 // the same for everyone: render once an hour

// Big outlined place numbers next to the posters. They sit in a fixed-width
// column so every poster is the same size; the type steps down with the
// number of digits so "100" fits as well as "2".
function Place({ n }: { n: number }) {
  const size =
    n < 10 ? 'text-[4.5rem] sm:text-[6rem]' : n < 100 ? 'text-[3rem] sm:text-[4.25rem]' : 'text-[2.1rem] sm:text-[3rem]'
  return (
    <span
      aria-hidden
      className={`${size} font-black leading-[0.8] tracking-tighter text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.3)] select-none -mr-2 sm:-mr-3`}
    >
      {n}
    </span>
  )
}

function NumberOne({ movie }: { movie: CatalogueMovie }) {
  const year = yearOf(movie.releaseDate)
  const runtime = formatRuntime(movie.runtime)
  return (
    <Link
      href={`/movies/${movie.id}`}
      className="group relative block rounded-2xl overflow-hidden mb-12 bg-card"
      style={{ height: 'clamp(320px, 36vw, 460px)' }}
    >
      {movie.backdropUrl && (
        <Image src={movie.backdropUrl} alt="" fill priority sizes="(max-width: 1400px) 100vw, 1400px" className="object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/30 to-transparent" />

      <div className="absolute inset-0 flex items-end gap-4 sm:gap-6 p-6 sm:p-10">
        <span aria-hidden className="text-[7rem] sm:text-[11rem] font-black leading-[0.75] tracking-tighter text-transparent [-webkit-text-stroke:3px_rgba(255,255,255,0.85)] select-none">
          1
        </span>
        <div className="max-w-2xl pb-1">
          <h2 className="text-3xl sm:text-5xl font-bold leading-tight mb-3 drop-shadow-lg">{movie.title}</h2>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/70 mb-3">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" aria-hidden />
              <span className="text-amber-400 font-bold">{formatScore(movie.rating)}</span>
              <span className="text-white/50">TMDB · {formatVotes(movie.voteCount)}</span>
            </span>
            {year && <><span className="text-white/30" aria-hidden>·</span><span>{year}</span></>}
            {runtime && <><span className="text-white/30" aria-hidden>·</span><span>{runtime}</span></>}
            {movie.genres.slice(0, 3).map(g => (
              <span key={g.genre.id} className="hidden sm:inline px-2.5 py-0.5 rounded-full text-xs bg-white/10 border border-white/10">
                {g.genre.name}
              </span>
            ))}
          </p>
          {movie.description && (
            <p className="hidden md:block text-white/60 text-sm leading-relaxed line-clamp-2 mb-5">{movie.description}</p>
          )}
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white text-black group-hover:bg-white/90 transition-colors">
            <Info className="w-4 h-4" aria-hidden />
            View film
          </span>
        </div>
      </div>
    </Link>
  )
}

export default async function TopRatedPage() {
  const { movies } = await listMovies({ sort: 'top', genre: null, q: '', page: 1 }, 100)
  const [first, ...rest] = movies

  return (
    <div className="min-h-screen bg-background text-white pb-20 pt-8 px-4 sm:px-8">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="sr-only">Top rated films</h1>

        {first ? (
          <>
            <NumberOne movie={first} />
            <ol start={2} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {rest.map((movie, index) => (
                <li key={movie.id} className="flex items-end">
                  <div className="w-12 sm:w-18 flex-shrink-0 flex justify-end">
                    <Place n={index + 2} />
                  </div>
                  <div className="relative z-10 flex-1 min-w-0">
                    <PosterCard movie={movie} showFavorite={false} priority={index < 4} />
                  </div>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <p className="text-center text-white/50 py-24">The catalogue is still being filled from TMDB. Reload in a minute.</p>
        )}
      </div>
    </div>
  )
}
