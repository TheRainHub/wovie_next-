import Link from 'next/link'
import Image from 'next/image'
import { Star } from 'lucide-react'
import FavoriteButton from './FavoriteButton'
import { formatScore, isRecentRelease, yearOf } from '@/app/lib/format'

export interface PosterCardMovie {
  id: number
  title: string
  posterUrl: string | null
  releaseDate: Date | string | null
  rating: number
  voteCount: number
  genres: { genre: { name: string } }[]
  isFavorite?: boolean
}

interface Props {
  movie: PosterCardMovie
  /** Show the favourite toggle (lists of your own films leave it out). */
  showFavorite?: boolean
  priority?: boolean
  /** Shown instead of the year, e.g. the full release date. */
  dateLabel?: string
}

// A film in a grid: poster, TMDB score, title, year and first genre.
export default function PosterCard({ movie, showFavorite = true, priority = false, dateLabel }: Props) {
  const year = dateLabel ?? yearOf(movie.releaseDate)
  const genre = movie.genres[0]?.genre.name ?? ''
  const isNew = isRecentRelease(movie.releaseDate)

  return (
    <Link href={`/movies/${movie.id}`} className="block group rounded-xl focus-visible:outline-2 focus-visible:outline-accent">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-card card-3d">
        {movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center px-4 text-center text-white/25 text-sm">
            {movie.title}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        <div className="absolute top-2 left-2 right-2 z-10 flex items-start justify-between gap-2">
          <div className="flex flex-col gap-2 items-start">
            {isNew && (
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-accent text-white uppercase tracking-wider shadow-md">
                New
              </span>
            )}
            {showFavorite && <FavoriteButton movieId={movie.id} initialIsFavorite={Boolean(movie.isFavorite)} />}
          </div>

          {movie.voteCount > 0 && (
            <span
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white/90 shadow-md"
              title={`TMDB ${formatScore(movie.rating)} from ${movie.voteCount.toLocaleString('en-US')} votes`}
            >
              <Star className="w-3 h-3 text-accent-yellow fill-accent-yellow" aria-hidden />
              <span className="sr-only">TMDB rating</span>
              {formatScore(movie.rating)}
            </span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 p-3">
          <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1 drop-shadow-md group-hover:text-accent transition-colors duration-300">
            {movie.title}
          </h3>
          <p className="flex items-center gap-1.5 text-[11px] text-white/60">
            {year && <span>{year}</span>}
            {year && genre && <span className="text-white/25" aria-hidden>·</span>}
            {genre && <span>{genre}</span>}
          </p>
        </div>
      </div>
    </Link>
  )
}
