import { prisma } from './db'
import { movieFields, saveMovieDetails } from './catalog'
import { catalogueBaseline, weightedRating } from './ratings'
import { getGenres, getMovieDetails, getPopularMovies, TMDBNotFoundError } from './tmdb'
import type { TMDBMovie } from './tmdb-types'

// The catalogue is a copy of TMDB's popular list, kept in Postgres so pages
// don't depend on TMDB being up. A sync adds new films, refreshes the scores
// of the ones already stored, then recomputes the weighted ratings.

const POPULAR_PAGES = 15 // 20 films a page: the 300 most popular films
const REFRESH_OUTSIDE_POPULAR = 40 // stored films no longer in that list, oldest first
const DETAIL_CONCURRENCY = 5
const FRESH_FOR_SECONDS = 6 * 60 * 60
const LOCK_FOR_SECONDS = 10 * 60
const SYNC_ID = 'catalog'

async function mapLimit<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  let next = 0
  const worker = async () => {
    while (next < items.length) await fn(items[next++])
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
}

/**
 * Take the sync slot if no run is in progress and the last one is not recent.
 * One SQL statement, so two server instances can't both win. Timestamps are
 * UTC, like the ones Prisma writes.
 */
async function claimSync({ force = false } = {}) {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    INSERT INTO "CatalogSync" ("id", "startedAt") VALUES (${SYNC_ID}, now() AT TIME ZONE 'UTC')
    ON CONFLICT ("id") DO UPDATE SET "startedAt" = now() AT TIME ZONE 'UTC'
    WHERE NOT (
      ("CatalogSync"."startedAt" > now() AT TIME ZONE 'UTC' - make_interval(secs => ${LOCK_FOR_SECONDS})
        AND ("CatalogSync"."finishedAt" IS NULL OR "CatalogSync"."finishedAt" < "CatalogSync"."startedAt"))
      OR (${!force} AND "CatalogSync"."finishedAt" >= "CatalogSync"."startedAt"
        AND "CatalogSync"."finishedAt" > now() AT TIME ZONE 'UTC' - make_interval(secs => ${FRESH_FOR_SECONDS}))
    )
    RETURNING "id"`
  return rows.length > 0
}

async function finishSync() {
  await prisma.catalogSync.update({ where: { id: SYNC_ID }, data: { finishedAt: new Date() } })
}

/** Recompute every film's weighted rating against the current catalogue. */
export async function recomputeWeightedRatings() {
  const films = await prisma.movie.findMany({ select: { id: true, rating: true, voteCount: true } })
  const baseline = catalogueBaseline(films)
  const ids = films.map(f => f.id)
  const scores = films.map(f => weightedRating(f, baseline))
  await prisma.$executeRaw`
    UPDATE "Movie" AS m SET "weightedRating" = u.score
    FROM unnest(${ids}::int[], ${scores}::float8[]) AS u(id, score)
    WHERE m."id" = u.id`
  return baseline
}

/**
 * Write the list's data to films already stored, in one statement. The
 * functions and the database sit in different regions, so a round trip per
 * film adds up: 300 updates in one transaction outlast its 5 s limit.
 */
async function refreshFromList(films: TMDBMovie[]) {
  if (films.length === 0) return
  const rows = films.map(f => ({ id: f.id, ...movieFields(f) }))
  await prisma.$executeRaw`
    UPDATE "Movie" AS m SET
      "title" = u.title, "description" = u.description, "posterUrl" = u.poster_url,
      "backdropUrl" = u.backdrop_url, "releaseDate" = u.release_date, "rating" = u.rating,
      "voteCount" = u.vote_count, "popularity" = u.popularity, "syncedAt" = now() AT TIME ZONE 'UTC'
    FROM unnest(
      ${rows.map(r => r.id)}::int[],
      ${rows.map(r => r.title)}::text[],
      ${rows.map(r => r.description)}::text[],
      ${rows.map(r => r.posterUrl)}::text[],
      ${rows.map(r => r.backdropUrl)}::text[],
      ${rows.map(r => r.releaseDate?.toISOString() ?? null)}::timestamp(3)[],
      ${rows.map(r => r.rating)}::float8[],
      ${rows.map(r => r.voteCount)}::int[],
      ${rows.map(r => r.popularity)}::float8[]
    ) AS u(id, title, description, poster_url, backdrop_url, release_date, rating, vote_count, popularity)
    WHERE m."id" = u.id`
}

async function runSync() {
  const { genres } = await getGenres()
  await prisma.$transaction(
    genres.map(g => prisma.genre.upsert({ where: { id: g.id }, update: { name: g.name }, create: g })),
  )

  const popular = new Map<number, Awaited<ReturnType<typeof getPopularMovies>>['results'][number]>()
  for (let page = 1; page <= POPULAR_PAGES; page++) {
    const { results, total_pages } = await getPopularMovies(page)
    for (const movie of results) popular.set(movie.id, movie)
    if (page >= total_pages) break
  }

  const stored = new Set(
    (await prisma.movie.findMany({ where: { id: { in: [...popular.keys()] } }, select: { id: true } })).map(m => m.id),
  )

  // Films already stored: the list entry carries fresh scores, no extra request.
  const refreshed = [...popular.values()].filter(m => stored.has(m.id))
  await refreshFromList(refreshed)

  // New films: one details request each, for runtime, trailer, genres and cast.
  const added: number[] = []
  const failed: number[] = []
  const fresh = [...popular.values()].filter(m => !stored.has(m.id))
  await mapLimit(fresh, DETAIL_CONCURRENCY, async movie => {
    try {
      await saveMovieDetails(await getMovieDetails(movie.id))
      added.push(movie.id)
    } catch (error) {
      failed.push(movie.id)
      console.error(`Catalogue sync: could not add film ${movie.id}`, error)
    }
  })

  // Stored films that dropped out of the popular list still deserve current scores.
  const stale = await prisma.movie.findMany({
    where: { id: { notIn: [...popular.keys()] } },
    orderBy: { syncedAt: 'asc' },
    take: REFRESH_OUTSIDE_POPULAR,
    select: { id: true },
  })
  await mapLimit(stale, DETAIL_CONCURRENCY, async ({ id }) => {
    try {
      const details = await getMovieDetails(id)
      await prisma.movie.update({ where: { id }, data: { ...movieFields(details), runtime: details.runtime } })
    } catch (error) {
      // Gone from TMDB: keep the row (people may have it in lists), stop retrying first.
      if (error instanceof TMDBNotFoundError) await prisma.movie.update({ where: { id }, data: { syncedAt: new Date() } })
      else console.error(`Catalogue sync: could not refresh film ${id}`, error)
    }
  })

  const baseline = await recomputeWeightedRatings()
  const total = await prisma.movie.count()
  return { added: added.length, refreshed: refreshed.length + stale.length, failed: failed.length, total, baseline }
}

/**
 * Sync unless one is running or finished within the last six hours. Called
 * after the catalogue page renders, so the first visitor after a quiet spell
 * refreshes the data without waiting for it. `force` skips the freshness check
 * (seed script), never the in-progress lock.
 */
export async function syncCatalog({ force = false } = {}) {
  if (!(await claimSync({ force }))) return null
  try {
    const result = await runSync()
    await finishSync()
    return result
  } catch (error) {
    // The lock expires on its own, so the next visit after it retries.
    console.error('Catalogue sync failed', error)
    return null
  }
}
