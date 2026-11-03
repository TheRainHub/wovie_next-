'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, Variants } from 'framer-motion'
import { Play, Plus } from 'lucide-react'
import { useAccentColor } from '../hooks/useAccentColor'
import WatchlistDropdown from '@/app/components/WatchlistDropdown'
import FavoriteButton from '@/app/components/FavoriteButton'
import { formatDate, formatMoney, formatRuntime, yearOf } from '@/app/lib/format'
import { loginHref } from '@/app/lib/login'
import RatingChart from './RatingChart'
import FilmRatings, { type Community } from './FilmRatings'
import ShareButton from './ShareButton'

export interface FilmInfo {
  id: number
  title: string
  originalTitle: string
  tagline: string | null
  overview: string
  posterUrl: string | null
  logoUrl: string | null
  releaseDate: string | null
  runtime: number | null
  genres: { id: number; name: string }[]
  voteAverage: number
  voteCount: number
  countries: { iso_3166_1: string; name: string }[]
  budget: number
  revenue: number
  certification: { region: string; certification: string } | null
  hasTrailer: boolean
  crew: { role: string; name: string | null; photoUrl: string | null }[]
}

interface FilmState {
  signedIn: boolean
  community: Community | null
  myRating: number | null
  isFavorite: boolean
  watchlists: { id: string; name: string; contains: boolean }[]
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

function CrewCard({ role, name, photoUrl }: FilmInfo['crew'][number]) {
  return (
    <div className="flex items-center gap-3 bg-[#12151C] border border-white/5 rounded-xl px-4 py-3">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- small TMDB profile photo
          <img src={photoUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-xs" aria-hidden>?</div>
        )}
      </div>
      <div className="flex flex-col justify-center min-w-0">
        <span className="text-white/40 text-[10px] tracking-wider uppercase mb-0.5">{role}</span>
        <span className="text-white text-sm font-medium line-clamp-1">{name ?? '—'}</span>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col items-center text-center">
      <dt className="text-white/40 text-xs tracking-wider uppercase mb-1">{label}</dt>
      <dd className="text-white font-semibold">{value || '—'}</dd>
    </div>
  )
}

