import Link from 'next/link'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { formatScore } from '@/app/lib/format'

interface Movie {
  id: number
  title: string
  posterUrl: string | null
  rating: number
  voteCount: number
}

interface Props {
  movie: Movie
  /** The signed-in user's own score, shown instead of the TMDB one. */
  myRating?: number
}

// A small poster for rows on the profile and list pages.
export default function MiniCard({ movie, myRating }: Props) {
  return (
    <Link href={`/movies/${movie.id}`} className="group flex-shrink-0 w-[130px] block">
      <div className="aspect-[2/3] rounded-lg overflow-hidden bg-card border border-white/5 mb-2 relative">
        {movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt=""
            fill
            sizes="130px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-xs p-2 text-center">{movie.title}</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-2 z-20">
          <h3 className="text-xs font-medium text-white/90 line-clamp-1 drop-shadow-md group-hover:text-white transition-colors">
            {movie.title}
          </h3>
          {myRating ? (
            <p className="flex items-center gap-1 text-[10px] text-white/70 mt-0.5">
              <Star className="w-2.5 h-2.5 text-accent fill-accent" aria-hidden />
              <span className="font-medium text-white/90">You: {myRating}/10</span>
            </p>
          ) : movie.voteCount > 0 ? (
            <p className="flex items-center gap-1 text-[10px] text-white/70 mt-0.5">
              <Star className="w-2.5 h-2.5 text-accent-yellow fill-accent-yellow" aria-hidden />
              <span className="font-medium text-white/90">{formatScore(movie.rating)}</span>
              <span>TMDB</span>
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
