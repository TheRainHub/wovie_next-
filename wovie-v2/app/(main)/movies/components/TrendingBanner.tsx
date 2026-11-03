'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, Variants, useReducedMotion } from 'framer-motion'
import { Info, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatScore, yearOf } from '@/app/lib/format'

interface Movie {
  id: number
  title: string
  description: string | null
  backdropUrl: string | null
  rating: number
  voteCount: number
  releaseDate: Date | string | null
  genres: { genre: { name: string } }[]
}

const bannerVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
}

// Today's trending films on TMDB, one at a time. Ranks start at 2: #1 is the
// big banner above.
export default function TrendingBanner({ movies }: { movies: Movie[] }) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)
  const reduceMotion = useReducedMotion()

  const next = useCallback(() => {
    setDirection(1)
    setCurrent(prev => (prev + 1) % movies.length)
  }, [movies.length])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent(prev => (prev - 1 + movies.length) % movies.length)
  }, [movies.length])

  // Advance every 6 s, unless the pointer or focus is on the banner or the
  // visitor asked for less motion.
  useEffect(() => {
    if (paused || reduceMotion || movies.length < 2) return
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next, paused, reduceMotion, movies.length])

  if (!movies.length) return null
  const movie = movies[current]
  const year = yearOf(movie.releaseDate)

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden group"
      style={{ height: 'clamp(280px, 32vw, 420px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={movie.id}
          custom={direction}
          variants={bannerVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
          aria-roledescription="slide"
          aria-label={`${current + 1} of ${movies.length}`}
        >
          {movie.backdropUrl && (
            <Image src={movie.backdropUrl} alt="" fill sizes="(max-width: 1400px) 100vw, 1400px" className="object-cover" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />

          <div className="absolute inset-0 flex items-end p-6 md:p-8 pb-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent text-white uppercase tracking-wider">
                  #{current + 2} trending
                </span>
                {movie.genres.slice(0, 2).map(g => (
                  <span key={g.genre.name} className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/10 border border-white/10 text-white/70 hidden md:inline">
                    {g.genre.name}
                  </span>
                ))}
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-white mb-1.5 line-clamp-1 drop-shadow-lg">{movie.title}</h3>

              <div className="flex items-center gap-2 text-xs text-white/50 mb-2.5">
                {movie.voteCount > 0 && (
                  <>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" aria-hidden />
                    <span className="text-amber-400 font-semibold">{formatScore(movie.rating)}</span>
                    <span>TMDB</span>
                  </>
                )}
                {year && <><span className="text-white/20" aria-hidden>·</span><span>{year}</span></>}
              </div>

              {movie.description && (
                <p className="text-white/50 text-xs leading-relaxed line-clamp-2 mb-3 hidden md:block max-w-md">{movie.description}</p>
              )}

              <Link
                href={`/movies/${movie.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs bg-white text-black hover:bg-white/90 transition-colors"
              >
                <Info className="w-3.5 h-3.5" aria-hidden />
                View film
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        onClick={prev}
        aria-label="Previous film"
        className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/15 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-white/20 transition-all duration-200"
      >
        <ChevronLeft className="w-4 h-4 text-white" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next film"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/15 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-white/20 transition-all duration-200"
      >
        <ChevronRight className="w-4 h-4 text-white" />
      </button>

      <div className="absolute bottom-4 right-5 z-20 flex gap-2">
        {movies.map((m, i) => (
          <button
            key={m.id}
            type="button"
            aria-label={`Show ${m.title}`}
            aria-current={i === current}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
            className={`rounded-full transition-all duration-300 ${i === current ? 'w-5 h-2 bg-accent' : 'w-2 h-2 bg-white/25 hover:bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  )
}
