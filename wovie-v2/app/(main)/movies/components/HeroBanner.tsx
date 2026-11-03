'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Info, Play, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatRuntime, formatScore, yearOf } from '@/app/lib/format'
import { LAST_VIEWED_KEY } from '@/app/lib/last-viewed'

interface Movie {
  id: number
  title: string
  description: string | null
  posterUrl: string | null
  backdropUrl: string | null
  releaseDate: Date | string | null
  rating: number
  voteCount: number
  runtime: number | null
  trailerUrl?: string | null
  genres: { genre: { name: string } }[]
}

// The big banner on top of the catalogue: today's #1 on TMDB, or the film you
// looked at last (remembered in this browser only).
export default function HeroBanner({ movie: trending }: { movie: Movie }) {
  const [lastViewed, setLastViewed] = useState<Movie | null>(null)

  useEffect(() => {
    let id: string | null = null
    try {
      id = localStorage.getItem(LAST_VIEWED_KEY)
    } catch {}
    if (!id || id === String(trending.id)) return
    const controller = new AbortController()
    fetch(`/api/movies/${id}`, { signal: controller.signal })
      .then(r => (r.ok ? r.json() : null))
      .then(data => data && setLastViewed(data))
      .catch(() => {})
    return () => controller.abort()
  }, [trending.id])

  const movie = lastViewed ?? trending
  const year = yearOf(movie.releaseDate)
  const runtime = formatRuntime(movie.runtime)

  return (
    <article className="relative w-[calc(100%+2rem)] -mx-4 -mt-16 mb-10" aria-label={movie.title}>
      <div className="relative w-full h-[70vh] min-h-[500px] max-h-[700px] overflow-hidden">
        {movie.backdropUrl ? (
          <Image
            key={movie.id}
            src={movie.backdropUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover animate-[fadeIn_0.8s_ease-out]"
          />
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#121212]/80 via-[#121212]/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-8 pb-10 max-w-[1400px] mx-auto">
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <p
              className={`inline-flex items-center px-3 py-1.5 rounded-full mb-4 text-xs font-semibold tracking-wide border ${
                lastViewed
                  ? 'bg-blue-500/20 border-blue-500/30 text-blue-300'
                  : 'bg-red-500/20 border-red-500/30 text-red-300'
              }`}
            >
              {lastViewed ? 'You looked at this last' : '#1 trending today on TMDB'}
            </p>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg max-w-3xl leading-tight">
              {movie.title}
            </h1>

            <div className="flex items-center gap-2 text-sm text-white/70 mb-4 flex-wrap">
              {movie.voteCount > 0 && (
                <span className="flex items-center gap-1" title={`${movie.voteCount.toLocaleString('en-US')} votes on TMDB`}>
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" aria-hidden />
                  <span className="text-amber-400 font-bold">{formatScore(movie.rating)}</span>
                  <span className="text-white/40">TMDB</span>
                </span>
              )}
              {year && <><span className="text-white/30" aria-hidden>·</span><span>{year}</span></>}
              {runtime && <><span className="text-white/30" aria-hidden>·</span><span>{runtime}</span></>}
            </div>

            <ul className="flex flex-wrap gap-2 mb-5">
              {movie.genres.slice(0, 4).map(g => (
                <li key={g.genre.name} className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 border border-white/10 text-white/80">
                  {g.genre.name}
                </li>
              ))}
            </ul>

            {movie.description && (
              <p className="text-white/60 text-sm leading-relaxed max-w-xl mb-6 line-clamp-3">{movie.description}</p>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href={`/movies/${movie.id}`}
                className="flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm bg-white text-black hover:bg-white/90 transition-colors"
              >
                <Info className="w-4 h-4" aria-hidden />
                View film
              </Link>
              {movie.trailerUrl && (
                <Link
                  href={`/movies/${movie.id}#trailer`}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white transition-colors backdrop-blur-sm"
                >
                  <Play className="w-4 h-4" aria-hidden />
                  Watch trailer
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </article>
  )
}
