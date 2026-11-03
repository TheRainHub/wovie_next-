import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { parseMovieId } from '@/app/lib/api'
import { getFilm, imageUrl, pickCertification, pickTrailer, TMDBNotFoundError } from '@/app/lib/tmdb'
import CinematicHero from './components/CinematicHero'
import PosterInfo, { type FilmInfo } from './components/PosterInfo'
import TrailerPlayer from './components/TrailerPlayer'
import CastGrid from './components/CastGrid'
import SimilarFilms from './components/SimilarFilms'
import SaveLastVisited from './components/SaveLastVisited'

// Film pages come straight from TMDB and are cached for an hour. What depends
// on Wovie's own data (its rating, your favourites and lists) is fetched by
// the page in the browser, so the cache stays the same for everyone.
export const revalidate = 3600

// None at build time; each film page is rendered on its first visit and then
// served from the cache (ISR).
export function generateStaticParams() {
  return []
}

type Params = Promise<{ id: string }>

const loadFilm = cache(async (rawId: string) => {
  const id = parseMovieId(rawId)
  if (!id) return null
  try {
    return await getFilm(id)
  } catch (error) {
    if (error instanceof TMDBNotFoundError) return null
    throw error
  }
})

const CREW_ROLES: [string, string[]][] = [
  ['Director', ['Director']],
  ['Screenplay', ['Screenplay', 'Writer']],
  ['Producer', ['Producer']],
  ['Cinematography', ['Director of Photography']],
  ['Music', ['Original Music Composer']],
]

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const film = await loadFilm((await params).id)
  if (!film) return { title: 'Film not found' }
  return {
    title: film.title,
    description: film.overview ? film.overview.slice(0, 160) : undefined,
    openGraph: { images: film.backdrop_path ? [imageUrl(film.backdrop_path, 'w780')!] : undefined },
  }
}

export default async function FilmPage({ params }: { params: Params }) {
  const film = await loadFilm((await params).id)
  if (!film) notFound()

  const trailer = pickTrailer(film.videos)
  const info: FilmInfo = {
    id: film.id,
    title: film.title,
    originalTitle: film.original_title,
    tagline: film.tagline,
    overview: film.overview,
    posterUrl: imageUrl(film.poster_path, 'w500'),
    logoUrl: imageUrl(film.images?.logos?.[0]?.file_path, 'w500'),
    releaseDate: film.release_date,
    runtime: film.runtime,
    genres: film.genres,
    voteAverage: film.vote_average,
    voteCount: film.vote_count,
    countries: film.production_countries ?? [],
    budget: film.budget,
    revenue: film.revenue,
    certification: pickCertification(film.release_dates),
    hasTrailer: Boolean(trailer),
    crew: CREW_ROLES.map(([role, jobs]) => {
      const member = film.credits?.crew?.find(c => jobs.includes(c.job))
      return { role, name: member?.name ?? null, photoUrl: imageUrl(member?.profile_path, 'w185') }
    }),
  }

  return (
    <div className="pb-20">
      <SaveLastVisited movieId={film.id} />
      <CinematicHero backdropUrl={imageUrl(film.backdrop_path, 'original')} trailerKey={trailer?.key} />

      {/* Scrolls over the fixed backdrop */}
      <div className="relative z-10 mt-[45vh]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0D0F14]/80 to-[#0D0F14] -z-10 pointer-events-none" />

        <div className="max-w-[1200px] mx-auto pt-10">
          <PosterInfo film={info} />

          {trailer && (
            <div className="px-4 sm:px-8 mt-12 bg-[#0D0F14]">
              <TrailerPlayer youtubeId={trailer.key} title={film.title} />
            </div>
          )}

          <div className="bg-[#0D0F14] pt-8 pb-12">
            <CastGrid cast={film.credits?.cast?.slice(0, 10) ?? []} />
            <SimilarFilms films={film.similar?.results?.slice(0, 6) ?? []} />
          </div>
        </div>
      </div>
    </div>
  )
}
