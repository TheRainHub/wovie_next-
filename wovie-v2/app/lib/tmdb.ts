import type {
  TMDBFilm,
  TMDBGenresResponse,
  TMDBMovieDetails,
  TMDBMovieListResponse,
  TMDBReleaseDates,
  TMDBVideo,
} from './tmdb-types'

// The only TMDB client in the app. TMDB_API_BASE_URL exists so local
// development and tests can point at a stand-in instead of the real API.
const BASE_URL = process.env.TMDB_API_BASE_URL ?? 'https://api.themoviedb.org/3'
const IMAGE_BASE = 'https://image.tmdb.org/t/p'

/** TMDB answered with 404: the film does not exist. */
export class TMDBNotFoundError extends Error {}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) throw new Error('TMDB_API_KEY is not set')

  const url = new URL(`${BASE_URL}${endpoint}`)
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('language', 'en-US')
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)

  // Cached for an hour: the catalogue is the same for everyone, and a slow or
  // failing TMDB then only delays the next refresh instead of every visit.
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (res.status === 404) throw new TMDBNotFoundError(`TMDB has no ${endpoint}`)
  if (!res.ok) throw new Error(`TMDB ${endpoint}: ${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export function getPopularMovies(page = 1) {
  return tmdbFetch<TMDBMovieListResponse>('/movie/popular', { page: String(page) })
}

export function getTrendingMovies(window: 'day' | 'week' = 'day') {
  return tmdbFetch<TMDBMovieListResponse>(`/trending/movie/${window}`)
}

export function getMovieDetails(movieId: number) {
  return tmdbFetch<TMDBMovieDetails>(`/movie/${movieId}`, {
    append_to_response: 'credits,videos',
  })
}

/** Everything the film page shows, in one request. */
export function getFilm(movieId: number) {
  return tmdbFetch<TMDBFilm>(`/movie/${movieId}`, {
    append_to_response: 'credits,videos,similar,images,release_dates',
    include_image_language: 'en,null',
  })
}

export function getGenres() {
  return tmdbFetch<TMDBGenresResponse>('/genre/movie/list')
}

export function imageUrl(path: string | null | undefined, size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500') {
  return path ? `${IMAGE_BASE}/${size}${path}` : null
}

/** The YouTube trailer to show: an official trailer first, then any trailer. */
export function pickTrailer(videos: { results: TMDBVideo[] } | undefined): TMDBVideo | null {
  const trailers = (videos?.results ?? []).filter(v => v.site === 'YouTube' && v.type === 'Trailer')
  return trailers.find(v => v.official) ?? trailers[0] ?? null
}

export function trailerWatchUrl(videos: { results: TMDBVideo[] } | undefined) {
  const trailer = pickTrailer(videos)
  return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null
}

/**
 * The age rating TMDB has for the first region in `regions` that has one,
 * e.g. "PG-13". Null when TMDB has none, so the page shows nothing rather
 * than a guess.
 */
export function pickCertification(releaseDates: TMDBReleaseDates | undefined, regions = ['US', 'GB', 'CZ']) {
  for (const region of regions) {
    const entry = releaseDates?.results.find(r => r.iso_3166_1 === region)
    const certification = entry?.release_dates.map(d => d.certification.trim()).find(Boolean)
    if (certification) return { region, certification }
  }
  return null
}
