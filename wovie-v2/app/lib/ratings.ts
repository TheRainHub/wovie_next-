// How Wovie turns raw votes into the scores it shows. Pure functions only, so
// the maths is unit-tested (ratings.test.ts) and shared by sync and pages.

export interface Rated {
  rating: number // average on a 0–10 scale
  voteCount: number
}

export interface Baseline {
  /** Mean rating across the catalogue (C in the IMDb formula). */
  mean: number
  /** Votes a film needs before its own average counts for half (m). */
  minVotes: number
}

/**
 * The catalogue's own baseline: the mean rating of films that have votes, and
 * the median vote count as the weight of that mean. Derived from the data on
 * every sync rather than fixed, so it follows the catalogue as it grows.
 */
export function catalogueBaseline(films: Rated[]): Baseline {
  const voted = films.filter(f => f.voteCount > 0)
  if (voted.length === 0) return { mean: 0, minVotes: 1 }

  const mean = voted.reduce((sum, f) => sum + f.rating, 0) / voted.length
  const counts = voted.map(f => f.voteCount).sort((a, b) => a - b)
  const middle = Math.floor(counts.length / 2)
  const median = counts.length % 2 ? counts[middle] : (counts[middle - 1] + counts[middle]) / 2
  return { mean, minVotes: Math.max(1, median) }
}

/**
 * IMDb-style Bayesian average: a film's own average, pulled towards the
 * catalogue mean until it has enough votes to stand on its own. A 9.2 from 12
 * votes no longer outranks an 8.5 from 30,000. Films without votes score 0 so
 * they sink instead of landing on the mean.
 */
export function weightedRating({ rating, voteCount }: Rated, { mean, minVotes }: Baseline) {
  if (voteCount <= 0) return 0
  const weight = voteCount / (voteCount + minVotes)
  return weight * rating + (1 - weight) * mean
}

/** The Wovie rating: the plain average of what signed-in people gave a film. */
export function communityScore(average: number | null, count: number) {
  if (!count || average === null) return null
  return { average: Math.round(average * 10) / 10, count }
}

/** A user's score must be a whole number from 1 to 10. */
export function isValidUserRating(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 10
}