export default function PosterInfo({ film }: { film: FilmInfo }) {
  const pathname = usePathname()
  const accent = useAccentColor(film.posterUrl ?? undefined)
  const [state, setState] = useState<FilmState | null>(null)
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false)
  const closeWatchlist = useCallback(() => setIsWatchlistOpen(false), [])

  const year = yearOf(film.releaseDate)
  const countryNames = film.countries.map(c => c.name).join(', ')
  const countryCodes = film.countries.map(c => c.iso_3166_1).join(' / ')
  const runtime = formatRuntime(film.runtime)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/movies/${film.id}/state`, { signal: controller.signal })
      .then(res => (res.ok ? res.json() : null))
      .then(data => data && setState(data))
      .catch(() => {})
    return () => controller.abort()
  }, [film.id])

  const chipStyle = { backgroundColor: accent.rgba(0.06), border: `1px solid ${accent.rgba(0.15)}`, color: 'rgba(255,255,255,0.8)' }
  const secondaryButton =
    'flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors border border-white/10 text-white px-6 py-3.5 rounded-xl font-medium backdrop-blur-sm'

  return (
    <div className="flex flex-col gap-8 px-4 sm:px-8 -mt-20 relative z-10">
      <div className="flex flex-col md:flex-row gap-8">
        <motion.div
          className="w-[200px] sm:w-[260px] lg:w-[320px] flex-shrink-0 self-center md:self-start rounded-xl overflow-hidden"
          style={{ boxShadow: `0 20px 60px ${accent.rgba(0.3)}, 0 0 80px ${accent.rgba(0.1)}`, border: `1px solid ${accent.rgba(0.15)}` }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {film.posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- crossOrigin is needed to read its colours for the accent
            <img src={film.posterUrl} alt={`${film.title} poster`} className="w-full block object-cover" crossOrigin="anonymous" />
          ) : (
            <div className="w-full aspect-[2/3] flex items-center justify-center text-white/30">No poster</div>
          )}
        </motion.div>

        <motion.div className="flex-1 md:pt-12 flex flex-col justify-end pb-4" variants={containerVariants} initial="hidden" animate="show">
          <motion.div variants={itemVariants} className="mb-6">
            {film.logoUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- title artwork from TMDB */}
                <img src={film.logoUrl} alt="" className="max-h-[120px] object-contain object-left drop-shadow-2xl mb-4" />
                <h1 className="sr-only">{film.title}</h1>
              </>
            ) : (
              <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-2 drop-shadow-lg">{film.title}</h1>
            )}
            <p className="text-white/60 text-base font-medium">
              {film.originalTitle !== film.title && `${film.originalTitle}, `}
              {year}
              {countryNames && ` — ${countryNames}`}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-8 mb-6">
            {film.voteCount > 0 ? (
              <RatingChart score={film.voteAverage} votes={film.voteCount} accent={accent.hex} />
            ) : (
              <p className="text-sm text-white/40 max-w-[10rem]">No TMDB votes yet</p>
            )}
            <FilmRatings
              movieId={film.id}
              signedIn={state?.signedIn ?? false}
              loaded={state !== null}
              community={state?.community ?? null}
              myRating={state?.myRating ?? null}
              accent={accent.hex}
              onChange={(myRating, community) => setState(s => (s ? { ...s, myRating, community } : s))}
            />
          </motion.div>

          <motion.ul variants={itemVariants} className="flex flex-wrap gap-2 mb-6">
            {film.certification && (
              <li
                className="px-3 py-1.5 text-sm rounded-full font-medium"
                style={{ backgroundColor: accent.rgba(0.1), border: `1px solid ${accent.rgba(0.2)}`, color: accent.rgba(0.9) }}
                title={`Age rating in ${film.certification.region}`}
              >
                {film.certification.certification}
              </li>
            )}
            {film.genres.map(g => (
              <li key={g.id} className="px-3 py-1.5 text-sm rounded-full font-medium" style={chipStyle}>
                {g.name}
              </li>
            ))}
            {runtime && (
              <li className="px-3 py-1.5 text-sm rounded-full font-medium" style={chipStyle}>
                {runtime}
              </li>
            )}
          </motion.ul>

          <motion.div variants={itemVariants} className="mb-8">
            {film.tagline && (
              <p className="italic text-lg mb-3 font-medium drop-shadow-sm" style={{ color: accent.hex }}>
                «{film.tagline}»
              </p>
            )}
            <p className="text-white/80 text-base leading-relaxed max-w-4xl drop-shadow-sm">
              {film.overview || 'TMDB has no description for this film yet.'}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 relative">
            {film.hasTrailer && (
              <a
                href="#trailer"
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all duration-300"
                style={{ backgroundColor: accent.hex, color: accent.isDark ? '#fff' : '#000', boxShadow: `0 8px 32px ${accent.rgba(0.4)}` }}
              >
                <Play className="w-5 h-5" style={{ fill: accent.isDark ? '#fff' : '#000' }} aria-hidden />
                Watch trailer
              </a>
            )}

            {state?.signedIn ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsWatchlistOpen(open => !open)}
                  aria-expanded={isWatchlistOpen}
                  className={secondaryButton}
                >
                  <Plus className="w-5 h-5" aria-hidden />
                  Add to list
                </button>
                <WatchlistDropdown movieId={film.id} watchlists={state.watchlists} isOpen={isWatchlistOpen} onClose={closeWatchlist} />
              </div>
            ) : (
              <Link href={loginHref(pathname)} className={secondaryButton}>
                <Plus className="w-5 h-5" aria-hidden />
                Add to list
              </Link>
            )}

            <FavoriteButton
              movieId={film.id}
              initialIsFavorite={state?.isFavorite ?? false}
              iconClassName="w-5 h-5"
              className="p-3.5 bg-white/10 hover:bg-white/20 transition-colors border border-white/10 text-white rounded-xl backdrop-blur-sm"
            />
            <ShareButton title={film.title} />
          </motion.div>
        </motion.div>
      </div>

      <motion.dl
        className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-[#12151C] rounded-2xl py-6 px-8"
        style={{ border: `1px solid ${accent.rgba(0.1)}` }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Stat label="Year" value={year} />
        <Stat label="Country" value={countryCodes} />
        <Stat label="Budget" value={formatMoney(film.budget)} />
        <Stat label="Box office" value={formatMoney(film.revenue)} />
        <Stat label="Release" value={formatDate(film.releaseDate)} />
      </motion.dl>

      <motion.section
        className="mt-4"
        aria-labelledby="crew-heading"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h2 id="crew-heading" className="text-xl font-medium text-white mb-4">Crew</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {film.crew.map(member => (
            <CrewCard key={member.role} {...member} />
          ))}
        </div>
      </motion.section>
    </div>
  )
}
