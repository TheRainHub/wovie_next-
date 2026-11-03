import { describe, expect, it } from 'vitest'
import { catalogueBaseline, communityScore, isValidUserRating, weightedRating } from './ratings'

describe('catalogueBaseline', () => {
  it('takes the mean rating and the median vote count of films with votes', () => {
    const baseline = catalogueBaseline([
      { rating: 8, voteCount: 100 },
      { rating: 6, voteCount: 300 },
      { rating: 7, voteCount: 200 },
      { rating: 9, voteCount: 0 }, // no votes: ignored
    ])
    expect(baseline.mean).toBeCloseTo(7)
    expect(baseline.minVotes).toBe(200)
  })

  it('averages the two middle counts for an even number of films', () => {
    expect(catalogueBaseline([{ rating: 5, voteCount: 10 }, { rating: 5, voteCount: 30 }]).minVotes).toBe(20)
  })

  it('has a usable baseline for an empty catalogue', () => {
    expect(catalogueBaseline([])).toEqual({ mean: 0, minVotes: 1 })
  })
})

describe('weightedRating', () => {
  const baseline = { mean: 7, minVotes: 1000 }

  it('lets a well-voted 8.5 outrank a 9.2 from a handful of votes', () => {
    const fewVotes = weightedRating({ rating: 9.2, voteCount: 12 }, baseline)
    const manyVotes = weightedRating({ rating: 8.5, voteCount: 30000 }, baseline)
    expect(manyVotes).toBeGreaterThan(fewVotes)
  })

  it('is halfway between the film and the mean at exactly minVotes', () => {
    expect(weightedRating({ rating: 9, voteCount: 1000 }, baseline)).toBeCloseTo(8)
  })

  it('approaches the film’s own rating as votes grow', () => {
    expect(weightedRating({ rating: 9, voteCount: 10_000_000 }, baseline)).toBeCloseTo(9, 2)
  })

  it('scores a film without votes as 0', () => {
    expect(weightedRating({ rating: 10, voteCount: 0 }, baseline)).toBe(0)
  })
})

describe('communityScore', () => {
  it('rounds the average to one decimal', () => {
    expect(communityScore(7.6666, 3)).toEqual({ average: 7.7, count: 3 })
  })

  it('is null when nobody has rated', () => {
    expect(communityScore(null, 0)).toBeNull()
  })
})

describe('isValidUserRating', () => {
  it.each([1, 5, 10])('accepts %s', value => expect(isValidUserRating(value)).toBe(true))
  it.each([0, 11, 7.5, '8', null, undefined])('rejects %s', value => expect(isValidUserRating(value)).toBe(false))
})
