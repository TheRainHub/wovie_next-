import type { Prisma } from '@prisma/client'
import { prisma } from './db'
import { PAGE_SIZE, type CatalogueQuery } from './catalog-query'
import { getMovieDetails, getTrendingMovies, imageUrl, TMDBNotFoundError, trailerWatchUrl } from './tmdb'
import type { TMDBMovie, TMDBMovieDetails } from './tmdb-types'

/** What a poster card, banner or list needs about a film. */
export const movieCardSelect = {
  id: true,
  title: true,
  description: true,
  posterUrl: true,
  backdropUrl: true,
  releaseDate: true,
  rating: true,
  voteCount: true,
  runtime: true,
  genres: { select: { genre: { select: { id: true, name: true } } } },
} satisfies Prisma.MovieSelect

export type CatalogueMovie = Prisma.MovieGetPayload<{ select: typeof movieCardSelect }>

const ORDER: Record<CatalogueQuery['sort'], Prisma.MovieOrderByWithRelationInput[]> = {
  popular: [{ popularity: 'desc' }, { id: 'asc' }],
  top: [{ weightedRating: 'desc' }, { id: 'asc' }],
  new: [{ releaseDate: { sort: 'desc', nulls: 'last' } }, { id: 'asc' }],
  title: [{ title: 'asc' }, { id: 'asc' }],
}

export async function listMovies(query: CatalogueQuery, take = PAGE_SIZE) {
  const where: Prisma.MovieWhereInput = {}
  if (query.genre) where.genres = { some: { genreId: query.genre } }
  if (query.q) where.title = { contains: query.q, mode: 'insensitive' }
  // "Newest" lists films that are out, not announcements.
  if (query.sort === 'new') where.releaseDate = { lte: new Date() }

  const skip = (query.page - 1) * take
  const [movies, total] = await Promise.all([
    prisma.movie.findMany({ where, orderBy: ORDER[query.sort], skip, take, select: movieCardSelect }),
    prisma.movie.count({ where }),
  ])
  return { movies, total, hasMore: skip + movies.length < total }
}

/** Genres that have at least one film in the catalogue, for the filter chips. */
export function listGenres() {
  return prisma.genre.findMany({
    where: { movies: { some: {} } },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })
}

/**
 * Today's trending films according to TMDB, in card shape. Read live (cached
 * for an hour) rather than from the database, because trending changes daily
 * and is not what the catalogue stores. Empty when TMDB can't be reached, so
 * the page still renders from the database.
 */
export async function trendingMovies(limit = 6): Promise<CatalogueMovie[]> {
  try {
    const [{ results }, genres] = await Promise.all([
      getTrendingMovies('day'),
      prisma.genre.findMany({ select: { id: true, name: true } }),
    ])
    const genreById = new Map(genres.map(g => [g.id, g]))
    return results
      .filter(m => m.backdrop_path)
      .slice(0, limit)
      .map(m => ({
        id: m.id,
        title: m.title,
        description: m.overview || null,
        posterUrl: imageUrl(m.poster_path, 'w500'),
        backdropUrl: imageUrl(m.backdrop_path, 'original'),
        releaseDate: m.release_date ? new Date(m.release_date) : null,
        rating: m.vote_average,
        voteCount: m.vote_count,
        runtime: null,
        genres: m.genre_ids.flatMap(id => (genreById.has(id) ? [{ genre: genreById.get(id)! }] : [])),
      }))
  } catch (error) {
    console.error('Could not load trending films from TMDB', error)
    return []
  }
}

/** Ids of films the user has favourited, out of `movieIds`. */
export async function favoriteIds(userId: string | undefined, movieIds: number[]) {
  if (!userId || movieIds.length === 0) return new Set<number>()
  const rows = await prisma.favorite.findMany({
    where: { userId, movieId: { in: movieIds } },
    select: { movieId: true },
  })
  return new Set(rows.map(r => r.movieId))
}

/** Columns that come straight from a TMDB list entry or details response. */
export function movieFields(movie: TMDBMovie | TMDBMovieDetails) {
  return {
    title: movie.title,
    description: movie.overview || null,
    posterUrl: imageUrl(movie.poster_path, 'w500'),
    backdropUrl: imageUrl(movie.backdrop_path, 'original'),
    releaseDate: movie.release_date ? new Date(movie.release_date) : null,
    rating: movie.vote_average ?? 0,
    voteCount: movie.vote_count ?? 0,
    popularity: movie.popularity ?? 0,
    syncedAt: new Date(),
  }
}

/** Store a film from its TMDB details, with genres and top-billed cast. */
export async function saveMovieDetails(details: TMDBMovieDetails) {
  const fields = { ...movieFields(details), runtime: details.runtime, trailerUrl: trailerWatchUrl(details.videos) }
  // Shared rows (genres, actors) are locked in id order, so films saved in
  // parallel can't deadlock on each other.
  const genres = [...details.genres].sort((a, b) => a.id - b.id)
  const cast = details.credits.cast
    .slice(0, 5)
    .filter((c, i, all) => all.findIndex(o => o.id === c.id) === i)
    .sort((a, b) => a.id - b.id)

  await prisma.$transaction([
    ...genres.map(g =>
      prisma.genre.upsert({ where: { id: g.id }, update: { name: g.name }, create: { id: g.id, name: g.name } }),
    ),
    ...cast.map(c =>
      prisma.actor.upsert({
        where: { id: c.id },
        update: { name: c.name, profilePhoto: imageUrl(c.profile_path, 'w185') },
        create: { id: c.id, name: c.name, profilePhoto: imageUrl(c.profile_path, 'w185') },
      }),
    ),
    prisma.movie.upsert({ where: { id: details.id }, update: fields, create: { id: details.id, ...fields } }),
    prisma.movieGenre.deleteMany({ where: { movieId: details.id } }),
    prisma.movieGenre.createMany({ data: genres.map(g => ({ movieId: details.id, genreId: g.id })) }),
    ...cast.map(c =>
      prisma.movieActor.upsert({
        where: { movieId_actorId: { movieId: details.id, actorId: c.id } },
        update: { role: c.character },
        create: { movieId: details.id, actorId: c.id, role: c.character },
      }),
    ),
  ])
}

/**
 * Make sure a film is in the database before someone favourites, lists or
 * rates it. Film pages read TMDB directly, so a film reached from "Similar" or
 * "Trending" may not be stored yet. Returns false when TMDB has no such film.
 */
export async function ensureMovie(movieId: number) {
  const existing = await prisma.movie.findUnique({ where: { id: movieId }, select: { id: true } })
  if (existing) return true
  try {
    await saveMovieDetails(await getMovieDetails(movieId))
    return true
  } catch (error) {
    if (error instanceof TMDBNotFoundError) return false
    throw error
  }
}
